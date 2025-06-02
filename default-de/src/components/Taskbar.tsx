import { useState, useEffect } from "react";
import "./Taskbar.css";

const Taskbar = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: any) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="taskbar">
      <div className="taskbarleft">
        <img src="https://images.wurdle.eu/zilver.png" />
      </div>
      <div className="taskbarright">
        <p>{formatTime(currentTime)}</p>
      </div>
    </div>
  );
};

export default Taskbar;
