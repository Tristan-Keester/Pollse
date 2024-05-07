import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Header from "../components/header";
import Answer, { AnswerOptions } from "../components/answer";

interface AnswerData {
  id: number;
  answer: string;
  votes: number;
}

const Results = () => {
  const location = useLocation();
  const pollID = location.pathname.split("/")[2];

  const navigate = useNavigate();

  const [question, setQuestion] = useState(""); 
  const [answerData, setAnswerData] = useState<AnswerData[]>([]);
  const [answers, setAnswers] = useState<React.ReactElement[]>([]);
  const [totalVotes, setTotalVotes] = useState<number>(1);
  const [idToUpdate, setIdToUpdate] = useState<number>(0);
  const [update , setUpdate] = useState<number>(0);

  const [socket, setSocket] = useState<WebSocket | null>();
  
  useEffect(() => {
    getPoll();
    openSocket();
  }, []);

  useEffect(() => {
    const testAnswers: React.ReactElement[] = [];
    for (let i = 0; i < answerData.length; i++) {
      testAnswers.push(<Answer 
        key={`${i}${answerData[i].id}`} 
        id={answerData[i].id}
        num={i + 1} 
        value={answerData[i].answer}
        answerOption={AnswerOptions.Results}
        votes={answerData[i].votes}
        percentBarWidth={Math.max(answerData[i].votes / totalVotes, 0.01) * 36}
      />)
    }

    setAnswers(testAnswers);
  }, [answerData]);

  useEffect(() => {
    for (let i = 0; i < answerData.length; i++) {
      if (answerData[i].id == idToUpdate) {
        const updatedAnswers = [
          ...answerData
        ];
        updatedAnswers[i].votes += 1;

        setAnswerData(updatedAnswers);
        setTotalVotes(totalVotes + 1);
      }
    }
  }, [update]);

  async function getPoll() {
    try {
      const response = await fetch(`/api/poll/data/${pollID}`);

      if (response.status === 404) {
        navigate("/");
      }

      const data = await response.json();

      setQuestion(data.question);
      //@ts-ignore
      setTotalVotes(data.answers.reduce((acc, el) => acc += el.votes, 0));
      setAnswerData(data.answers);
    }
    catch (error) {
      console.error("Error occured when fetching question and answer data: ", error);
    }
  }

  async function openSocket() {
    const newSocket = new WebSocket(
      `ws://localhost:3000/api/socketserver/${pollID}`,
      "protocolOne",
    );

    newSocket.onopen = () => {
      if (socket) {
        socket.close();
      }

      setSocket(newSocket);
    }

    let counter = 0;
    newSocket.addEventListener("message", (event) => {
      setIdToUpdate(event.data);
      setUpdate(counter + 1);
      counter++;
    });
  }

  function beforeHome() {
    socket.close();
  }



  return(
    <div className="grid grid-cols-1 bg-gray-200 h-full w-full flex-col justify-items-center">
      <Header beforeHome={beforeHome} />
      <p className="text-2xl font-bold">Results</p>
      <p className="text-2xl font-bold">Poll ID is: {pollID}</p>
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
