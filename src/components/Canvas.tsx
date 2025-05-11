import { useRef, useState, useEffect } from "react";
import InfiniteCanvas from "./InfiniteCanvas";
import Toolbar from "./Toolbar";
import { Box } from "@chakra-ui/react";

const COLORS = [
  "#000",
  "#fff",
  "#f87171",
  "#fbbf24",
  "#34d399",
  "#60a5fa",
  "#a78bfa",
  "#f472b6",
];

const WORLD_SIZE = 100_000;
const CANVAS_COLOR = "#fffcf9"; // 1e293b - fffcf9

const Canvas = () => {
  const [tool, setTool] = useState<"brush" | "eraser" | "pan">("brush");
  const [color, setColor] = useState("#fff");
  const [lines, setLines] = useState<
    { tool: "brush" | "eraser"; points: number[]; color: string }[]
  >([]);
  const isDrawing = useRef(false);
  const stageRef = useRef<any>(null);

  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Pan & zoom state
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
    setTool("brush");
    setColor("#000");
  };

  useEffect(() => {
    const handleResize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handlers
  const handleMouseDown = (e: any) => {
    // Pan apenas se botão do meio for pressionado
    if (e.evt.button === 1) {
      lastPanPos.current = {
        x: e.evt.clientX,
        y: e.evt.clientY,
      };
      document.body.style.cursor = "grabbing";
      return;
    }
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    setLines([
      ...lines,
      ...(tool !== "pan"
        ? [
            {
              tool,
              points: [
                (pos.x - stagePos.x) / stageScale,
                (pos.y - stagePos.y) / stageScale,
              ],
              color: tool === "eraser" ? CANVAS_COLOR : color,
            },
          ]
        : []),
    ]);
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

  return (
    <Box position="relative" w="100vw" h="100vh" bg="transparent">
      <Toolbar
        tool={tool}
        setTool={setTool}
        color={color}
        setColor={setColor}
        COLORS={COLORS}
        onResetCanvas={reset}
      />
      <Box
        position="absolute"
        top={0}
        left={0}
        w="100vw"
        h="100vh"
        overflow="hidden"
        bg={CANVAS_COLOR}
      >
        <InfiniteCanvas
          stageRef={stageRef}
          viewport={viewport}
          stagePos={stagePos}
          stageScale={stageScale}
          handleMouseDown={handleMouseDown}
          handleMouseMove={handleMouseMove}
          handleMouseUp={handleMouseUp}
          handleWheel={handleWheel}
          lines={lines}
          WORLD_SIZE={WORLD_SIZE}
        />
      </Box>
    </Box>
  );
};

export default Canvas;
