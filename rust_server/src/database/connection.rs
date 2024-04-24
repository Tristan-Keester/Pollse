use rusqlite::Connection;

pub fn connect() -> Result<Connection, rusqlite::Error> {
    let conn = Connection::open_in_memory();

    let conn = conn.unwrap();

    println!("Connected to database");

    conn.execute(
        "CREATE TABLE polls (
            id         INTEGER PRIMARY KEY,
            question   TEXT NOT NULL
        )",
        (), // empty list of parameters.
    ).expect("Should connect");

    Ok(conn)
}
