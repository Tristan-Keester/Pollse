use rusqlite::Connection;
use serde::{Serialize, Deserialize};

use crate::error_handler;

#[derive(Debug)]
struct PollBody<'a, 'b> {
    question: &'a str,
    answers: Vec<&'b str>,
}

pub fn route(req: Vec<&str>, conn: &Connection) -> String {
    let request_line: Vec<&str> = req[0].split(" ").collect();

    println!("{:?}", request_line);
    
    let (status_line, contents) = match request_line[0] {
        "GET" => match request_line[1] {
            rl if rl.contains("/api/poll/data") => get_poll_data(conn, request_line[1]),
            _ => error_handler::context(),
        },
        "POST" => match request_line[1] {
            "/api/poll/create" => create_poll(conn, req),
            _ => error_handler::context(),
        },
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

fn create_poll<'a>(conn: &Connection, req: Vec<&str>) -> (&'a str, String) {
    let body: serde_json::Value = serde_json::from_str(req[req.len() -1]).unwrap();

    let poll_body = PollBody {
        question: body["question"].as_str().unwrap(),
        answers: body["answers"].as_array().unwrap()
            .iter()
            .map(|el| el.as_str().unwrap())
            .collect(),
    };
    
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

#[derive(Serialize, Deserialize, Debug)]
struct Poll {
    id: i64,
    question: String,
    answers: Vec<Answer>,
}

fn get_poll_data<'a>(conn: &Connection, req_url: &str) -> (&'a str, String) {
    let poll_id = &req_url[(req_url.rfind('/').expect("Should find /") + 1)..req_url.len()].parse::<i64>().unwrap(); 

    let poll = Poll {
        id: *poll_id,
        question: get_question(conn, *poll_id),
        answers: get_answers(conn, *poll_id),
    };

    if poll.question == String::from("Could not find that poll") {
        return ("HTTP/1.1 404 NOT FOUND", serde_json::to_string("No poll exists with that ID").unwrap());
    }

    let body = serde_json::to_string(&poll).unwrap();

    ("HTTP/1.1 200 OK", body)
}

#[allow(dead_code)]
struct Question {
    quest: String,
}

fn get_question(conn: &Connection, poll_id: i64) -> String {
    let mut stmt = conn.prepare(format!("SELECT question FROM polls WHERE id = {}", &poll_id).as_str()).expect("Should find answers");
    let question = stmt.query_map([], |row| {
        Ok(Question {
            quest: row.get(0)?,
        })
    }).expect("Should be able to unwrap answer_iter");

    let question_vec: Vec<Question> = question
        .map(|q| q.unwrap())
        .collect();

    match question_vec.len() {
        1 => question_vec[0].quest.clone(),
        _ => String::from("Could not find that poll"),
    }
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
