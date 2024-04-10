use std::{
    fs,
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

    let (status_line, contents) = match request_line.as_str() {
        "POST /api/poll/create HTTP/1.1" => ("HTTP/1.1 200 OK", String::from("Hey it's still working!")),
        "GET /bundle.js HTTP/1.1" => ("HTTP/1.1 200 OK", fs::read_to_string("../dist/bundle.js").expect("Failed to find bundle.js")),
        "GET / HTTP/1.1" => ("HTTP/1.1 200 OK", fs::read_to_string("../dist/index.html").expect("Failed to find index.html for 200")),
        _ => ("HTTP/1.1 404 NOT FOUND", fs::read_to_string("../dist/index.html").expect("Failed to find index.html for 404")),
    };

    let length = contents.len();

    let response =
        format!("{status_line}\r\nContent-Length: {length}\r\n\r\n{contents}");

    stream.write_all(response.as_bytes()).unwrap();
}
