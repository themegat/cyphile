import * as vscode from 'vscode';
import Cryptr from 'cryptr';
import { getCyProps } from '../util/get_cy_props';
import { CyType } from '../util/enums';

const encryptFile = () => {
    const activeEditor = vscode.window.activeTextEditor;

    if (activeEditor) {
        const message = "Current file Encrypted";
        const content = activeEditor.document.getText();

        getCyProps(CyType.ENCRYPT).then((props) => {
            if (props) {
                const encryptor = new Cryptr(props.key, {
                    saltLength: props.salt
                });

                const cyContent = encryptor.encrypt(content);
                activeEditor.edit(editBuilder => {
                    editBuilder.replace(new vscode.Range(0, 0, activeEditor.document.lineCount, 0), cyContent);
                });

                vscode.window.showInformationMessage(message);
            }
        }).catch((error) => {
            vscode.window.showErrorMessage(error.message);
        })
    }
};

export default encryptFile;