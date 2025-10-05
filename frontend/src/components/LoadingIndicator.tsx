import React from "react";
import { BiHourglass } from "react-icons/bi";
type LoadingProp = {
  text: string;
};

const LoadingIndicator: React.FC<LoadingProp> = ({ text }) => {
  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="rounded-xl p-6 flex flex-col items-center">
          <div className="text-xl bai-jamjuree-semibold text-green-400 flex items-center justify-center gap-3">
            {text}
            <BiHourglass className="animate-spin" />
          </div>
        </div>
      </div>
    </>
  );
};

export default LoadingIndicator;
