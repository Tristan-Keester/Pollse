use crate::error_handler;

use std::fs;

pub fn route(req: Vec<&str>) -> String {
    let request_line = req[0];

    let (status_line, contents) = match request_line {
        "GET /bundle.js HTTP/1.1" => ("HTTP/1.1 200 OK", fs::read_to_string("../dist/bundle.js").expect("Failed to find bundle.js")),
        "GET / HTTP/1.1" => ("HTTP/1.1 200 OK", fs::read_to_string("../dist/index.js").expect("Failed to find index.js for 200")),
        _ => error_handler::context(),
    };

    let length = contents.len();

    format!("{status_line}\r\nContent-Length: {length}\r\n\r\n{contents}")

}

