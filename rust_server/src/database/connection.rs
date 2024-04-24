use rusqlite::Connection;

pub fn connect() -> Result<Connection, rusqlite::Error> {
    let conn = Connection::open_in_memory();

    let conn = conn.unwrap();

    println!("Connected to database");

    let table_creation = [
        "CREATE TABLE polls (
            id       INTEGER PRIMARY KEY,
            question TEXT NOT NULL
        )",
        "CREATE TABLE answers (
            id      INTEGER PRIMARY KEY,
            answer  TEXT NOT NULL,
            poll_id INTEGER,
            CONSTRAINT fk_polls
                FOREIGN KEY (poll_id)
                REFERENCES  polls(id)
        )",
    ];

    for query in table_creation {
        conn.execute(query, ()).expect(format!("Should create table: {}", query).as_str());
    }

    Ok(conn)
}
