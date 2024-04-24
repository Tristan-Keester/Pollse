use rusqlite::Connection;
use serde::{Serialize, Deserialize};

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

#[derive(Serialize, Deserialize, Debug)]
struct Answer {
    id: i64,
    answer: String,
}

#[derive(Serialize, Deserialize, Debug)]
struct Poll {
    id: i64,
    question: String,
    answers: Vec<Answer>,
}

fn create_poll<'a>(conn: &Connection, poll_body: PollBody) -> (&'a str, String) {
    conn.execute(
        "INSERT INTO polls (question) VALUES (?)", 
        [&poll_body.question],
    ).expect("Should insert into database");

    let poll_id = conn.last_insert_rowid();

    for answer in poll_body.answers {
        conn.execute(
            "INSERT INTO answers (answer, poll_id) VALUES (?1, ?2)",
            (&answer, &poll_id)
        ).expect("Should be able to insert row into answers");
    }

    let body = serde_json::to_string(&poll_id).unwrap();

    ("HTTP/1.1 200 OK", body)
}

fn get_answers(conn: &Connection, poll_id: i64) -> Vec<Answer> {
    // !!! Figure out how to properly sanitize input
    let mut stmt = conn.prepare(format!("SELECT id, answer FROM answers WHERE poll_id = {}", &poll_id).as_str()).expect("Should find answers");
    let answer_iter = stmt.query_map([], |row| {
        Ok(Answer {
            id: row.get(0)?,
            answer: row.get(1)?
        })
    }).expect("Should be able to unwrap answer_iter");

    answer_iter
        .map(|answer| answer.unwrap())
        .collect()
}
