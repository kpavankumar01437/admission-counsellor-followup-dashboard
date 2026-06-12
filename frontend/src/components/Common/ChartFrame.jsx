import { useEffect, useRef, useState } from "react";

const ChartFrame = ({ children, height = 320 }) => {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const updateWidth = () => {
      setWidth(Math.max(Math.floor(node.getBoundingClientRect().width), 320));
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="h-80 min-h-80 w-full min-w-0 overflow-x-auto">
      {width > 0 ? children({ width, height }) : <div className="h-full w-full rounded-md bg-slate-50" />}
    </div>
  );
};

export default ChartFrame;
