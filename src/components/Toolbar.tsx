import React, { useRef, useState, useEffect } from "react";
import { HStack, Box, Button, IconButton, useToast } from "@chakra-ui/react";
import { MdOutlineCleaningServices } from "react-icons/md";
import { MdDragIndicator } from "react-icons/md";
import { FaPaintBrush, FaEraser } from "react-icons/fa";
import { HexColorPicker } from "react-colorful";
import { Divider } from "@chakra-ui/react";
import { FaHighlighter } from "react-icons/fa";
import { FaHandPointer } from "react-icons/fa";
import { GiPaintBrush } from "react-icons/gi";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
} from "@chakra-ui/react";

interface ToolbarProps {
  tool: "select" | "brush" | "hardBrush" | "highlighter" | "eraser";
  setTool: (
    tool: "select" | "brush" | "hardBrush" | "highlighter" | "eraser"
  ) => void;
  color: string;
  setColor: (color: string) => void;
  onResetCanvas?: () => void;
  deleteSelectedLine?: () => void;
  selectedLineIndex?: number | null;
}

const Toolbar = ({
  tool,
  setTool,
  color,
  setColor,
  onResetCanvas,
  deleteSelectedLine,
  selectedLineIndex,
}: ToolbarProps) => {
  const toast = useToast();
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
      zIndex={20}
      bg="whiteAlpha.60"
      borderRadius="2xl"
      boxShadow="0 8px 32px 0 rgba(31,38,135,0.25)"
      border="1.5px solid #fff4"
      px={6}
      py={3}
      mx={2}
      display="flex"
      alignItems="center"
      gap={4}
      backdropFilter="blur(12px)"
      bgGradient="linear(to-b, whiteAlpha.80, whiteAlpha.100)"
      userSelect="none"
      style={{ transition: "box-shadow 0.3s, border 0.3s, background 0.3s" }}
    >
      <HStack spacing={2}>
        <IconButton
          aria-label="Select"
          icon={
            <FaHandPointer
              color={tool === "select" ? "#6366f1" : "#d1d5db"}
              style={{ transition: "color 0.2s" }}
            />
          }
          colorScheme={tool === "select" ? "purple" : "gray"}
          variant={tool === "select" ? "solid" : "ghost"}
          size="lg"
          boxShadow={tool === "select" ? "0 2px 12px #6366f155" : undefined}
          _hover={{ bg: "#ede9fe" }}
          onClick={() => setTool("select")}
        />
        <IconButton
          aria-label="Brush"
          icon={
            <FaPaintBrush
              color={tool === "brush" ? "#6366f1" : "#d1d5db"}
              style={{ transition: "color 0.2s" }}
            />
          }
          colorScheme={tool === "brush" ? "purple" : "gray"}
          variant={tool === "brush" ? "solid" : "ghost"}
          size="lg"
          boxShadow={tool === "brush" ? "0 2px 12px #6366f155" : undefined}
          _hover={{ bg: "#ede9fe" }}
          onClick={() => setTool("brush")}
        />
        <IconButton
          aria-label="Hard Brush"
          icon={
            <GiPaintBrush
              color={tool === "hardBrush" ? "#6366f1" : "#d1d5db"}
              style={{ transition: "color 0.2s" }}
            />
          }
          colorScheme={tool === "hardBrush" ? "purple" : "gray"}
          variant={tool === "hardBrush" ? "solid" : "ghost"}
          size="lg"
          boxShadow={tool === "hardBrush" ? "0 2px 12px #6366f155" : undefined}
          _hover={{ bg: "#ede9fe" }}
          onClick={() => setTool("hardBrush")}
        />
        <IconButton
          aria-label="Highlighter"
          icon={
            <FaHighlighter
              color={tool === "highlighter" ? "#6366f1" : "#d1d5db"}
              style={{ transition: "color 0.2s" }}
            />
          }
          colorScheme={tool === "highlighter" ? "purple" : "gray"}
          variant={tool === "highlighter" ? "solid" : "ghost"}
          size="lg"
          boxShadow={
            tool === "highlighter" ? "0 2px 12px #6366f155" : undefined
          }
          _hover={{ bg: "#ede9fe" }}
          onClick={() => setTool("highlighter")}
        />
        <IconButton
          aria-label="Eraser"
          icon={
            <FaEraser
              color={tool === "eraser" ? "#6366f1" : "#d1d5db"}
              style={{ transition: "color 0.2s" }}
            />
          }
          colorScheme={tool === "eraser" ? "purple" : "gray"}
          variant={tool === "eraser" ? "solid" : "ghost"}
          size="lg"
          boxShadow={tool === "eraser" ? "0 2px 12px #6366f155" : undefined}
          _hover={{ bg: "#ede9fe" }}
          onClick={() => setTool("eraser")}
        />
      </HStack>
      <Divider color="blackAlpha.200" orientation="vertical" />

      <Box display="flex" alignItems="center" gap={2}>
        <Box>
          {["brush", "hardBrush", "highlighter"].includes(tool) && (
            <Popover placement="bottom-start">
              <PopoverTrigger>
                <Box
                  w={10}
                  h={10}
                  borderRadius="lg"
                  border="2.5px solid #6366f1"
                  bg={color}
                  cursor={"pointer"}
                  boxShadow="0 2px 12px #6366f122"
                  transition="box-shadow 0.2s, border 0.2s"
                  _hover={{ boxShadow: "0 4px 16px #6366f144" }}
                  aria-label="Escolher cor"
                />
              </PopoverTrigger>
              <PopoverContent
                w="auto"
                bg="white"
                borderRadius="xl"
                boxShadow="0 8px 32px 0 rgba(31,38,135,0.18)"
                _focus={{ boxShadow: "outline" }}
                p={4}
              >
                <PopoverArrow />
                <PopoverCloseButton />
                <PopoverBody>
                  <HexColorPicker
                    color={color}
                    onChange={setColor}
                    style={{
                      width: 180,
                      height: 120,
                      borderRadius: 12,
                      boxShadow: "0 2px 8px #6366f122",
                      marginBottom: 10,
                    }}
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    style={{
                      width: 110,
                      fontFamily: "monospace",
                      borderRadius: 6,
                      border: "1.5px solid #6366f1",
                      padding: "4px 8px",
                      marginTop: 6,
                      background: "#f3f4f6",
                      color: "#312e81",
                      fontWeight: 600,
                      fontSize: 16,
                      outline: "none",
                      boxShadow: "0 1px 4px #6366f111",
                      transition: "border 0.2s, box-shadow 0.2s",
                    }}
                    maxLength={7}
                  />
                </PopoverBody>
              </PopoverContent>
            </Popover>
          )}
        </Box>
        <input
          type="text"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          disabled={tool === "eraser" || tool === "select"}
          style={{
            width: 90,
            fontFamily: "consolas",
            borderRadius: 6,
            border: "1.5px solid #6366f1",
            padding: "4px 8px",
            background:
              tool === "eraser" || tool === "select" ? "#f3f4f6" : "#fff",
            color:
              tool === "eraser" || tool === "select" ? "#a1a1aa" : "#312e81",
            fontWeight: 600,
            fontSize: 16,
            outline: "none",
            boxShadow: "0 1px 4px #6366f111",
            transition: "border 0.2s, box-shadow 0.2s",
          }}
          maxLength={7}
        />
      </Box>
      <Divider color="blackAlpha.200" orientation="vertical" />
      <Button
        ml={1}
        colorScheme="red"
        variant="outline"
        size="sm"
        onClick={onResetCanvas}
        aria-label="Reset Canvas"
      >
        <MdOutlineCleaningServices />
      </Button>
      {typeof deleteSelectedLine === "function" &&
        selectedLineIndex !== null && (
          <Button
            ml={1}
            colorScheme="red"
            variant="solid"
            size="sm"
            onClick={() => {
              deleteSelectedLine();
              toast({ title: "Line deleted", status: "info", duration: 1200 });
            }}
            aria-label="Delete Selected Line"
          >
            Delete
          </Button>
        )}
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
