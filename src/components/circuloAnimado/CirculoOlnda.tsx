import React from "react";

export type CirculoOndaSize = "mini" | "medio" | "grande";

const SIZE_PX: Record<CirculoOndaSize, number> = {
  mini: 12,
  medio: 50,
  grande: 80,
};

type Props = {
  /** mini · medio · grande — controla el diámetro del núcleo y las ondas */
  size?: CirculoOndaSize;
  className?: string;
};

export default function CirculoOnda({
  size = "medio",
  className = "",
}: Props) {
  const diameterPx = SIZE_PX[size];

  return (
    <div
      className={`ripple-container ${className}`.trim()}
      style={
        {
          "--ripple-diameter": `${diameterPx}px`,
        } as React.CSSProperties
      }
    >
      <div className="circleOnda" />
      <div className="wave" />
      <div className="wave" />
    </div>
  );
}
