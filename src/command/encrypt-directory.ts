import * as vscode from 'vscode';
import { CyFile, getFiles, readFileContent, writeFileContent } from '../util/system-file-helpers';
import getSecurityKey from '../util/get-security-key';
import Cryptr from 'cryptr';
import { confrimPrompt } from '../util/prompt';

const confrimAndEncrypt = (files: CyFile[], password: string) => {
    const encryptor = new Cryptr(password);

    confrimPrompt(`Are you sure you want to encrypt ${files.length} files?`).then((response) => {
        if (response) {
            files.forEach((file) => {
                const fileContent = readFileContent(file.path);
                const cyContent = encryptor.encrypt(fileContent);
                writeFileContent(file.path, cyContent);
            });

            const message = `${files.length} files encrypted`;
            vscode.window.showInformationMessage(message);
        }
    });
};

const encryptDirectory = () => {
    vscode.window.showOpenDialog({ canSelectFiles: false, canSelectFolders: true, canSelectMany: false }).then(dirs => {
        if (dirs) {
            const files = getFiles(dirs[0].fsPath);
            getSecurityKey().then((password) => {
                if (password) {
                    confrimAndEncrypt(files, password);
                }
            });
        }
    });
};

export default encryptDirectory;