import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Header from "../components/header";
import Answer from "../components/answer";

const Vote = () => {
  const location = useLocation();
  const pollID = location.pathname.split("/")[2];

  const navigate = useNavigate();

  const [question, setQuestion] = useState(""); 
  const [answers, setAnswers] = useState<React.ReactElement[]>([]);
  
  useEffect(() => {
    getPoll();
  }, []);

  async function vote() {
    console.log("Hi I voted :)");
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

      console.log(data);

      setQuestion(data.question);

      const answerArray: React.ReactElement[] = [];

      for (let i = 0; i < data.answers.length; i++) {
        answerArray.push(<Answer 
          key={`${i}${data.answers[i].id}`} 
          num={i + 1} 
          value={data.answers[i].answer}
          showVote={vote}
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
      <p className="text-2xl font-bold">Vote</p>
      <p className="text-2xl font-bold">{pollID}</p>
      <div className="grid grid-cols-6 gap-3 place-items-center">
        <label className="text-2xl font-bold">Question: </label>
        <p id="question-text" className="col-span-5 h-10 w-full text-xl font-semibold content-center">{question}</p>
        <div className="col-span-6 h-1 w-full bg-orange-300"></div>
        <div className="col-span-6 grid grid-cols-1 w-full">
          {answers}
        </div>
        <div className="col-span-6 h-1 w-full bg-orange-300"></div>
      </div>
    </div>
  );
};

export default Vote;
