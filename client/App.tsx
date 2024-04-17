import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";

import Home from "./pages/Home";
import MakePoll from "./pages/MakePoll";
import Vote from "./pages/Vote";
import Results from "./pages/Results";

const App = () => {
  return(
    <BrowserRouter>
      <Routes>
        <Route path="/makepoll" element={<MakePoll />} />
        <Route path="/vote/*" element={<Vote />} />
        <Route path="/results/*" element={<Results />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
