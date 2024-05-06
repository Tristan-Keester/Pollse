import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Header from "../components/header";
import Answer, { AnswerOptions } from "../components/answer";

const Vote = () => {
  const location = useLocation();
  const pollID = location.pathname.split("/")[2];

  const navigate = useNavigate();

  const [question, setQuestion] = useState(""); 
  const [answers, setAnswers] = useState<React.ReactElement[]>([]);
  
  useEffect(() => {
    getPoll();
  }, []);

  async function vote(id: number) {
    try {
      const voteData = {
        id,
        poll_id: Number(pollID),
      }

      const response = await fetch("/api/poll/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(voteData),
      });
      const data = await response.json();

      if (data === true) {
        navigate(`/results/${pollID}`);
      }
      else {
        // !!! Inform user of voting issue
        console.error("Couldn't vote");
      }
    }
    catch (error) {
      console.error("Error when trying to vote: ", error);
    }
  }

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
          answerOption={AnswerOptions.Vote}
          voteFn={() => vote(data.answers[i].id)}
        />);
      }

      setAnswers(answerArray);
    }
    catch (error) {
      console.error("Error occured when fetching question and answer data: ", error);
    }
  }

  function goToResults() {
    navigate(`/results/${pollID}`);
  }

  return(
    <div className="grid grid-cols-1 bg-gray-200 h-full w-full flex-col justify-items-center">
      <Header />
      <p className="text-2xl font-bold">Vote</p>
      <div className="grid grid-cols-6 gap-3 place-items-center">
        <div className="col-span-6 h-1 w-full bg-orange-300"></div>
        <label className="text-2xl font-bold">Question: </label>
        <p id="question-text" className="col-span-5 h-10 w-full text-xl font-semibold content-center">{question}</p>
        <div className="col-span-6 h-1 w-full bg-orange-300"></div>
        <div className="col-span-6 grid grid-cols-1 w-full">
          {answers}
        </div>
        <div className="col-span-6 h-1 w-full bg-orange-300"></div>
        <button type="button" onClick={goToResults} className="col-span-6 w-32 h-12 bg-white font-bold border-black border-solid border-2 rounded m-2 p-1">Go To Results</button>
      </div>
    </div>
  );
};

export default Vote;
