use crate::error_handler;

pub fn route(req: Vec<&str>) -> String {
    let request_line = req[0];

    let body: serde_json::Value = serde_json::from_str(req[req.len() -1]).unwrap();

    let answers: Vec<&str> = body["answers"].as_array().unwrap()
        .iter()
        .map(|el| el.as_str().unwrap())
        .collect(); 
    let questy = body["question"].as_str().unwrap();

    println!("{:#?}, {}", answers, questy);

    let (status_line, contents) = match request_line {
        "POST /api/poll/create HTTP/1.1" => ("HTTP/1.1 200 OK", format!("We come from the poll router lands\n{:?}\n{}", answers, questy)),
        _ => error_handler::context(),
    };

    let length = contents.len();

    format!("{status_line}\r\nContent-Length: {length}\r\n\r\n{contents}")
}
