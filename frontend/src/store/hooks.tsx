import {
  type TypedUseSelectorHook,
  useDispatch,
  useSelector,
} from "react-redux";
import type { RootState, AppDispatch } from "./reduxstore";
import { useState, useEffect, useRef } from "react";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useTypewriter = (realText: string, speed = 30) => {
  const [displayedText, setDisplayedText] = useState("");
  const indexRef = useRef(0); // Track progress without triggering re-renders

  useEffect(() => {
    // If realText is reset (e.g., new chat), reset everything
    if (!realText) {
      setDisplayedText("");
      indexRef.current = 0;
      return;
    }

    // If we have already finished typing this text, do nothing
    if (indexRef.current >= realText.length) {
      return;
    }

    const intervalId = setInterval(() => {
      // Calculate how much is left to type
      if (indexRef.current < realText.length) {
        // Increment index
        indexRef.current += 30;

        // Slice the text up to the current index
        // Using slice ensures we don't lose sync with the realText updates
        setDisplayedText(realText.slice(0, indexRef.current));
      } else {
        clearInterval(intervalId);
      }
    }, speed);

    return () => clearInterval(intervalId);
  }, [realText, speed]);

  return displayedText;
};
