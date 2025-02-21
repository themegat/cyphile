import * as vscode from 'vscode';
import { CyType } from './enums';

const INTEGER_REGEX = /^\d+$/;

const getSalt = (cyType: CyType): Promise<number | undefined> => {
    let prompText = "Optional - Specify a salt length to use for {} (Must be an integer).";
    if (cyType === CyType.ENCRYPT || cyType === CyType.ENCRYPT_DIR) {
        prompText = prompText.replace('{}', 'encryption');
    } else {
        prompText = prompText.replace('{}', 'decryption');
    }
    return new Promise((resolve, reject) => {
        vscode.window.showInputBox({ prompt: prompText }).then(salt => {
            if (salt && salt.length > 0) {
                if (INTEGER_REGEX.test(salt)) {
                    const parsedSalt = parseInt(salt);
                    resolve(parsedSalt);
                } else {
                    reject(new Error('The salt must be an integer.'));
                }
            } else {
                resolve(undefined);
            }
        });
    });
};

export default getSalt;