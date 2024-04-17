pub fn route() -> String {
    let (status_line, contents) = context();

    let length = contents.len();

    format!("{status_line}\r\nContent-Length: {length}\r\n\r\n{contents}")
}

pub fn context<'a>() -> (&'a str, String) {
    ("HTTP/1.1 404 NOT FOUND", String::from("Couldn't find that :("))
}
