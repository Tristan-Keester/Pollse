import React from 'react';

export enum AnswerOptions {
  MakePoll,
  Vote,
  Results,
}

interface AnswerProps { 
  num: number;
  value: string;
  answerOption: AnswerOptions; 
  voteFn?: () => Promise<void>;
  votes?: number;
};

const Answer = ({ num, value, answerOption, voteFn, votes }: AnswerProps) => {
  if (answerOption === 2) {
    return (
      <div key={`${num}${value}${Date.now()}`} className="grid grid-cols-6 max-w-2xl">
        <p className="text-xl font-bold">{`Answer ${num}:`}</p>
        <p className="col-span-4 break-all text-lg font-semibold">{value}</p>
        <p className="text-xl font-bold text-right">{votes}</p>
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
