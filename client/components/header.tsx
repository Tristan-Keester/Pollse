import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../stylesheets/app.scss';

const Header = () => {
  const navigate = useNavigate();

  return(
    <div>
      <p>THIS IS THE HEADER</p>
      <button onClick={() => navigate('/')}>GO HOME</button>
    </div>
  );
};

export default Header;
