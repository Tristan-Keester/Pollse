import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  return(
    <div className="grid grid-cols-1 justify-items-center h-24 w-11/12 p-1 m-2 bg-gray-50 border-solid border-black border-2">
      <h3 onClick={() => navigate('/')} className="object-center p-3 text-5xl text-orange-400 font-bold">Pollse</h3>
    </div>
  );
};

export default Header;
