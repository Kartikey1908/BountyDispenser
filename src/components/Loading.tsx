// components/Loading.tsx
import React from 'react';

const Loading = () => {
  return (
    <div className="fixed inset-0 flex flex-col gap-y-9 items-center justify-center bg-[rgb(2,6,21)] z-50">
      <div className="spinner">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <div className="text-white text-2xl">Loading...</div>
    </div>
  );
};

export default Loading;
