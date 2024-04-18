import React from "react";
import { useLocation } from "react-router-dom";

import Header from "../components/header";

const Vote = () => {
  const location = useLocation();
  const pollID = location.pathname.split("/")[2];

  return(
    <div className="grid grid-cols-1 bg-gray-200 h-full w-full flex-col justify-items-center">
      <Header />
      <p>Vote</p>
      <p>{pollID}</p>
    </div>
  );
};

export default Vote;
