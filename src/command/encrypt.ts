import * as vscode from 'vscode';
import getSecurityKey from '../util/get-security-key';
import Cryptr from 'cryptr';

const encryptFile = () => {
    const activeEditor = vscode.window.activeTextEditor;

    if (activeEditor) {
        const message = "Current file Encrypted";
        const content = activeEditor.document.getText();
        getSecurityKey().then((password) => {
            if (password) {
                const encryptor = new Cryptr(password);

                const cyContent = encryptor.encrypt(content);
                activeEditor.edit(editBuilder => {
                    editBuilder.replace(new vscode.Range(0, 0, activeEditor.document.lineCount, 0), cyContent);
                });

                vscode.window.showInformationMessage(message);
            }
        }).catch((error) => {
            vscode.window.showErrorMessage(error.message);
        });
    }
};

export default encryptFile;