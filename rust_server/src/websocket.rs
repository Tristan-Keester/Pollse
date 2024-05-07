use sha1::{Sha1, Digest};
use base64::{engine::general_purpose, Engine as _};

use std::{
    io::prelude::*,
    net::TcpStream,
    sync::mpsc::Receiver,
    thread::spawn,
    time::Duration
};

pub fn continue_connection(mut stream: TcpStream, req: Vec<&str>, receiver: Receiver<String>) {
    let ws_hash = create_ws_hash(req[10]);

    let (status_line, upgrade, connection, sec_websocket_accept) = (
        "HTTP/1.1 101 Switching Protocols",
        "Upgrade: websocket",
        "Connection: Upgrade",
        format!("Sec-WebSocket-Accept: {ws_hash}"), 
    );
    let response = format!("{status_line}\r\n{upgrade}\r\n{connection}\r\n{sec_websocket_accept}\r\n\r\n");

    stream.write_all(response.as_bytes()).unwrap();

    spawn (move || {
        stream.set_read_timeout(Some(Duration::new(1, 0))).expect("Should be able to set read timeout");

        let mut has_pinged = false;
        let mut initiated_close = false;

        loop {
            let mut initial_size_buf = [0; 14];
            match stream.peek(&mut initial_size_buf) {
                Ok(_) => (),
                _ => {
                    if has_pinged {
                        if initiated_close {
                            break;
                        }
                        else {
                            initiated_close = true;
                            send_close_frame(&stream);
                            continue;
                        }
                    }
                    else {
                        let ping = create_ping();
                        stream.write_all(&ping).unwrap();
                        has_pinged = true;
                        continue;
                    }
                },
            };

            match initial_size_buf[0] {
                129 => {
                    // Shouldn't be receiving anything data from client side, so we just throw it out
                    let _ = stream.read(&mut [0; 128]);
                },
                136 => {
                    if !initiated_close {
                        send_close_frame(&stream);
                    }
                    break;
                }
                137 => {
                    let reply = return_ping(&stream, initial_size_buf);
                    stream.write_all(&reply).unwrap();
                }
                138 => {
                    has_pinged = false;
                    decode_frame(&stream, initial_size_buf);
                },
                err => {
                    println!("Received unknown opcode: {:?}", err);
                    initiated_close = true;
                    let close = create_frame("", 136);
                    stream.write_all(&close).unwrap();
                }
            }

            let result = receiver.try_recv();
            match result {
                Ok(val) => {
                    let reply = create_frame(val.as_str(), 129);
                    stream.write_all(&reply).unwrap();
                },
                _ => (),
            }
        }
    });
}

fn decode_frame(mut stream: &TcpStream, initial_buf: [u8; 14]) -> String {
    let (length, mask) = decode_payload_length(initial_buf);

    let mut content_buffer = vec![0; length];
    stream.read_exact(&mut content_buffer).unwrap();

    let mut encoded: Vec<u8> = Vec::new();
    for i in 6..length {
        encoded.push(content_buffer[i]);
    }

    let mut decoded = Vec::new();
    for i in 0..encoded.len() {
        decoded.push((encoded[i] ^ mask[i % 4]) as char);
    }

    decoded.iter().collect()
}

fn decode_payload_length(buf: [u8; 14]) -> (usize, [u8; 4]) {
    match buf[1] - 128 {
        len if len <= 125 => (
            (buf[1] - 128 + 6) as usize,
            [buf[2], buf[3], buf[4], buf[5]]
        ),
        len if len == 126 => (
            u16::from_be_bytes([buf[2], buf[3]]) as usize,
            [buf[4], buf[5], buf[6], buf[7]]
        ),
        len if len == 127 => {
            let mut bytes: [u8; 8] = [0; 8];
            for i in 2..=9 {
                bytes[i - 2] = buf[i];
            }

            (u64::from_be_bytes(bytes) as usize, [buf[10], buf[11], buf[12], buf[13]])
        },
        len => {
            panic!("Couldn't match websocket length! len was {:?}", len);
        }
    }
}

fn create_frame(content: &str, first_byte: u8) -> Vec<u8> {
    let reply_mask = [
        rand::random::<u8>(),
        rand::random::<u8>(),
        rand::random::<u8>(),
        rand::random::<u8>()
    ];
    let mut reply: Vec<u8> = Vec::from([
        first_byte,
        content.len() as u8 + 128,
        reply_mask[0],
        reply_mask[1],
        reply_mask[2],
        reply_mask[3]
    ]);

    for (i, c) in content.chars().enumerate() {
        reply.push(c as u8 ^ reply_mask[i % 4]);
    }

    reply
}

fn send_close_frame(mut stream: &TcpStream) {
    let reply = create_frame("", 136);
    stream.write_all(&reply).unwrap();
}

fn return_ping(stream: &TcpStream, buf: [u8; 14]) -> Vec<u8> {
   create_frame(decode_frame(stream, buf).as_str(), 138) 
}

fn create_ping() -> Vec<u8> {
    create_frame("ping", 137)
}

fn create_ws_hash(key: &str) -> String {
    let to_hash = key[(key.find(':').unwrap() + 2)..key.len()].to_string() + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";

    let mut hasher = Sha1::new();
    hasher.update(to_hash);
    let result = hasher.finalize();


    general_purpose::STANDARD.encode(&result)
}
