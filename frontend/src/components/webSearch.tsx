import { MdWeb } from "react-icons/md";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setQueryType } from "../store/InterfaceSlice";
const WebSearch = () => {
  const dispatch = useAppDispatch();

  const { queryType } = useAppSelector((state) => state.interface);
  return (
    <>
      <button
        onClick={() => {
          if (queryType === "Web Search") {
            dispatch(setQueryType(""));
            return;
          }
          dispatch(setQueryType("Web Search"));
        }}
        className={`rounded-full p-2 ${
          queryType === "Web Search"
            ? "bg-green-500"
            : "dark:bg-white/15 bg-black/15"
        } cursor-pointer`}
      >
        <MdWeb />
      </button>
    </>
  );
};

export default WebSearch;
