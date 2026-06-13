export default function TopoBackground() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-10 pointer-events-none"
      viewBox="0 0 800 500"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      {[
        "M-50,250 Q100,180 200,220 Q300,260 400,200 Q500,140 600,190 Q700,240 850,210",
        "M-50,290 Q100,220 200,260 Q300,300 400,240 Q500,180 600,230 Q700,280 850,250",
        "M-50,330 Q100,260 200,300 Q300,340 400,280 Q500,220 600,270 Q700,320 850,290",
        "M-50,370 Q100,300 200,340 Q300,380 400,320 Q500,260 600,310 Q700,360 850,330",
        "M-50,210 Q100,140 200,180 Q300,220 400,160 Q500,100 600,150 Q700,200 850,170",
        "M-50,170 Q120,110 220,140 Q350,175 450,120 Q560,65 680,110 Q780,145 850,130",
      ].map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke="#388BFD"
          strokeWidth={i < 2 ? 1.5 : 1}
        />
      ))}
    </svg>
  );
}
