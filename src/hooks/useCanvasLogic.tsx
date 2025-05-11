import { useRef, useState, useEffect } from "react";

const DEFAULT_BRUSH_COLOR = "#000";

const TOOL_TYPES = [
  "select",
  "brush",
  "hardBrush",
  "highlighter",
  "eraser",
] as const;
type ToolType = (typeof TOOL_TYPES)[number];

type LineType = {
  tool: ToolType;
  points: number[];
  color: string;
  opacity?: number;
  strokeWidth?: number;
};

function distanceToSegmentSquared(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
) {
  // Helper for hit testing: returns squared distance from point to segment
  const l2 = (x2 - x1) ** 2 + (y2 - y1) ** 2;
  if (l2 === 0) return (px - x1) ** 2 + (py - y1) ** 2;
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  const projX = x1 + t * (x2 - x1);
  const projY = y1 + t * (y2 - y1);
  return (px - projX) ** 2 + (py - projY) ** 2;
}

const useCanvasLogic = ({
  WORLD_SIZE,
  CANVAS_COLOR,
}: {
  WORLD_SIZE: number;
  CANVAS_COLOR: string;
}) => {
  const [tool, setTool] = useState<ToolType>("select");
  const [color, setColor] = useState(DEFAULT_BRUSH_COLOR);
  const [lines, setLines] = useState<LineType[]>([]);
  const [selectedLineIndex, setSelectedLineIndex] = useState<number | null>(
    null
  );
  const isDrawing = useRef(false);
  const stageRef = useRef<any>(null);

  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const [stagePos, setStagePos] = useState({
    x: viewport.width / 2 - WORLD_SIZE / 2,
    y: viewport.height / 2 - WORLD_SIZE / 2,
  });
  const [stageScale, setStageScale] = useState(1);
  const lastPanPos = useRef<{ x: number; y: number } | null>(null);

  const reset = () => {
    setLines([]);
    setStagePos({
      x: window.innerWidth / 2 - WORLD_SIZE / 2,
      y: window.innerHeight / 2 - WORLD_SIZE / 2,
    });
    setStageScale(1);
    setTool("select");
    setColor("#000");
    setSelectedLineIndex(null);
  };

  useEffect(() => {
    const handleResize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- Selection logic ---
  const hitTestLine = (
    line: LineType,
    px: number,
    py: number,
    tolerance = 12
  ) => {
    const pts = line.points;
    for (let i = 0; i < pts.length - 2; i += 2) {
      const d2 = distanceToSegmentSquared(
        px,
        py,
        pts[i],
        pts[i + 1],
        pts[i + 2],
        pts[i + 3]
      );
      if (d2 < tolerance * tolerance) return true;
    }
    return false;
  };

  const handleMouseDown = (e: any) => {
    if (e.evt.button === 1) {
      lastPanPos.current = {
        x: e.evt.clientX,
        y: e.evt.clientY,
      };
      document.body.style.cursor = "grabbing";
      return;
    }
    const pos = e.target.getStage().getPointerPosition();
    const x = (pos.x - stagePos.x) / stageScale;
    const y = (pos.y - stagePos.y) / stageScale;
    if (tool === "select") {
      // Try to select a line
      let found = false;
      for (let i = lines.length - 1; i >= 0; i--) {
        // Topmost first
        if (hitTestLine(lines[i], x, y)) {
          setSelectedLineIndex(i);
          found = true;
          break;
        }
      }
      if (!found) setSelectedLineIndex(null);
      return;
    }
    // Drawing tools
    isDrawing.current = true;
    let line: LineType = {
      tool,
      points: [x, y],
      color: tool === "eraser" ? CANVAS_COLOR : color,
    };
    if (tool === "highlighter") {
      line.opacity = 0.3;
      line.strokeWidth = 16;
    }
    if (tool === "hardBrush") {
      line.strokeWidth = 6;
    }
    setLines([...lines, line]);
    setSelectedLineIndex(null);
  };

  const handleMouseMove = (e: any) => {
    if (lastPanPos.current && e.evt.buttons === 4) {
      const dx = e.evt.clientX - lastPanPos.current.x;
      const dy = e.evt.clientY - lastPanPos.current.y;
      setStagePos((pos) => ({
        x: pos.x + dx,
        y: pos.y + dy,
      }));
      lastPanPos.current = {
        x: e.evt.clientX,
        y: e.evt.clientY,
      };
      return;
    }
    if (!isDrawing.current) return;
    if (tool === "select") return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    let lastLine = lines[lines.length - 1];
    lastLine = {
      ...lastLine,
      points: lastLine.points.concat([
        (point.x - stagePos.x) / stageScale,
        (point.y - stagePos.y) / stageScale,
      ]),
    };
    const newLines = lines.slice(0, -1).concat(lastLine);
    setLines(newLines);
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
    lastPanPos.current = null;
    document.body.style.cursor = "";
  };

  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const scaleBy = 1.05;
    const oldScale = stageScale;
    const mousePointTo = {
      x: (e.evt.x - stagePos.x) / oldScale,
      y: (e.evt.y - stagePos.y) / oldScale,
    };
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    setStageScale(newScale);
    setStagePos({
      x: e.evt.x - mousePointTo.x * newScale,
      y: e.evt.y - mousePointTo.y * newScale,
    });
  };

  // --- Move selected line ---
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(
    null
  );

  // --- Resize selected line ---
  const [resizeHandle, setResizeHandle] = useState<null | {
    type: "start" | "end";
  }>(null);
  const getHandleAt = (
    x: number,
    y: number,
    line: LineType,
    tolerance = 14
  ) => {
    if (!line) return null;
    const [x1, y1] = [line.points[0], line.points[1]];
    const [x2, y2] = [
      line.points[line.points.length - 2],
      line.points[line.points.length - 1],
    ];
    if ((x - x1) ** 2 + (y - y1) ** 2 < tolerance * tolerance)
      return { type: "start" as const };
    if ((x - x2) ** 2 + (y - y2) ** 2 < tolerance * tolerance)
      return { type: "end" as const };
    return null;
  };

  // --- Resize box logic ---
  const [resizeBoxHandle, setResizeBoxHandle] = useState<
    null | "tl" | "tr" | "br" | "bl"
  >(null);
  const [resizeBoxOrigin, setResizeBoxOrigin] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const getBoxHandleAt = (
    x: number,
    y: number,
    minX: number,
    minY: number,
    maxX: number,
    maxY: number,
    pad: number,
    tol = 16
  ) => {
    if ((x - (minX - pad)) ** 2 + (y - (minY - pad)) ** 2 < tol * tol)
      return "tl";
    if ((x - (maxX + pad)) ** 2 + (y - (minY - pad)) ** 2 < tol * tol)
      return "tr";
    if ((x - (maxX + pad)) ** 2 + (y - (maxY + pad)) ** 2 < tol * tol)
      return "br";
    if ((x - (minX - pad)) ** 2 + (y - (maxY + pad)) ** 2 < tol * tol)
      return "bl";
    return null;
  };

  const handleStageMouseDown = (e: any) => {
    if (tool === "select" && selectedLineIndex !== null) {
      const pos = e.target.getStage().getPointerPosition();
      const x = (pos.x - stagePos.x) / stageScale;
      const y = (pos.y - stagePos.y) / stageScale;
      const line = lines[selectedLineIndex];
      const xs = line.points.filter((_, idx) => idx % 2 === 0);
      const ys = line.points.filter((_, idx) => idx % 2 === 1);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);
      const boxPadding = 12;
      // Check for box resize handle first
      const handle = getBoxHandleAt(x, y, minX, minY, maxX, maxY, boxPadding);
      if (handle) {
        setResizeBoxHandle(handle);
        setResizeBoxOrigin({ x, y });
        return;
      }
      // Check for resize handle first
      const handleResize = getHandleAt(x, y, line);
      if (handleResize) {
        setResizeHandle(handleResize);
        return;
      }
      // Check if click is near the selected line for dragging
      if (hitTestLine(line, x, y)) {
        setDragOffset({ x, y });
      }
    }
  };

  const handleStageMouseMove = (e: any) => {
    if (tool === "select" && selectedLineIndex !== null) {
      const pos = e.target.getStage().getPointerPosition();
      const x = (pos.x - stagePos.x) / stageScale;
      const y = (pos.y - stagePos.y) / stageScale;
      if (resizeBoxHandle && resizeBoxOrigin) {
        setLines((prev) =>
          prev.map((l, i) => {
            if (i !== selectedLineIndex) return l;
            // Compute bounding box
            const xs = l.points.filter((_, idx) => idx % 2 === 0);
            const ys = l.points.filter((_, idx) => idx % 2 === 1);
            const minX = Math.min(...xs);
            const maxX = Math.max(...xs);
            const minY = Math.min(...ys);
            const maxY = Math.max(...ys);
            // Compute new box size
            let newMinX = minX,
              newMaxX = maxX,
              newMinY = minY,
              newMaxY = maxY;
            if (resizeBoxHandle === "tl") {
              newMinX = x;
              newMinY = y;
            } else if (resizeBoxHandle === "tr") {
              newMaxX = x;
              newMinY = y;
            } else if (resizeBoxHandle === "br") {
              newMaxX = x;
              newMaxY = y;
            } else if (resizeBoxHandle === "bl") {
              newMinX = x;
              newMaxY = y;
            }
            // Prevent collapse (minimum size)
            const minBoxSize = 10;
            if (
              newMaxX - newMinX < minBoxSize ||
              newMaxY - newMinY < minBoxSize
            ) {
              return l;
            }
            // Scale all points proportionally
            const scaleX = (newMaxX - newMinX) / (maxX - minX || 1);
            const scaleY = (newMaxY - newMinY) / (maxY - minY || 1);
            const newPoints = l.points.map((p, idx) => {
              if (idx % 2 === 0) {
                return newMinX + (p - minX) * scaleX;
              } else {
                return newMinY + (p - minY) * scaleY;
              }
            });
            return { ...l, points: newPoints };
          })
        );
        return;
      }
      if (resizeHandle) {
        setLines((prev) =>
          prev.map((l, i) => {
            if (i !== selectedLineIndex) return l;
            let newPoints = [...l.points];
            if (resizeHandle.type === "start") {
              newPoints[0] = x;
              newPoints[1] = y;
            } else if (resizeHandle.type === "end") {
              newPoints[newPoints.length - 2] = x;
              newPoints[newPoints.length - 1] = y;
            }
            return { ...l, points: newPoints };
          })
        );
        return;
      }
      if (dragOffset) {
        const dx = x - dragOffset.x;
        const dy = y - dragOffset.y;
        setLines((prev) =>
          prev.map((l, i) => {
            if (i !== selectedLineIndex) return l;
            return {
              ...l,
              points: l.points.map((p, idx) =>
                idx % 2 === 0 ? p + dx : p + dy
              ),
            };
          })
        );
        setDragOffset({ x, y });
      }
    }
  };

  const handleStageMouseUp = () => {
    setDragOffset(null);
    setResizeHandle(null);
    setResizeBoxHandle(null);
    setResizeBoxOrigin(null);
  };

  // --- Delete selected line ---
  const deleteSelectedLine = () => {
    if (selectedLineIndex !== null) {
      setLines((lines) => lines.filter((_, i) => i !== selectedLineIndex));
      setSelectedLineIndex(null);
    }
  };

  return {
    tool,
    setTool,
    color,
    setColor,
    lines,
    selectedLineIndex,
    setSelectedLineIndex,
    deleteSelectedLine,
    viewport,
    stagePos,
    stageScale,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    handleStageMouseDown,
    handleStageMouseMove,
    handleStageMouseUp,
    reset,
    stageRef,
  };
};

export default useCanvasLogic;
