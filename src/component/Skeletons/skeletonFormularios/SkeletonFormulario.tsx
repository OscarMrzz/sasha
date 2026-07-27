import React from "react";

const SkeletonFormulario: React.FC = () => {
  return (
    <div className="animate-pulse flex flex-col gap-6 p-6 bg-gray-800 rounded-lg shadow-lg w-full max-w-lg mx-auto">
      <div className="h-8 bg-gray-700 rounded w-1/2 mb-4" />
      <div className="h-6 bg-gray-700 rounded w-3/4 mb-2" />
      <div className="h-6 bg-gray-700 rounded w-2/3 mb-2" />
      <div className="h-6 bg-gray-700 rounded w-1/2 mb-2" />
      <div className="h-32 bg-gray-700 rounded w-full mb-4" />
      <div className="flex gap-4">
        <div className="h-10 bg-gray-700 rounded w-1/3" />
        <div className="h-10 bg-gray-700 rounded w-1/3" />
      </div>
    </div>
  );
};

export default SkeletonFormulario;
