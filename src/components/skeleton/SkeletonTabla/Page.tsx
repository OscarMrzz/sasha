import { div } from "framer-motion/client";
import React from "react";

const SkeletonTabla = () => {
  return (
    <div className="  flex flex-col gap-4">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="bg-slate-700 h-28 animate-pulse p-4 flex justify-between cursor-pointer hover:bg-slate-600 transition-colors duration-300"
        ></div>
      ))}
    </div>
  );
};

export default SkeletonTabla;
