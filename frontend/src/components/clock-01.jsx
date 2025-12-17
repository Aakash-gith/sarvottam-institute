"use client";

import * as React from "react";
import {
  Widget,
  WidgetContent,
  WidgetTitle,
} from "@/components/ui/widget";

export default function WidgetDemo() {
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const formatTime = (num) => String(num).padStart(2, "0");
  const minutes = formatTime(time.getMinutes());
  const hours = time.getHours() % 12 || 12;

  return (
    <Widget className="bg-slate-900 border-slate-800 shadow-xl min-w-[200px]">
      <WidgetContent className="flex-col gap-2 items-center justify-center p-6">
        <WidgetTitle className="text-6xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-mono">
          {hours}:{minutes}
        </WidgetTitle>
        <div className="text-slate-400 text-sm font-medium tracking-wide uppercase mt-2">
          {time.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
        </div>
      </WidgetContent>
    </Widget>
  );
}
