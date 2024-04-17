use crate::error_handler;

pub fn route(request_line: String) -> String {
     let (status_line, contents) = match request_line.as_str() {
        "POST /api/poll/create HTTP/1.1" => ("HTTP/1.1 200 OK", String::from("We come from the poll_router lands")),
        _ => error_handler::context(),
    };

    let length = contents.len();

    format!("{status_line}\r\nContent-Length: {length}\r\n\r\n{contents}")
}
