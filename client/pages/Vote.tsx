import React from 'react';
import { useParams } from 'react-router-dom';
import '../stylesheets/app.scss';

const Vote = () => {
  const { pollID } = useParams();

  return(
    <div>
      <p>Vote</p>
      <p>{pollID}</p>
    </div>
  );
};

export default Vote;
