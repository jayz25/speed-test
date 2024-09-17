import { useEffect, useState } from "react";

const useTimer = (timeout) => {
  const [seconds, setSeconds] = useState(timeout || 60);
  const [timerId, setTimerId] = useState(null);
  
  const start = () => {
    setTimerId(setInterval(() => {
      if(seconds <= 0) {
        return;
      }
      else
        setSeconds((seconds: number) => seconds - 1);
    },  1000));
  }

  const reset = () => {
    clearInterval(timerId)
    setSeconds(60);
  };
  
  useEffect(() => {
    if(seconds <= 0) {
      clearInterval(timerId);
      setSeconds(60);
    }
  },[seconds]);

  return {start, reset, seconds};
};

export default useTimer;
