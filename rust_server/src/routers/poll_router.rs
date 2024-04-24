use rusqlite::Connection;

use crate::error_handler;

#[derive(Debug)]
struct PollBody<'a, 'b> {
    question: &'a str,
    answers: Vec<&'b str>,
}

pub fn route(req: Vec<&str>, conn: &Connection) -> String {
    let request_line = req[0];

    let body: serde_json::Value = serde_json::from_str(req[req.len() -1]).unwrap();

    let poll_body = PollBody {
        question: body["question"].as_str().unwrap(),
        answers: body["answers"].as_array().unwrap()
            .iter()
            .map(|el| el.as_str().unwrap())
            .collect(),
    };

    let (status_line, contents) = match request_line {
        "POST /api/poll/create HTTP/1.1" => create_poll(conn, poll_body),
        _ => error_handler::context(),
    };

    let length = contents.len();

    format!("{status_line}\r\nContent-Length: {length}\r\n\r\n{contents}")
}

use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Debug)]
struct Poll {
    id: i32,
    question: String,
}

fn create_poll<'a>(conn: &Connection, poll_body: PollBody) -> (&'a str, String) {
    conn.execute(
        "INSERT INTO polls (question) VALUES (?)", 
        [&poll_body.question],
    ).expect("Should insert into database");

    let mut stmt = conn.prepare("SELECT id, question FROM polls").expect("Should prepare query");
    let question_iter = stmt.query_map([], |row| {
        Ok(Poll {
            id: row.get(0)?,
            question: row.get(1)?,
        })
    }).expect("Should do question iter");

    let polls: Vec<Poll> = question_iter
        .map(|poll| poll.unwrap())
        .collect();

    let body = serde_json::to_string(&polls).unwrap();

    ("HTTP/1.1 200 OK", body)
}
