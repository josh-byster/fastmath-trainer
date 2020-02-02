import React, { useState, useEffect, useCallback } from "react";
import { useCounter, useToggle } from "react-use";

export default function Flasher({ numList, delay, shouldPlay, length }) {
  const [idx, setIdx] = useState(0);
  const [shouldShow, setShow] = useState(false);
    console.log(numList)
  const setVisible = useCallback(() => {
    setShow(true);
    setTimeout(() => {
      setShow(false);
    }, length);
  }, [setShow, length]);

  const scheduleIncrement = useCallback(
    curIdx => {
      setIdx(curIdx);
      setVisible();
      setTimeout(() => {
        if (curIdx < numList.length - 1) {
          scheduleIncrement(curIdx + 1);
        }
      }, delay);
    },
    [delay, setIdx, numList, setVisible]
  );

  useEffect(() => {
    scheduleIncrement(0);
  }, [setVisible, scheduleIncrement]);

  return (
    <div>
      <p
        className="math-text"
        style={{ visibility: shouldShow ? "visible" : "hidden" }}
      >
        {numList[idx]}
      </p>
    </div>
  );
}
