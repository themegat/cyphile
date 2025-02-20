import * as vscode from "vscode";
import {
  CyFile,
  getFiles,
  readFileContent,
  writeFileContent,
} from "../util/system-file-helpers";
import Cryptr from "cryptr";
import { confrimPrompt } from "../util/prompt";
import { getCyProps } from "../util/get_cy_props";
import { CyType } from "../util/enums";

const confrimAndDecrypt = (files: CyFile[], password: string, salt?: number) => {
  const encryptor = new Cryptr(password, {
    saltLength: salt,
  });

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
        getCyProps(CyType.DECRYPT_DIR).then((props) => {
          if (props) {
            confrimAndDecrypt(files, props.key, props.salt);
          }
        }).catch((error) => {
          vscode.window.showErrorMessage(error.message);
        });
      }
    });
};

export default decryptDirectory;
