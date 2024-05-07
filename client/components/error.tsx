import React from 'react';

interface ErrorProps {
  errorText: string;
}

const ErrorBlock = ({ errorText }: ErrorProps) => {
  return(
    <div className="">
      <p className="text-red-500">{errorText}</p>
    </div>
  );
};

export default ErrorBlock;
