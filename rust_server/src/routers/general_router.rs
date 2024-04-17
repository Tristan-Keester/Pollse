use crate::error_handler;

use std::fs;

pub fn route(request_line: String) -> String {
    let (status_line, contents) = match request_line.as_str() {
        "GET /bundle.js HTTP/1.1" => ("HTTP/1.1 200 OK", fs::read_to_string("../dist/bundle.js").expect("Failed to find bundle.js")),
        "GET / HTTP/1.1" => ("HTTP/1.1 200 OK", fs::read_to_string("../dist/index.js").expect("Failed to find index.js for 200")),
        _ => error_handler::context(),
    };

    let length = contents.len();

    format!("{status_line}\r\nContent-Length: {length}\r\n\r\n{contents}")

}

