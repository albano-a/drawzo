import { Stage, Layer, Line, Circle } from "react-konva";

interface InfiniteCanvasProps {
  stageRef: any;
  viewport: { width: number; height: number };
  stagePos: { x: number; y: number };
  stageScale: number;
  handleMouseDown: (e: any) => void;
  handleMouseMove: (e: any) => void;
  handleMouseUp: () => void;
  handleWheel: (e: any) => void;
  lines: {
    tool: string;
    points: number[];
    color: string;
    opacity?: number;
    strokeWidth?: number;
  }[];
  selectedLineIndex?: number | null;
  handleStageMouseDown?: (e: any) => void;
  handleStageMouseMove?: (e: any) => void;
  handleStageMouseUp?: () => void;
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
  selectedLineIndex,
  handleStageMouseDown,
  handleStageMouseMove,
  handleStageMouseUp,
}: InfiniteCanvasProps) => (
  <Stage
    ref={stageRef}
    width={viewport.width}
    height={viewport.height}
    x={stagePos.x}
    y={stagePos.y}
    scaleX={stageScale}
    scaleY={stageScale}
    style={{
      background:
        "radial-gradient(circle at 60% 40%, #a5b4fc 0%, #6366f1 40%, #312e81 100%)",
      boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
      borderRadius: "32px",
      border: "1.5px solid #fff4",
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
      transition: "box-shadow 0.3s, border 0.3s",
      touchAction: "none",
      margin: "auto",
      marginTop: "2vh",
      marginBottom: "2vh",
      maxWidth: "98vw",
      maxHeight: "96vh",
      outline: "none",
    }}
    onMouseDown={(e) => {
      handleMouseDown(e);
      if (handleStageMouseDown) handleStageMouseDown(e);
    }}
    onMouseMove={(e) => {
      handleMouseMove(e);
      if (handleStageMouseMove) handleStageMouseMove(e);
    }}
    onMouseUp={() => {
      handleMouseUp();
      if (handleStageMouseUp) handleStageMouseUp();
    }}
    onTouchStart={handleMouseDown}
    onTouchMove={handleMouseMove}
    onTouchEnd={handleMouseUp}
    onWheel={handleWheel}
  >
    <Layer>
      {/* Blurred color blobs for background flair */}
      <Line
        points={[
          0,
          0,
          viewport.width,
          0,
          viewport.width,
          viewport.height,
          0,
          viewport.height,
          0,
          0,
        ]}
        closed
        fillLinearGradientStartPoint={{ x: 0, y: 0 }}
        fillLinearGradientEndPoint={{ x: viewport.width, y: viewport.height }}
        fillLinearGradientColorStops={[
          0,
          "#a5b4fc44",
          0.5,
          "#f472b644",
          1,
          "#fbbf2444",
        ]}
        opacity={0.18}
        listening={false}
      />
      {/* Render brush, hardBrush, highlighter, eraser */}
      {lines.map((line, i) => {
        // Compute bounding box for the line
        const xs = line.points.filter((_, idx) => idx % 2 === 0);
        const ys = line.points.filter((_, idx) => idx % 2 === 1);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);
        const boxPadding = 12;
        // Helper for handle drag feedback
        const handleProps = (corner: "tl" | "tr" | "br" | "bl") => ({
          x:
            corner === "tl"
              ? minX - boxPadding
              : corner === "tr"
              ? maxX + boxPadding
              : corner === "br"
              ? maxX + boxPadding
              : minX - boxPadding,
          y:
            corner === "tl"
              ? minY - boxPadding
              : corner === "tr"
              ? minY - boxPadding
              : corner === "br"
              ? maxY + boxPadding
              : maxY + boxPadding,
          radius: 10,
          fill: "#fff",
          stroke: "#6366f1",
          strokeWidth: 3,
          draggable: false,
          listening: true,
          onMouseDown: (e: any) => {
            e.cancelBubble = true;
            if (handleStageMouseDown)
              handleStageMouseDown({
                ...e,
                corner,
                lineIndex: i,
                pointerPos: { x: e.evt.layerX, y: e.evt.layerY },
              });
          },
          onTouchStart: (e: any) => {
            e.cancelBubble = true;
            if (handleStageMouseDown)
              handleStageMouseDown({
                ...e,
                corner,
                lineIndex: i,
                pointerPos: {
                  x: e.evt.touches?.[0]?.clientX,
                  y: e.evt.touches?.[0]?.clientY,
                },
              });
          },
        });
        return (
          <>
            <Line
              key={i}
              points={line.points}
              stroke={line.color}
              strokeWidth={
                line.tool === "eraser"
                  ? 24
                  : line.strokeWidth ||
                    (line.tool === "hardBrush"
                      ? 6
                      : line.tool === "highlighter"
                      ? 16
                      : 4)
              }
              opacity={line.opacity || (line.tool === "highlighter" ? 0.3 : 1)}
              tension={0.5}
              lineCap="round"
              globalCompositeOperation={
                line.tool === "eraser" ? "destination-out" : "source-over"
              }
              shadowForStrokeEnabled={selectedLineIndex === i}
              shadowColor={selectedLineIndex === i ? "#6366f1" : undefined}
              shadowBlur={selectedLineIndex === i ? 8 : 0}
            />
            {/* Render bounding box and resize handles for selected line */}
            {selectedLineIndex === i && line.points.length >= 4 && (
              <>
                {/* Bounding box */}
                <Line
                  points={[
                    minX - boxPadding,
                    minY - boxPadding,
                    maxX + boxPadding,
                    minY - boxPadding,
                    maxX + boxPadding,
                    maxY + boxPadding,
                    minX - boxPadding,
                    maxY + boxPadding,
                    minX - boxPadding,
                    minY - boxPadding,
                  ]}
                  stroke="#6366f1"
                  strokeWidth={2}
                  dash={[8, 4]}
                  listening={false}
                />
                {/* Resize handles (corners) with robust event handling */}
                <Circle {...handleProps("tl")} />
                <Circle {...handleProps("tr")} />
                <Circle {...handleProps("br")} />
                <Circle {...handleProps("bl")} />
              </>
            )}
          </>
        );
      })}
    </Layer>
  </Stage>
);

export default InfiniteCanvas;
