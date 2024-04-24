import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';

import Header from "../components/header";
import { PollCreateData } from "../types";

const MakePoll = () => {
  const navigate = useNavigate();

  const [answers, setAnswers] = useState<String[]>([]);
  const [htmlAnswers, setHtmlAnswers] = useState<React.JSX.Element[]>([]);

  function addAnswer() {
    const ans = document.getElementById("answer-input-field") as HTMLInputElement;
    
    // !!! Tell user to put something in field
    if (ans.value === "") return; 
    // !!! Tell user they created duplicate
    if (answers.includes(ans.value)) return;

    const htmlAns = (
      <div key={`${ans.value}${answers.length + 1}`} className="grid grid-cols-6 max-w-2xl">
        <p className="text-xl font-bold">{`Answer ${answers.length + 1}:`}</p>
        <p className="col-span-5 break-all text-lg font-semibold">{ans.value}</p>
      </div>
    );

    setAnswers([...answers, ans.value]);
    setHtmlAnswers([...htmlAnswers, htmlAns]);

    ans.value = "";
  } 

  async function startPoll() {
    const question = document.getElementById("question-input-field") as HTMLInputElement;

    // !!! Tell user to input a question
    if (question.value === "") return;
    if (answers.length <= 1) return;

    const pollCreateData: PollCreateData = { question: question.value, answers };
    
    try {
      const response = await fetch("/api/poll/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pollCreateData),
      });

      const data = await response.json();
      
      navigate(`/results/${data}`);
    }
    catch (error) {
      console.error("Error occured when attempting to create a new poll:\n\t", error);
    }
  }

  return(
    <div className="grid grid-cols-1 bg-gray-200 h-full w-full flex-col justify-items-center">
      <Header />
      <div className="grid grid-cols-6 gap-3 place-items-center">
        <label className="text-2xl font-bold">Question: </label>
        <input type="text" id="question-input-field" className="col-span-5 h-8 w-full border-black border-solid border-2 rounded"/>
        <label className="text-2xl font-bold">Answers: </label>
        <input type="text" id="answer-input-field" onKeyDown={(event) => event.key === "Enter" ? addAnswer() : false} className="col-span-4 h-8 w-full border-black border-solid border-2 rounded"/>
        <button type="button" id="add-answer-button" onClick={addAnswer} className="bg-white font-bold border-black border-solid border-2 rounded m-2 p-1">Add answer</button>
        <div className="col-span-6 h-1 w-full bg-orange-300"></div>
        <div className="col-span-6 grid grid-cols-1 w-full">
          {htmlAnswers}
        </div>
        <div className="col-span-6 h-1 w-full bg-orange-300"></div>
        <button type="button" id="start-poll-button" onClick={startPoll} className="col-span-6 w-32 h-12 bg-white font-bold border-black border-solid border-2 rounded m-2 p-1">Start Poll</button>
      </div>
    </div>
  );
};

export default MakePoll;
