import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import Header from "../components/header";
import ErrorBlock from "../components/error";

const Home = () => {
  const navigate = useNavigate();

  const pollButtons = {
    default: <button onClick={goToPoll} className="bg-white font-bold border-black border-solid border-2 rounded m-2 p-1">Go to Poll</button>,
    loading: <button onClick={goToPoll} className="cursor-wait bg-white font-bold border-black border-solid border-2 rounded m-2 p-1">Go to Poll</button>,
  }

  const [goToPollButton, setGoToPollButton] = useState<React.ReactElement>(pollButtons.default);
  const [errorDiv, setErrorDiv] = useState<React.ReactElement>(null);

  async function goToPoll() {
    const pollID = document.getElementById("go-to-poll-input") as HTMLInputElement;

    if (pollID.value === "") {
      setErrorDiv(<ErrorBlock errorText="Input an ID" />);
      return;
    };

    try {
      setGoToPollButton(pollButtons.loading); 
      const response = await fetch(`api/poll/data/${pollID.value}`);

      setGoToPollButton(pollButtons.default); 
      if (response.status !== 200) {
        setErrorDiv(<ErrorBlock errorText="No poll exists with that ID" />);
        return;
      }

      navigate(`/vote/${pollID.value}`);
    }
    catch (error) {
      console.error("Error occured when fetching pollID: ", error);
    }
  }

  return(
    <div id="home-div" className="grid grid-cols-1 bg-gray-200 h-full w-full flex-col justify-items-center">
      <Header />
      <button onClick={() => navigate("/makepoll")} className="bg-white font-bold border-black border-solid border-2 rounded m-2 p-1">Make Poll</button>
      {goToPollButton}
      <input type="text" id="go-to-poll-input" placeholder="Poll ID" className="border-black border-solid border-2 rounded"/>
      {errorDiv}
    </div>
  );
};

export default Home;
