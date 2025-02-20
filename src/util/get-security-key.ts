import * as vscode from 'vscode';
import { CyType } from './enums';

const getSecurityKey = (cyType: CyType): Promise<string> => {
    let promptText = "*Required - Provide a secret to {} with.";
    if (cyType === CyType.ENCRYPT || cyType === CyType.ENCRYPT_DIR) {
        promptText = promptText.replace('{}', 'encrypt');
    } else {
        promptText = promptText.replace('{}', 'decrypt');
    }

    return new Promise((resolve, reject) => {
        vscode.window.showInputBox({ prompt: promptText }).then(key => {
            if (key) {
                const parsedKey = key.trim();
                if (parsedKey.length === 0 || (parsedKey.length > 0 && parsedKey.length < 5)) {
                    reject(new Error('The secret should be at least 5 characters long and not blank.'));
                } else {
                    resolve(parsedKey);
                }
            }
        });
    });
};

export default getSecurityKey;