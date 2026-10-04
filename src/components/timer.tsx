import { useEffect, useState } from "react";
import { Text } from "react-native";

type TimerProps = {
  duration: number;
};

export default function Timer({ duration }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (timeLeft <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((previousTime) => previousTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <Text>
      {minutes}:{seconds.toString().padStart(2, "0")}
    </Text>
  );
}
