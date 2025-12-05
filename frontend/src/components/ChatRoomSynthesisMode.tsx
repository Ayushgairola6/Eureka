import { GiArchiveResearch } from "react-icons/gi";
const SynthesisMode = () => {
  return (
    <>
      <button className="group realtive bg-black text-white dark:bg-white dark:text-black rounded-full p-1.5 relative">
        <label
          className="group-hover:block hidden  bg-gray-800 text-gray-50 dark:bg-gray-100 dark:text-gray-800 py-1 px-2 rounded-sm absolute bottom-9 left-2 text-xs space-grotesk font-semibold"
          htmlFor="mode"
        >
          Synthesis Mode
        </label>
        <GiArchiveResearch />
      </button>
    </>
  );
};

export default SynthesisMode;
