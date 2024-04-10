import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../stylesheets/app.scss';

import Header from '../components/header';

const Home = () => {
  const navigate = useNavigate();

  function goToPoll() {
    const pollID = document.getElementById('go-to-poll-input') as HTMLInputElement;

    navigate(`/vote/${pollID.value}`);
  }

  return(
    <div>
      <Header />
      <p>Home</p>
      <button onClick={() => navigate('/makepoll')}>Make Poll</button>
      <button onClick={goToPoll}>Go to Poll</button>
      <input type='text' id='go-to-poll-input'/>
    </div>
  );
};

export default Home;
