import { Menu, UserRound, Wifi } from "lucide-react";
import { useEffect, useState } from "react";

export const Header = () => {
  const [session, setSession] = useState("00:00:00");
  const hour = new Date().getHours();
  const minute = new Date().getMinutes();
  const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;

  useEffect(() => {
    const interval = setInterval(() => {
      const [hours, minutes, seconds] = session.split(":");
      const newSeconds = (parseInt(seconds) + 1) % 60;
      console.log(newSeconds.toString().padStart(2, "0"));
      const newMinutes =
        (parseInt(minutes) + Math.floor((parseInt(seconds) + 1) / 60)) % 60;
      const newHours =
        parseInt(hours) +
        Math.floor(
          (parseInt(minutes) + Math.floor((parseInt(seconds) + 1) / 60)) / 60,
        );

      const formattedHours = newHours.toString().padStart(2, "0");
      const formattedMinutes = newMinutes.toString().padStart(2, "0");
      const formattedSeconds = newSeconds.toString().padStart(2, "0");

      setSession(`${formattedHours}:${formattedMinutes}:${formattedSeconds}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [session]);

  return (
    <header className="bg-[#51417F] text-white">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 rounded-md border-2 border-[#B1FFD7] p-2 text-sm">
            <UserRound className="size-3 text-[#76FF46]" />
            01
          </span>
          <span>{session}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>{time}</span>
          <Wifi />
          <Menu className="text-[#B1FFD7]" />
        </div>
      </div>
    </header>
  );
};
