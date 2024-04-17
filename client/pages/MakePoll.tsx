import React, { useState } from "react";

import Header from "../components/header";
import { PollCreateData } from "../types";

const MakePoll = () => {
  const [answers, setAnswers] = useState<String[]>([]);
  const [htmlAnswers, setHtmlAnswers] = useState<React.JSX.Element[]>([]);

  function addAnswer() {
    const ans = document.getElementById("answer-input-field") as HTMLInputElement;
    
    // !!! Tell user to put something in field
    if (ans.value === "") return; 
    // !!! Tell user they created duplicate
    if (answers.includes(ans.value)) return;

    const htmlAns = <p key={`${ans.value}${answers.length + 1}`}>{`Answer ${answers.length + 1}: ${ans.value}`}</p>

    setAnswers([...answers, ans.value]);
    setHtmlAnswers([...htmlAnswers, htmlAns]);

    ans.value = "";
  } 

  async function startPoll() {
    const question = document.getElementById("question-input-field") as HTMLInputElement;

    // !!! Tell user to input a question
    if (question.value === "") return;

    const pollCreateData: PollCreateData = { question: question.value, answers };
    
    try {
      const response = await fetch("/api/poll/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pollCreateData),
      });

      // !!! Handle data for redir?
      const data = await response.json();

      console.log(data);
    }
    catch (error) {
      console.error("Error occured when attempting to create a new poll:\n\t", error);
    }
  }

  return(
    <div>
      <Header />
      <p>Create your poll</p>
      <form>
        <label>Question: </label>
        <input type="text" id="question-input-field"/><br/>
      </form>
      <label>Create Answer: </label>
      <input type="text" id="answer-input-field" onKeyDown={(event) => event.key === "Enter" ? addAnswer() : false}/>
      <button type="button" id="add-answer-button" onClick={addAnswer}>Add answer</button>
      {htmlAnswers}
      <br/>
      <button type="button" id="start-poll-button" onClick={startPoll}>Start Poll</button>
    </div>
  );
};

export default MakePoll;
