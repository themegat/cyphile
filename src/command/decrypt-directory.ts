import * as vscode from "vscode";
import {
  CyFile,
  getFiles,
  readFileContent,
  writeFileContent,
} from "../util/system-file-helpers";
import getSecurityKey from "../util/get-security-key";
import Cryptr from "cryptr";
import { confrimPrompt } from "../util/prompt";

const confrimAndDecrypt = (files: CyFile[], password: string) => {
  const encryptor = new Cryptr(password);

  confrimPrompt(`Are you sure you want to decrypt ${files.length} files?`).then(
    (response) => {
      if (response) {
        files.forEach((file) => {
          const fileContent = readFileContent(file.path);
          const cyContent = encryptor.decrypt(fileContent);
          writeFileContent(file.path, cyContent);
        });
        const message = `${files.length} files decrypted`;
        vscode.window.showInformationMessage(message);
      }
    }
  );
};

const decryptDirectory = () => {
  vscode.window
    .showOpenDialog({
      canSelectFiles: false,
      canSelectFolders: true,
      canSelectMany: false,
    })
    .then((dirs) => {
      if (dirs) {
        const files = getFiles(dirs[0].fsPath);
        getSecurityKey()
          .then((password) => {
            if (password) {
              confrimAndDecrypt(files, password);
            }
          })
          .catch((error) => {
            vscode.window.showErrorMessage(error.message);
          });
      }
    });
};

export default decryptDirectory;
