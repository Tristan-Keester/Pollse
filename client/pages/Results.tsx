import React from "react";
import { useLocation } from "react-router-dom";

import Header from "../components/header";

const Results = () => {
  const location = useLocation();
  const pollID = location.pathname.split("/")[2];

  return(
    <div className="grid grid-cols-1 bg-gray-200 h-full w-full flex-col justify-items-center">
      <Header />
      <p className="text-2xl font-bold">Results</p>
      <p className="text-2xl font-bold">{pollID}</p>
    </div>
  );
};

export default Results;
