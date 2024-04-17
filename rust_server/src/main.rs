use rust_server::{
    error_handler, 
    routers::{
        general_router,
        poll_router
    }
};

use std::{
    io::{prelude::*, BufReader},
    net::{TcpListener, TcpStream},
};

fn main() {
    let listener = TcpListener::bind("127.0.0.1:3000").unwrap();

    for stream in listener.incoming() {
        let stream = stream.unwrap();

        handle_connection(stream);
    }
}

fn handle_connection(mut stream: TcpStream) {
    let buf_reader = BufReader::new(&mut stream);
    let request_line = buf_reader.lines().next().unwrap().unwrap();
    println!("{:?}", request_line);

    let response = match request_line {
        rl if rl.contains("/api/poll") => poll_router::route(rl),
        rl if rl.contains("/") => general_router::route(rl),
        _ => error_handler::route(), 
    };

    stream.write_all(response.as_bytes()).unwrap();
}

