import fs from "fs";
import { Box, render, Text, useInput, useApp } from "ink";
import path from "path";
import { useEffect } from "react";
import { useState } from "react";
import clipboard from "clipboardy";

const PATH_WIDTH = 20;
const terminalWidth = process.stdout.columns;
const terminalHeight = process.stdout.rows;

const isUnix = process.platform === "darwin" || process.platform === "linux";

function getFileIcon(fileName: string, isDir: boolean): string {
  if (isDir) {
    return "";
  }

  const ext = path.extname(fileName).toLowerCase();
  switch (ext) {
    case ".js":
    case ".ts":
    case ".jsx":
    case ".tsx":
      return "";
    case ".json":
      return "";
    case ".md":
      return "";
    case ".html":
    case ".htm":
      return "";
    case ".css":
    case ".scss":
    case ".sass":
      return "";
    case ".png":
    case ".jpg":
    case ".jpeg":
    case ".gif":
    case ".svg":
      return "";
    case ".mp3":
    case ".wav":
    case ".ogg":
      return "";
    case ".mp4":
    case ".avi":
    case ".mov":
      return "";
    case ".zip":
    case ".rar":
    case ".7z":
      return "";
    case ".pdf":
      return "";
    default:
      return "";
  }
}

function normalizeItem(item: string) {
  const len = item.length;
  const adjustedWidth = PATH_WIDTH - 3;
  if (len > adjustedWidth) {
    return item.substring(0, adjustedWidth - 3) + "...";
  } else if (len < adjustedWidth) {
    return item + " ".repeat(adjustedWidth - len);
  }
  return item;
}

