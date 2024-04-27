use rusqlite::Connection;
use sha1::{Sha1, Digest};
use base64::{engine::general_purpose, Engine as _};

use rust_server::{
    error_handler, 
    routers::{
        general_router,
        poll_router
    },
    database::connection
};

use std::{
    io::prelude::*, 
    net::{TcpListener, TcpStream}
};

fn main() {
    let listener = TcpListener::bind("127.0.0.1:3000").unwrap();
    let conn = connection::connect().unwrap();

    for stream in listener.incoming() {
        let stream = stream.unwrap();

        handle_connection(stream, &conn);
    }
}

fn handle_connection(mut stream: TcpStream, conn: &Connection) {
    let mut buffer = [0; 1024];
    stream.read(&mut buffer).unwrap();
    let req_as_str = std::str::from_utf8(&buffer).unwrap();
    let end_bytes = req_as_str.find("\0").unwrap_or(req_as_str.len());

    let req: Vec<&str> = req_as_str[0..end_bytes].split("\r\n").collect();

    // WS
    if req[0].to_string().contains("/api/socketserver") {

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

        loop {
            let mut buffy = [0; 128];
            stream.read(&mut buffy).unwrap();

            let length = buffy[1] - 128 + 6;
            let mask = [buffy[2], buffy[3], buffy[4], buffy[5]];
            let mut encoded: Vec<u8> = Vec::new();

            for i in 6..17 {
                encoded.push(buffy[i]);
            }

            let mut decoded = Vec::new();

            for i in 0..encoded.len() {
                decoded.push((encoded[i] ^ mask[i % 4]) as char);
            }

            let string: String = decoded.iter().collect();

            println!("{}", string);

        }
    }

    // Normal HTTP stuff
    let response = match req[0].to_string() {
        rl if rl.contains("/api/poll") => poll_router::route(req, conn),
        rl if rl.contains("/") => general_router::route(req),
        _ => error_handler::route(), 
    };

    stream.write_all(response.as_bytes()).unwrap();
}

fn create_ws_hash(key: &str) -> String {
    let to_hash = key[(key.find(':').unwrap() + 2)..key.len()].to_string() + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";

    let mut hasher = Sha1::new();
    hasher.update(to_hash);
    let result = hasher.finalize();


    general_purpose::STANDARD.encode(&result)
}
