type P = [number, number];
const TR: P[] = [[400,0],[360,30],[392,72],[318,58],[340,112],[276,96],[296,150],[236,138],[250,196],[198,182],[384,138],[310,206],[214,236],[160,226],[268,254]];
const TRE: [number, number][] = [[0,1],[1,2],[1,3],[3,2],[3,4],[2,4],[3,5],[5,4],[5,6],[4,6],[5,7],[7,6],[7,8],[6,8],[7,9],[9,8],[2,10],[10,4],[10,11],[6,11],[8,11],[8,12],[9,12],[12,13],[9,13],[11,14],[12,14],[8,14]];
const BL: P[] = [[0,300],[34,262],[18,214],[78,236],[64,180],[120,206],[110,268],[160,170],[170,240],[44,140]];
const BLE: [number, number][] = [[0,1],[1,2],[1,3],[2,3],[2,4],[3,4],[3,5],[4,5],[3,6],[5,6],[1,6],[4,7],[5,7],[5,8],[6,8],[7,8],[2,9],[4,9]];

function Cluster({ pts, edges, className }: { pts: P[]; edges: [number, number][]; className: string }) {
  return (
    <svg viewBox="0 0 400 300" className={className} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="1.2" vectorEffect="non-scaling-stroke">
        {edges.map(([a, b], i) => (
          <line key={i} x1={pts[a]![0]} y1={pts[a]![1]} x2={pts[b]![0]} y2={pts[b]![1]} vectorEffect="non-scaling-stroke" />
        ))}
      </g>
      <g fill="currentColor">
        {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2.5" />)}
      </g>
    </svg>
  );
}

export function NetworkMesh() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden text-pattern opacity-70" aria-hidden="true">
      <Cluster pts={TR} edges={TRE} className="absolute right-0 top-0 w-[75vw] max-w-[640px] md:w-[45vw]" />
      <Cluster pts={BL} edges={BLE} className="absolute bottom-0 left-0 w-[60vw] max-w-[480px] md:w-[32vw]" />
    </div>
  );
}
