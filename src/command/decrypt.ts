import * as vscode from 'vscode';
import Cryptr from 'cryptr';
import { getCyProps } from '../util/get_cy_props';
import { CyType } from '../util/enums';

const decryptFile = () => {
    const activeEditor = vscode.window.activeTextEditor;

    if (activeEditor) {
        const message = "Current file decrypted";
        const content = activeEditor.document.getText();

        getCyProps(CyType.DECRYPT).then((props) => {
            try {
                if (props) {
                    const encryptor = new Cryptr(props.key, {
                        saltLength: props.salt
                    });

                    const cyContent = encryptor.decrypt(content);
                    activeEditor.edit(editBuilder => {
                        editBuilder.replace(new vscode.Range(0, 0, activeEditor.document.lineCount, 0), cyContent);
                    });
                    vscode.window.showInformationMessage(message);
                }

            } catch (e: any) {
                vscode.window.showErrorMessage(e.message);
            }
        }).catch((error) => {
            vscode.window.showErrorMessage(error.message);
        });
    }
};

export default decryptFile;