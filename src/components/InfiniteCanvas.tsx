import { Stage, Layer, Line } from "react-konva";

interface InfiniteCanvasProps {
  stageRef: any;
  viewport: { width: number; height: number };
  stagePos: { x: number; y: number };
  stageScale: number;
  handleMouseDown: (e: any) => void;
  handleMouseMove: (e: any) => void;
  handleMouseUp: () => void;
  handleWheel: (e: any) => void;
  lines: { tool: "brush" | "eraser"; points: number[]; color: string }[];
  WORLD_SIZE: number;
}

const InfiniteCanvas = ({
  stageRef,
  viewport,
  stagePos,
  stageScale,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleWheel,
  lines,
  //WORLD_SIZE,
}: InfiniteCanvasProps) => (
  <Stage
    ref={stageRef}
    width={viewport.width}
    height={viewport.height}
    x={stagePos.x}
    y={stagePos.y}
    scaleX={stageScale}
    scaleY={stageScale}
    style={{ background: "transparent", touchAction: "none" }}
    onMouseDown={handleMouseDown}
    onMousemove={handleMouseMove}
    onMouseup={handleMouseUp}
    onTouchStart={handleMouseDown}
    onTouchMove={handleMouseMove}
    onTouchEnd={handleMouseUp}
    onWheel={handleWheel}
  >
    <Layer>
      {/* // Grid infinito comentado
      {Array.from({ length: Math.ceil(WORLD_SIZE / 100) }).map((_, i) => (
        <Line
          key={`vgrid-${i}`}
          points={[i * 100, 0, i * 100, WORLD_SIZE]}
          stroke="#334155"
          strokeWidth={0.5}
          listening={false}
        />
      ))}
      {Array.from({ length: Math.ceil(WORLD_SIZE / 100) }).map((_, i) => (
        <Line
          key={`hgrid-${i}`}
          points={[0, i * 100, WORLD_SIZE, i * 100]}
          stroke="#334155"
          strokeWidth={0.5}
          listening={false}
        />
      ))} */}
      {lines.map((line, i) => (
        <Line
          key={i}
          points={line.points}
          stroke={line.color}
          strokeWidth={line.tool === "eraser" ? 24 : 4}
          tension={0.5}
          lineCap="round"
          globalCompositeOperation={
            line.tool === "eraser" ? "destination-out" : "source-over"
          }
        />
      ))}
    </Layer>
  </Stage>
);

export default InfiniteCanvas;
