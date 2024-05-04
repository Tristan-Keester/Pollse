use rusqlite::Connection;

use rust_server::{
    error_handler, 
    routers::{
        general_router,
        poll_router
    },
    database::connection,
    websocket
};

use std::{
    collections::HashMap,
    io::prelude::*, 
    net::{TcpListener, TcpStream},
    sync::mpsc::{channel, Sender}
};

fn main() {
    let listener = TcpListener::bind("127.0.0.1:3000").unwrap();
    let conn = connection::connect().unwrap();
    let mut socket_senders: HashMap<String, Vec<Sender<String>>> = HashMap::new();

    for stream in listener.incoming() {
        let stream = stream.unwrap();

        handle_connection(stream, &conn, &mut socket_senders);
    }
}

fn handle_connection(mut stream: TcpStream, conn: &Connection, socket_senders: &mut HashMap<String, Vec<Sender<String>>>) {
    let mut buffer = [0; 1024];
    stream.read(&mut buffer).unwrap();
    let req_as_str = std::str::from_utf8(&buffer).unwrap();
    let end_bytes = req_as_str.find("\0").unwrap_or(req_as_str.len());

    let req: Vec<&str> = req_as_str[0..end_bytes].split("\r\n").collect();

    // WS
    if req[0].to_string().contains("/api/socketserver") {
        let request_line: Vec<&str> = req[0].split(" ").collect();
        let poll_id = &request_line[1][(request_line[1].rfind('/').expect("Should find /") + 1)..request_line[1].len()]; 

        let (sender, receiver) = channel();

        let senders_vec = socket_senders.entry(poll_id.to_string()).or_insert(Vec::new());
        senders_vec.push(sender);

        websocket::continue_connection(stream, req, receiver);
        return;
    }

    // Normal HTTP stuff
    let response = match req[0].to_string() {
        rl if rl.contains("/api/poll") => poll_router::route(req, conn, socket_senders),
        rl if rl.contains("/") => general_router::route(req),
        _ => error_handler::route(), 
    };

    stream.write_all(response.as_bytes()).unwrap();
}

