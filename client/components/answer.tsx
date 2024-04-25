import React from 'react';

type ShowVote = () => void | null;

const Answer = ({ num, value, showVote }: { num: number, value: string, showVote: ShowVote }) => {
  if (showVote) {
    return (
      <div key={`${num}${value}${Date.now()}`} className="grid grid-cols-6 max-w-2xl">
        <p className="text-xl font-bold">{`Answer ${num}:`}</p>
        <p className="col-span-4 break-all text-lg font-semibold">{value}</p>
        <button type="button" onClick={showVote} className="bg-white font-bold border-black border-solid border-2 rounded m-2 p-1 h-10">Vote</button>
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
