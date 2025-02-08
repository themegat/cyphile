import fs from 'fs';
import path from 'path';

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
    return fs.readFileSync(path, 'utf8');
};

const writeFileContent = (path: string, content: string) => {
    fs.writeFileSync(path, content);
};

export {
    getFiles,
    readFileContent,
    writeFileContent,
    CyFile
};