export default function TopoBackground({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`absolute inset-0 w-full h-full opacity-10 pointer-events-none ${className}`}
      viewBox="0 0 800 400"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      {[
        "M-50,200 Q100,140 200,180 Q300,220 400,160 Q500,100 600,150 Q700,200 850,170",
        "M-50,240 Q100,180 200,220 Q300,260 400,200 Q500,140 600,190 Q700,240 850,210",
        "M-50,280 Q100,220 200,260 Q300,300 400,240 Q500,180 600,230 Q700,280 850,250",
        "M-50,160 Q100,100 200,140 Q300,180 400,120 Q500,60 600,110 Q700,160 850,130",
      ].map((d, i) => (
        <path key={i} d={d} fill="none" stroke="#388BFD" strokeWidth={i < 2 ? 1.5 : 0.75} />
      ))}
      <path d="M200,0 Q240,80 210,160 Q180,240 220,320" fill="none" stroke="#388BFD" strokeWidth={0.5} />
      <path d="M500,0 Q540,80 510,160 Q480,240 520,320" fill="none" stroke="#388BFD" strokeWidth={0.5} />
    </svg>
  );
}