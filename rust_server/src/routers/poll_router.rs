use std::{
    collections::HashMap,
    sync::mpsc::Sender,
};

use rusqlite::Connection;
use serde::{Serialize, Deserialize};

use crate::error_handler;

#[derive(Serialize, Deserialize, Debug)]
struct PollBody {
    question: String,
    answers: Vec<String>,
}

pub fn route(req: Vec<&str>, conn: &Connection, senders:&mut HashMap<String, Vec<Sender<String>>>) -> String {
    let request_line: Vec<&str> = req[0].split(" ").collect();

    println!("{:?}", request_line);
    
    let (status_line, contents) = match request_line[0] {
        "GET" => match request_line[1] {
            rl if rl.contains("/api/poll/data") => get_poll_data(conn, request_line[1]),
            rl if rl.contains("/api/poll/answers") => get_poll_answers(conn, request_line[1]),
            _ => error_handler::context(),
        },
        "POST" => match request_line[1] {
            "/api/poll/create" => create_poll(conn, req),
            "/api/poll/vote" => vote_poll(conn, req, senders),
            _ => error_handler::context(),
        },
        _ => error_handler::context(),
    };

    let length = contents.len();

    format!("{status_line}\r\nContent-Length: {length}\r\n\r\n{contents}")

}

fn create_poll<'a>(conn: &Connection, req: Vec<&str>) -> (&'a str, String) {

    let body: PollBody = serde_json::from_str(req[req.len() -1]).unwrap();

    let poll_body = body; 
    
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

fn get_poll_answers<'a>(conn: &Connection, req_url: &str) -> (&'a str, String) {
    let poll_id = &req_url[(req_url.rfind('/').expect("Should find /") + 1)..req_url.len()].parse::<i64>().unwrap(); 

    let answers = get_answers(conn, *poll_id);

    let body = serde_json::to_string(&answers).unwrap();

    ("HTTP/1.1 200 OK", body)
}

#[allow(dead_code)]
#[derive(Debug)]
struct Question {
    quest: String,
}

fn get_question(conn: &Connection, poll_id: i64) -> String {
    let mut stmt = conn.prepare("SELECT question FROM polls WHERE id = (?)").expect("Should find answers");
    let question = stmt.query_map([&poll_id], |row| {
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

#[derive(Serialize, Deserialize, Debug)]
struct Answer {
    id: i64,
    answer: String,
    votes: i64,
}

fn get_answers(conn: &Connection, poll_id: i64) -> Vec<Answer> {
    let mut stmt = conn.prepare("SELECT id, answer, votes FROM answers WHERE poll_id = (?)").expect("Should find answers");
    let answer_iter = stmt.query_map([&poll_id], |row| {
        Ok(Answer {
            id: row.get(0)?,
            answer: row.get(1)?,
            votes: row.get(2)?
        })
    }).expect("Should be able to unwrap answer_iter");

    answer_iter
        .map(|answer| answer.unwrap())
        .collect()
}

#[derive(Serialize, Deserialize, Debug)]
struct AnswerId {
    id: i64,
    poll_id: i64,
}

fn vote_poll<'a>(conn: &Connection, req: Vec<&str>, senders: &mut HashMap<String, Vec<Sender<String>>>) -> (&'a str, String) {
    let body: AnswerId = serde_json::from_str(req[req.len() -1]).unwrap();
 
    conn.execute(
        "UPDATE answers SET votes = votes + 1 WHERE id = ?", 
        [&body.id],
    ).expect("Should update answer in database");

    let senders_vec = &senders.get(&body.poll_id.to_string());

    match senders_vec {
        Some(_) => {
            for sender in &senders[&body.poll_id.to_string()] {
                let send_attempt = sender.send(body.id.to_string());

                match send_attempt {
                    Ok(_) => (),
                    _ => (), 
                }
            }
        },
        _ => (),
    }

    ("HTTP/1.1 200 OK", String::from("true"))
}
