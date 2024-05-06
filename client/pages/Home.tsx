import React from "react";
import { useNavigate } from "react-router-dom";

import Header from "../components/header";

const Home = () => {
  const navigate = useNavigate();

  function goToPoll() {
    const pollID = document.getElementById("go-to-poll-input") as HTMLInputElement;

    if (pollID.value === "") return;

    navigate(`/vote/${pollID.value}`);
  }

  return(
    <div className="grid grid-cols-1 bg-gray-200 h-full w-full flex-col justify-items-center">
      <Header />
      <button onClick={() => navigate("/makepoll")} className="bg-white font-bold border-black border-solid border-2 rounded m-2 p-1">Make Poll</button>
      <button onClick={goToPoll} className="bg-white font-bold border-black border-solid border-2 rounded m-2 p-1">Go to Poll</button>
      <input type="text" id="go-to-poll-input" placeholder="Poll ID" className="border-black border-solid border-2 rounded"/>
    </div>
  );
};

export default Home;
