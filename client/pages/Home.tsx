import React from "react";
import { useNavigate } from "react-router-dom";

import Header from "../components/header";

const Home = () => {
  const navigate = useNavigate();

  function goToPoll() {
    const pollID = document.getElementById("go-to-poll-input") as HTMLInputElement;

    navigate(`/vote/${pollID.value}`);
  }

  return(
    <div>
      <Header />
      <h2>Home</h2>
      <button onClick={() => navigate("/makepoll")} className="font-bold border-black border-solid border-2 rounded m-2 p-1">Make Poll</button>
      <button onClick={goToPoll} className="font-bold border-black border-solid border-2 rounded m-2 p-1">Go to Poll</button>
      <input type="text" id="go-to-poll-input" placeholder="Poll ID" className="border-black border-solid border-2 rounded"/>
    </div>
  );
};

export default Home;
