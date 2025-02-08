import fs from "fs";
import path from "path";

type CyFile = {
  path: string;
  name: string;
};

const getFiles = (dirPath: string) => {
  const files: CyFile[] = [];
  fs.readdirSync(dirPath).forEach((file, index) => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isFile()) {
      files.push({ path: filePath, name: file });
    }
  });
  return files;
};

const readFileContent = (path: string) => {
  return fs.readFileSync(path, "utf8");
};

const writeFileContent = (path: string, content: string) => {
  fs.writeFileSync(path, content);
};

function createFile(filename: string, content: string, dir?: string): void {
  const filePath = path.join(dir ?? __dirname, filename);

  fs.mkdir(dir ?? __dirname, { recursive: true }, (err) => {
    if (err) {
      console.error("Error creating directory:", err);
      return;
    }
    fs.writeFileSync(filePath, content);
  });
}

function clearDirectory(dir: string): void {
  fs.rmSync(dir, { recursive: true });
}

export {
  getFiles,
  readFileContent,
  writeFileContent,
  createFile,
  clearDirectory,
  CyFile,
};
