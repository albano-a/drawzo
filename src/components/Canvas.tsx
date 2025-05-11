import useCanvasLogic from "../hooks/useCanvasLogic";
import InfiniteCanvas from "./InfiniteCanvas";
import Toolbar from "./Toolbar";
import { Box } from "@chakra-ui/react";

const WORLD_SIZE = 100_000;
const CANVAS_COLOR = "#fffcf9"; // 1e293b - fffcf9

const Canvas = () => {
  const {
    tool,
    setTool,
    color,
    setColor,
    lines,
    selectedLineIndex,
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
  } = useCanvasLogic({ WORLD_SIZE, CANVAS_COLOR });

  return (
    <Box position="relative" w="100vw" h="100vh" bg="transparent">
      <Toolbar
        tool={tool}
        setTool={setTool}
        color={color}
        setColor={setColor}
        onResetCanvas={reset}
        deleteSelectedLine={deleteSelectedLine}
        selectedLineIndex={selectedLineIndex}
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
          selectedLineIndex={selectedLineIndex}
          handleStageMouseDown={handleStageMouseDown}
          handleStageMouseMove={handleStageMouseMove}
          handleStageMouseUp={handleStageMouseUp}
          WORLD_SIZE={WORLD_SIZE}
        />
      </Box>
    </Box>
  );
};

export default Canvas;
