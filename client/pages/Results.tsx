import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Header from "../components/header";
import Answer, { AnswerOptions } from "../components/answer";

const Results = () => {
  const location = useLocation();
  const pollID = location.pathname.split("/")[2];

  const navigate = useNavigate();

  const [question, setQuestion] = useState(""); 
  const [answers, setAnswers] = useState<React.ReactElement[]>([]);
  
  useEffect(() => {
    getPoll();
  }, []);

  async function getPoll() {
    try {
      // !!! Move this check to home and transfer the data over to here instead
      // cause right now the screen flickers and it suck
      const response = await fetch(`/api/poll/data/${pollID}`);

      if (response.status === 404) {
        navigate("/");
      }

      const data = await response.json();

      setQuestion(data.question);

      const answerArray: React.ReactElement[] = [];

      for (let i = 0; i < data.answers.length; i++) {
        answerArray.push(<Answer 
          key={`${i}${data.answers[i].id}`} 
          num={i + 1} 
          value={data.answers[i].answer}
          answerOption={AnswerOptions.Results}
          votes={data.answers[i].votes}
        />);
      }

      setAnswers(answerArray);
    }
    catch (error) {
      console.error("Error occured when fetching question and answer data: ", error);
    }
  }


  return(
    <div className="grid grid-cols-1 bg-gray-200 h-full w-full flex-col justify-items-center">
      <Header />
      <p className="text-2xl font-bold">Results</p>
      <div className="grid grid-cols-6 gap-3 place-items-center">
        <div className="col-span-6 h-1 w-full bg-orange-300"></div>
        <label className="text-2xl font-bold">Question: </label>
        <p id="question-text" className="col-span-4 h-10 w-full text-xl font-semibold content-center">{question}</p>
        <label className="text-2xl font-bold">Votes</label>
        <div className="col-span-6 h-1 w-full bg-orange-300"></div>
        <div className="col-span-6 grid grid-cols-1 w-full">
          {answers}
        </div>
        <div className="col-span-6 h-1 w-full bg-orange-300"></div>
      </div>
    </div>
  );
};

export default Results;
