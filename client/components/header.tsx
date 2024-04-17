import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  return(
    <div className="bg-gray-50 border-solid border-black border-2 p-1">
      <h3 className="text-3xl font-bold">POLLSE</h3>
      <button onClick={() => navigate('/')} className="font-bold border-solid border-black border-2 rounded bg-gray-200">GO HOME</button>
    </div>
  );
};

export default Header;
