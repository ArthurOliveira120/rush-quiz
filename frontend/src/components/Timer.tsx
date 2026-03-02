import { useEffect, useState } from "react";
import styles from "./Timer.module.css";

type TimerProps = {
  endTime: number;
  duration: number;
};

export function Timer({ endTime, duration }: TimerProps) {
  const [remaining, setRemaining] = useState(endTime - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const timeLeft = endTime - Date.now();

      if (timeLeft <= 0) {
        setRemaining(0);
        clearInterval(interval);
      } else {
        setRemaining(timeLeft);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [endTime]);

  const percentage = Math.max((remaining / duration) * 100, 0);

  const hue = (percentage / 100) * 120;
  const dynamicColor = `hsl(${hue}, 90%, 50%)`;

  const timeLeft = Math.ceil(remaining / 1000);

  return (
    <div className={styles.container}>
      <h4>{timeLeft >= 10 ? timeLeft : `0${timeLeft}`}</h4>
      <div className={styles.wrapper}>
        <div
          className={styles.bar}
          style={{ width: `${percentage}%`, backgroundColor: dynamicColor }}
        />
      </div>
    </div>
  );
}
