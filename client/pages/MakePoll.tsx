import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';

import Header from "../components/header";
import Answer, { AnswerOptions } from "../components/answer";
import { PollCreateData } from "../types";
import ErrorBlock from "../components/error";

const MakePoll = () => {
  const navigate = useNavigate();

  const [answers, setAnswers] = useState<String[]>([]);
  const [htmlAnswers, setHtmlAnswers] = useState<React.JSX.Element[]>([]);
  const [errorDiv, setErrorDiv] = useState<React.ReactElement>(null);

  function addAnswer() {
    const ans = document.getElementById("answer-input-field") as HTMLInputElement;
    
    if (ans.value === "") {
      setErrorDiv(<div className="col-span-6"><ErrorBlock errorText="No answer in field" /></div>);
      return;
    }; 
    if (answers.includes(ans.value)) {
      setErrorDiv(<div className="col-span-6"><ErrorBlock errorText="Answers must be unique" /></div>);
      return;
    };

    const htmlAns = <Answer 
      key={`${ans.value}${answers.length + 1}${Date.now()}`} 
      num={answers.length + 1} 
      value={ans.value}
      answerOption={AnswerOptions.MakePoll}
    />

    setAnswers([...answers, ans.value]);
    setHtmlAnswers([...htmlAnswers, htmlAns]);

    ans.value = "";
  } 

  async function startPoll() {
    const question = document.getElementById("question-input-field") as HTMLInputElement;

    if (question.value === "") {
      setErrorDiv(<div className="col-span-6"><ErrorBlock errorText="Must have a question" /></div>);
      return;
    };
    if (answers.length <= 1) {
      setErrorDiv(<div className="col-span-6"><ErrorBlock errorText="Must have 2 or more answers to start poll" /></div>);
      return;
    };

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
        <div className="col-span-6 h-1 w-full bg-orange-300"></div>
        <label className="text-2xl font-bold">Question: </label>
        <input type="text" id="question-input-field" className="col-span-5 h-10 w-full border-black border-solid border-2 rounded"/>
        <label className="text-2xl font-bold">Answers: </label>
        <input type="text" id="answer-input-field" onKeyDown={(event) => event.key === "Enter" ? addAnswer() : false} className="col-span-4 h-8 w-full border-black border-solid border-2 rounded"/>
        <button type="button" id="add-answer-button" onClick={addAnswer} className="bg-white font-bold border-black border-solid border-2 rounded m-2 p-1">Add answer</button>
        <div className="col-span-6 h-1 w-full bg-orange-300"></div>
        <div className="col-span-6 grid grid-cols-1 w-full">
          {htmlAnswers}
        </div>
        <div className="col-span-6 h-1 w-full bg-orange-300"></div>
        <button type="button" id="start-poll-button" onClick={startPoll} className="col-span-6 w-32 h-12 bg-white font-bold border-black border-solid border-2 rounded m-2 p-1">Start Poll</button>
        {errorDiv}
      </div>
    </div>
  );
};

export default MakePoll;
