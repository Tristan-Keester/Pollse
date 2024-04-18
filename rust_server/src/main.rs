use rust_server::{
    error_handler, 
    routers::{
        general_router,
        poll_router
    }
};

use std::{
    io::prelude::*, 
    net::{TcpListener, TcpStream}
};

fn main() {
    let listener = TcpListener::bind("127.0.0.1:3000").unwrap();

    for stream in listener.incoming() {
        let stream = stream.unwrap();

        handle_connection(stream);
    }
}

fn handle_connection(mut stream: TcpStream) {
    let mut buffer = [0; 1024];
    stream.read(&mut buffer).unwrap();
    let req_as_str = std::str::from_utf8(&buffer).unwrap();
    let end_bytes = req_as_str.find("\0").unwrap_or(req_as_str.len());

    let req: Vec<&str> = req_as_str[0..end_bytes].split("\r\n").collect();

    // let body: serde_json::Value = serde_json::from_str(req[req.len() -1]).unwrap();

    let response = match req[0].to_string() {
        rl if rl.contains("/api/poll") => poll_router::route(req),
        rl if rl.contains("/") => general_router::route(req),
        _ => error_handler::route(), 
    };

    stream.write_all(response.as_bytes()).unwrap();
}
