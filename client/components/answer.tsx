import React from 'react';

export enum AnswerOptions {
  MakePoll,
  Vote,
  Results,
}

interface AnswerProps { 
  num: number;
  id?: number;
  value: string;
  answerOption: AnswerOptions; 
  voteFn?: () => Promise<void>;
  votes?: number;
  percentBarWidth?: number;
};

const Answer = ({ num, id, value, answerOption, voteFn, votes, percentBarWidth }: AnswerProps) => {
  if (answerOption === 2) {
    let barWidth = percentBarWidth + "rem";

    return (
      <div key={`${num}${value}${Date.now()}`} id={`answer${id}`} className="relative grid grid-cols-6 max-w-2xl m-2">
        <p className="text-xl font-bold">{`Answer ${num}:`}</p>
        <div style={{width: barWidth}} className="absolute left-28 h-full bg-gray-300 border-y-2 border-x-1 border-black"></div>
        <p className="z-10 col-span-4 break-all text-lg font-semibold">{value}</p>
        <p className="z-10 text-xl font-bold text-right">{votes}</p>
      </div>
    );
  }
  else if (answerOption === 1) {
    return (
      <div key={`${num}${value}${Date.now()}`} className="grid grid-cols-6 max-w-2xl">
        <p className="text-xl font-bold">{`Answer ${num}:`}</p>
        <p className="col-span-4 break-all text-lg font-semibold">{value}</p>
        <button type="button" onClick={voteFn} className="bg-white font-bold border-black border-solid border-2 rounded m-2 p-1 h-10">Vote</button>
      </div>
    );
  }
  else {
    return (
      <div key={`${num}${value}${Date.now()}`} className="grid grid-cols-6 max-w-2xl">
        <p className="text-xl font-bold">{`Answer ${num}:`}</p>
        <p className="col-span-5 break-all text-lg font-semibold">{value}</p>
      </div>
    );
  }
};

export default Answer;
