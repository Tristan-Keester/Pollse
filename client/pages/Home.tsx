import React from "react";
import { useNavigate } from "react-router-dom";

import Header from "../components/header";

const Home = () => {
  const navigate = useNavigate();

  async function goToPoll() {
    const pollID = document.getElementById("go-to-poll-input") as HTMLInputElement;

    if (pollID.value === "") return;

    try {
      const response = await fetch(`api/poll/data/${pollID.value}`);
      if (response.status !== 200) {
        // !!! Create visual telling user poll doesn't exist
        console.log("Poll does not exist");
        return;
      }
      navigate(`/vote/${pollID.value}`);
    }
    catch (error) {
      console.error("Error occured when fetching pollID: ", error);
    }
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
