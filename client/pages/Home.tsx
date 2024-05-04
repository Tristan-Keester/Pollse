import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import Header from "../components/header";

const Home = () => {
  const navigate = useNavigate();

  const [socket, setSocket] = useState(null);

  function goToPoll() {
    const pollID = document.getElementById("go-to-poll-input") as HTMLInputElement;

    if (pollID.value === "") return;

    navigate(`/vote/${pollID.value}`);
  }

  async function openWebsocket() {
    console.log("Button clicked");
    const exampleSocket = new WebSocket(
      "ws://localhost:3000/api/socketserver/1",
      "protocolOne",
    );

    exampleSocket.onopen = () => {
      setSocket(exampleSocket);
    }

    exampleSocket.addEventListener("message", (event) => {
      console.log("Message from server: ", event.data);
    })
  }

  async function sendOverSocket() {
    let message = document.getElementById("ws-input") as HTMLInputElement;

    socket.send(message.value);
  }

  async function closeSocket() {
    socket.close();
  }

  return(
    <div className="grid grid-cols-1 bg-gray-200 h-full w-full flex-col justify-items-center">
      <Header />
      <button onClick={() => navigate("/makepoll")} className="bg-white font-bold border-black border-solid border-2 rounded m-2 p-1">Make Poll</button>
      <button onClick={goToPoll} className="bg-white font-bold border-black border-solid border-2 rounded m-2 p-1">Go to Poll</button>
      <input type="text" id="go-to-poll-input" placeholder="Poll ID" className="border-black border-solid border-2 rounded"/>
      <button onClick={openWebsocket} className="bg-white font-bold border-black border-solid border-2 rounded m-2 p-1">WebSocket</button>
      <button onClick={sendOverSocket} className="bg-white font-bold border-black border-solid border-2 rounded m-2 p-1">Send on Socket</button>
      <input type="text" id="ws-input" placeholder="message" className="border-black border-solid border-2 rounded"/>
      <button onClick={closeSocket} className="bg-white font-bold border-black border-solid border-2 rounded m-2 p-1">Close Socket</button>
    </div>
  );
};

export default Home;
