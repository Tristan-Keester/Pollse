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
            let mut buffy = [0; 128];
            match stream.read(&mut buffy) {
                Ok(_) => (),
                _ => {
                    break;
                },
            };

            let (length, mask) = match buffy[1] - 128 {
                len if len <= 125 => (
                    (buffy[1] - 128 + 6) as usize,
                    [buffy[2], buffy[3], buffy[4], buffy[5]]
                ),
                len if len == 126 => (
                    u16::from_be_bytes([buffy[2], buffy[3]]) as usize,
                    [buffy[4], buffy[5], buffy[6], buffy[7]]
                ),
                len if len == 127 => {
                    let mut bytes: [u8; 8] = [0; 8];
                    for i in 2..=9 {
                        bytes[i - 2] = buffy[i];
                    }

                    (u64::from_be_bytes(bytes) as usize, [buffy[10], buffy[11], buffy[12], buffy[13]])
                },
                len => {
                    panic!("Couldn't match websocket length! len was {:?}", len);
                }
            };

            let mut encoded: Vec<u8> = Vec::new();

            println!("{:?}\n{:#?}", length - 6, mask);
            for i in 6..length as usize {
                encoded.push(buffy[i]);
            }

            let mut decoded = Vec::new();

            for i in 0..encoded.len() {
                decoded.push((encoded[i] ^ mask[i % 4]) as char);
            }

            let string: String = decoded.iter().collect();

            println!("{}", string);
        }
    });
}

fn create_ws_hash(key: &str) -> String {
    let to_hash = key[(key.find(':').unwrap() + 2)..key.len()].to_string() + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";

    let mut hasher = Sha1::new();
    hasher.update(to_hash);
    let result = hasher.finalize();


    general_purpose::STANDARD.encode(&result)
}
