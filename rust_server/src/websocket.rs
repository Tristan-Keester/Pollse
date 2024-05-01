use sha1::{Sha1, Digest};
use base64::{engine::general_purpose, Engine as _};

use std::{
    io::prelude::*,
    net::TcpStream,
    thread::spawn,
    time::Duration
};

pub fn continue_connection(mut stream: TcpStream, req: Vec<&str>) {
    let ws_hash = create_ws_hash(req[10]);

    let (status_line, upgrade, connection, sec_websocket_accept) = (
        "HTTP/1.1 101 Switching Protocols",
        "Upgrade: websocket",
        "Connection: Upgrade",
        format!("Sec-WebSocket-Accept: {ws_hash}"), 
    );
    let response = format!("{status_line}\r\n{upgrade}\r\n{connection}\r\n{sec_websocket_accept}\r\n\r\n");

    println!("{}", response);
    stream.write_all(response.as_bytes()).unwrap();

    spawn (move || {
        stream.set_read_timeout(Some(Duration::new(60, 0))).expect("Should be able to set read timeout");

        loop {
            let mut initial_size_buf = [0; 14];
            match stream.peek(&mut initial_size_buf) {
                Ok(_) => (),
                _ => {
                    break;
                },
            };

            println!("{:#?}", initial_size_buf[0]);
            let (length, mask) = match initial_size_buf[1] - 128 {
                len if len <= 125 => (
                    (initial_size_buf[1] - 128 + 6) as usize,
                    [initial_size_buf[2], initial_size_buf[3], initial_size_buf[4], initial_size_buf[5]]
                ),
                len if len == 126 => (
                    u16::from_be_bytes([initial_size_buf[2], initial_size_buf[3]]) as usize,
                    [initial_size_buf[4], initial_size_buf[5], initial_size_buf[6], initial_size_buf[7]]
                ),
                len if len == 127 => {
                    let mut bytes: [u8; 8] = [0; 8];
                    for i in 2..=9 {
                        bytes[i - 2] = initial_size_buf[i];
                    }

                    (u64::from_be_bytes(bytes) as usize, [initial_size_buf[10], initial_size_buf[11], initial_size_buf[12], initial_size_buf[13]])
                },
                len => {
                    panic!("Couldn't match websocket length! len was {:?}", len);
                }
            };

            let mut buffer = vec![0; length];
            stream.read_exact(&mut buffer).unwrap();

            let mut encoded: Vec<u8> = Vec::new();
            for i in 6..length {
                encoded.push(buffer[i]);
            }

            println!("len: {:?}\nmask: {:#?}\nencoded: {:#?}", initial_size_buf[1], mask, encoded);
            let mut decoded = Vec::new();
            for i in 0..encoded.len() {
                decoded.push((encoded[i] ^ mask[i % 4]) as char);
            }

            let string: String = decoded.iter().collect();

            println!("{}", string);

            let reply = format_reply("does this work");
            // let r_mask = [131, 106, 20, 80];
            // let reply: Vec<u8> = Vec::from([129, 128 + 4, 131, 106, 20, 80, 'h' as u8 ^ r_mask[0], 'e' as u8 ^ r_mask[1], 'h' as u8 ^ r_mask[2], 'e' as u8 ^ r_mask[3]]);
            println!("reply: {:#?}", reply);
            stream.write_all(&reply).unwrap();
            println!("end of loop");
        }
    });
}

fn format_reply(str: &str) -> Vec<u8> {
    let reply_mask = [rand::random::<u8>(), rand::random::<u8>(), rand::random::<u8>(), rand::random::<u8>()];
    let mut reply: Vec<u8> = Vec::from([129, str.len() as u8 + 128, reply_mask[0], reply_mask[1], reply_mask[2], reply_mask[3]]);

    for (i, c) in str.chars().enumerate() {
        reply.push(c as u8 ^ reply_mask[i % 4]);
    }

    reply
}


fn create_ws_hash(key: &str) -> String {
    let to_hash = key[(key.find(':').unwrap() + 2)..key.len()].to_string() + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";

    let mut hasher = Sha1::new();
    hasher.update(to_hash);
    let result = hasher.finalize();


    general_purpose::STANDARD.encode(&result)
}