function App() {
  const { exit } = useApp();
  const [terminalSize, setTerminalSize] = useState({
    width: terminalWidth,
    height: terminalHeight,
  });
  const [currentPath, setCurrentPath] = useState(process.cwd());
  const [pwdFileList, setPwdFileList] = useState([
    "..",
    ".",
    ...fs.readdirSync(currentPath),
  ]);

  const [isHorizontal, setIsHorizontal] = useState(
    terminalSize.width / PATH_WIDTH >= 2
  );
  const [selected, setSelected] = useState({
    row: 0,
    col: 0,
  });
  const [scrollOffset, setScrollOffset] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const cols = Math.floor(terminalSize.width / PATH_WIDTH);
  const visibleRows = Math.floor(terminalSize.height - 3);
  const matriz: string[][] = [];
  if (isHorizontal) {
    for (let i = 0; i < pwdFileList.length; i += cols) {
      const row = pwdFileList.slice(i, i + cols);
      matriz.push(row);
    }
    if (matriz.length > 4) {
      setIsHorizontal(false);
    }
  } else {
    for (let i = 0; i < pwdFileList.length; i++) {
      matriz.push([pwdFileList[i] as string]);
    }
  }
  useEffect(() => {
    process.stdout.on("resize", () => {
      setTerminalSize({
        width: process.stdout.columns,
        height: process.stdout.rows,
      });
    });
    return () => {
      process.stdout.removeAllListeners("resize");
    };
  }, []);
  useInput(async (input, key) => {
    if (input === "q") {
      exit();
    } else if (input === "s") {
      setIsHorizontal((prev) => !prev);
    } else if (input === "/" && !isHorizontal) {
      setIsSearching(true);
      setSearchQuery("");
    } else if (isSearching) {
      if (key.return) {
        setIsSearching(false);
        if (searchQuery) {
          const foundIndex = pwdFileList.findIndex((item) =>
            item.toLowerCase().includes(searchQuery.toLowerCase())
          );
          if (foundIndex !== -1) {
            setSelected({ row: foundIndex, col: 0 });
            setScrollOffset(
              Math.max(0, foundIndex - Math.floor(visibleRows / 2))
            );
          }
        }
      } else if (key.backspace) {
        setSearchQuery((prev) => prev.slice(0, -1));
      } else if (input.length === 1) {
        setSearchQuery((prev) => prev + input);
      }
    } else if (key.tab) {
      const selectedItem = matriz[selected.row][selected.col];
      const newPath = path.join(currentPath, selectedItem);

      if (selectedItem === ".") {
        clipboard.writeSync(`cd ${newPath}`);
        exit();
      }

      try {
        const stats = fs.statSync(newPath);
        if (stats.isDirectory()) {
          setCurrentPath(newPath);
          setPwdFileList(["..", ".", ...fs.readdirSync(newPath)]);
          setSelected({ row: 0, col: 0 });
        }
      } catch (error) {
        // Si no es un directorio o no existe, no hacemos nada
      }
    } else if (key.upArrow) {
      if (isHorizontal) {
        const newRow = selected.row > 0 ? selected.row - 1 : matriz.length - 1;
        const maxCol = matriz[newRow].length - 1;
        const newCol = Math.min(selected.col, maxCol);
        setSelected({ row: newRow, col: newCol });
      } else {
        if (selected.row > 0) {
          setSelected({ row: selected.row - 1, col: 0 });
          if (selected.row <= scrollOffset) {
            setScrollOffset((prev) => Math.max(0, prev - 1));
          }
        } else {
          setSelected({ row: matriz.length - 1, col: 0 });
          setScrollOffset(Math.max(0, matriz.length - visibleRows));
        }
      }
    } else if (key.downArrow) {
      if (isHorizontal) {
        const newRow = selected.row < matriz.length - 1 ? selected.row + 1 : 0;
        const maxCol = matriz[newRow].length - 1;
        const newCol = Math.min(selected.col, maxCol);
        setSelected({ row: newRow, col: newCol });
      } else {
        if (selected.row < matriz.length - 1) {
          setSelected({ row: selected.row + 1, col: 0 });
          if (selected.row >= scrollOffset + visibleRows - 1) {
            setScrollOffset((prev) =>
              Math.min(matriz.length - visibleRows, prev + 1)
            );
          }
        } else {
          setSelected({ row: 0, col: 0 });
          setScrollOffset(0);
        }
      }
    } else if (key.leftArrow) {
      if (selected.col > 0) {
        setSelected({ row: selected.row, col: selected.col - 1 });
      } else {
        const newRow = selected.row > 0 ? selected.row - 1 : matriz.length - 1;
        const newCol = matriz[newRow].length - 1;
        setSelected({ row: newRow, col: newCol });
      }
    } else if (key.rightArrow) {
      if (selected.col < matriz[selected.row].length - 1) {
        setSelected({ row: selected.row, col: selected.col + 1 });
      } else {
        const newRow = selected.row < matriz.length - 1 ? selected.row + 1 : 0;
        setSelected({ row: newRow, col: 0 });
      }
    }
  });
  return (
    <Box width="100%" flexDirection="column">
      <Box height={2} paddingBottom={1}>
        <Text backgroundColor="rgb(100,100,100)">
          <Text color="white">
            {currentPath}
            {isUnix ? "/" : "\\"}
          </Text>
          <Text color="rgb(150, 150, 150)">
            {!isSearching && matriz[selected.row][selected.col]}
          </Text>
          {isSearching && (
            <Text color="white">
              {" : "}
              {searchQuery}
            </Text>
          )}
        </Text>
      </Box>
      <Box width="100%" flexDirection="column">
        {matriz
          .slice(scrollOffset, scrollOffset + visibleRows)
          .map((row, rowIndex) => (
            <Box
              key={`row-${rowIndex + scrollOffset}`}
              flexDirection="row"
              justifyContent="space-between"
              height={1}
              width="100%"
              flexWrap="nowrap"
            >
              {row.map((item, colIndex) => {
                const fullPath = path.join(currentPath, item);
                const isDir =
                  fs.existsSync(fullPath) &&
                  fs.statSync(fullPath).isDirectory();
                const icon = getFileIcon(item, isDir);
                const color = isDir ? "rgb(85, 177, 229)" : "";

                return (
                  <Box
                    width={PATH_WIDTH}
                    key={`${item}-${rowIndex + scrollOffset}-${colIndex}`}
                  >
                    <Text
                      backgroundColor={
                        rowIndex + scrollOffset === selected.row &&
                        colIndex === selected.col
                          ? "rgb(85, 177, 229)"
                          : "transparent"
                      }
                      color={
                        rowIndex + scrollOffset === selected.row &&
                        colIndex === selected.col
                          ? "white"
                          : color
                      }
                    >
                      {icon} {normalizeItem(item)}
                    </Text>
                  </Box>
                );
              })}
            </Box>
          ))}
      </Box>
    </Box>
  );
}

render(<App />);
