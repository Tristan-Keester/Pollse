import React from "react";
import { useLocation } from "react-router-dom";

import Header from "../components/header";

const Vote = () => {
  const location = useLocation();
  const pollID = location.pathname.split("/")[2];

  return(
    <div>
      <Header />
      <p>Vote</p>
      <p>{pollID}</p>
    </div>
  );
};

export default Vote;
