import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../stylesheets/app.scss';

const Home = () => {
  const navigate = useNavigate();

  return(
    <div>
      <p>Home</p>
      <button onClick={() => navigate('/makepoll')}>Make Poll</button>
    </div>
  );
};

export default Home;
