import React from "react";
import { BiHourglass } from "react-icons/bi";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { TbError404 } from "react-icons/tb";
type LoadingProp = {
  text: string;
};

const LoadingIndicator: React.FC<LoadingProp> = ({ text }) => {
  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="rounded-xl p-6 flex flex-col items-center">
          <div
            className={`text-xl bai-jamjuree-semibold ${
              text.includes("Setting up your dashboard")
                ? "text-green-400"
                : text.includes(
                    "Failed to get your details please logIn instead"
                  )
                ? "text-red-400"
                : "text-sky-400"
            } flex items-center justify-center gap-3`}
          >
            {text}
            {text.includes("Setting up your dashboard") ? (
              <BiHourglass className="animate-spin" />
            ) : text.includes(
                "Failed to get your details please logIn instead"
              ) ? (
              <TbError404 />
            ) : (
              <IoMdInformationCircleOutline />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default LoadingIndicator;
