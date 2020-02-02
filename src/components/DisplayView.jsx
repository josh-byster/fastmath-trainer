import React, { useState, useEffect } from "react";
import Flasher from "./Flasher";

export default function DisplayView() {
  const [numList, setNums] = useState([]);
  const generateNums = () => {
    const arr = [];
    for (let i = 0; i < 10; i++) {
      arr.push(Math.floor(Math.random() * 100 + 1));
    }
    setNums(arr);
  };

  useEffect(() => {
    generateNums();
  }, []);
  return (
    <div>
      <Flasher numList={numList} delay={300} length={50} />
    </div>
  );
}
