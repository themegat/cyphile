import * as fs from "fs";
import * as path from "path";

function generateFile(filename: string, content: string, dir?: string): void {
  const filePath = path.join(dir ?? __dirname, filename);

  fs.mkdir(dir ?? __dirname, { recursive: true }, (err) => {
    if (err) {
      console.error("Error creating directory:", err);
      return;
    }
    fs.writeFileSync(filePath, content);
  });
}

export default generateFile;
