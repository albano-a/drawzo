import React, { useRef, useState, useEffect } from "react";
import { HStack, Box, Button, IconButton } from "@chakra-ui/react";
import { MdOutlineCleaningServices } from "react-icons/md";
import { MdDragIndicator } from "react-icons/md";
import { FaPaintBrush, FaEraser } from "react-icons/fa";
import { Divider } from "@chakra-ui/react";

interface ToolbarProps {
  tool: "brush" | "eraser" | "pan";
  setTool: (tool: "brush" | "eraser" | "pan") => void;
  color: string;
  setColor: (color: string) => void;
  COLORS: string[];
  onResetCanvas?: () => void; // <-- add this line
}

const Toolbar = ({
  tool,
  setTool,
  color,
  setColor,
  COLORS,
  onResetCanvas,
}: ToolbarProps) => {
  const [pos, setPos] = useState({
    x: window.innerWidth / 2,
    y: window.innerHeight - 100,
  });
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const [dragged, setDragged] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (!dragged) {
        setPos({
          x: window.innerWidth / 2,
          y: window.innerHeight - 100,
        });
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [dragged]);

  const onMouseDown = (e: React.MouseEvent) => {
    setDragged(true);
    dragging.current = true;
    offset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!dragging.current) return;
    setPos({
      x: e.clientX - offset.current.x,
      y: e.clientY - offset.current.y,
    });
  };

  const onMouseUp = () => {
    dragging.current = false;
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  };

  return (
    <Box
      position="absolute"
      left={pos.x}
      top={pos.y}
      cursor="default"
      transform="translateX(-50%)"
      zIndex={10}
      bg="whiteAlpha.800"
      border={"0.5px solid #9ea2a8"}
      boxShadow="lg"
      borderRadius="xl"
      height={12}
      px={4}
      py={2}
      mx={2}
      display="flex"
      alignItems="center"
      gap={3}
      backdropFilter="blur(2px)"
      bgGradient="linear(to-b, whiteAlpha.800, whiteAlpha.100)"
      userSelect="none"
    >
      <HStack spacing={2}>
        <IconButton
          aria-label="Brush"
          icon={
            <FaPaintBrush color={tool === "brush" ? "#2d3748" : "#d8d8d8"} />
          }
          colorScheme={tool === "brush" ? "indigo" : "silver"}
          variant={tool === "brush" ? "solid" : "ghost"}
          onClick={() => setTool("brush")}
        />
        <IconButton
          aria-label="Eraser"
          icon={<FaEraser color={tool === "eraser" ? "#2d3748" : "#d8d8d8"} />}
          colorScheme={tool === "eraser" ? "indigo" : "silver"}
          variant={tool === "eraser" ? "solid" : "ghost"}
          onClick={() => setTool("eraser")}
        />
      </HStack>

      <HStack spacing={1} ml={4}>
        {COLORS.map((c) => (
          <Button
            key={c}
            size="xs"
            borderRadius="full"
            bg={c}
            border={color === c ? "2px solid #6366f1" : "2px solid #e8e8e8"}
            onClick={() => setColor(c)}
            isDisabled={tool !== "brush"}
            _hover={{ opacity: 0.8 }}
            minW={6}
            h={6}
            p={0}
          />
        ))}
      </HStack>
      <Button
        ml={2}
        colorScheme="red"
        variant="outline"
        size="sm"
        onClick={onResetCanvas}
        aria-label="Reset Canvas"
      >
        <MdOutlineCleaningServices />
      </Button>
      <Divider color="blackAlpha.200" orientation="vertical" />
      <Box
        onMouseDown={onMouseDown}
        cursor="grab"
        pr={0}
        pl={0}
        userSelect="none"
        display="flex"
        alignItems="center"
        aria-label="Arrastar toolbar"
      >
        <Box fontSize="2xl" color="#9ea2a8" fontWeight="bold" letterSpacing={1}>
          <MdDragIndicator />
        </Box>
      </Box>
    </Box>
  );
};

export default Toolbar;
