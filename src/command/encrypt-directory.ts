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

const confrimAndEncrypt = (files: CyFile[], password: string, salt?: number) => {
  const encryptor = new Cryptr(password, {
    saltLength: salt,
  });

  confrimPrompt(`Are you sure you want to encrypt ${files.length} files?`).then(
    (response) => {
      if (response) {
        files.forEach((file) => {
          const fileContent = readFileContent(file.path);
          const cyContent = encryptor.encrypt(fileContent);
          writeFileContent(file.path, cyContent);
        });

        const message = `${files.length} files encrypted`;
        vscode.window.showInformationMessage(message);
      }
    }
  );
};

const encryptDirectory = () => {
  vscode.window
    .showOpenDialog({
      canSelectFiles: false,
      canSelectFolders: true,
      canSelectMany: false,
    })
    .then((dirs) => {
      if (dirs) {
        const files = getFiles(dirs[0].fsPath);
        getCyProps(CyType.ENCRYPT_DIR).then((props) => {
          if (props) {
            confrimAndEncrypt(files, props.key, props.salt);
          }
        }).catch((error) => {
          vscode.window.showErrorMessage(error.message);
        });
      }
    });
};

export default encryptDirectory;
