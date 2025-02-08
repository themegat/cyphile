import * as vscode from 'vscode';
import getSecurityKey from '../util/get-security-key';
import Cryptr from 'cryptr';

const decryptFile = () => {
    const activeEditor = vscode.window.activeTextEditor;

    if (activeEditor) {
        const message = "Current file decrypted";
        const content = activeEditor.document.getText();

        getSecurityKey().then((password) => {
            try {
                if (password) {
                    const encryptor = new Cryptr(password);

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
        });;
    }
};

export default decryptFile;