import * as vscode from 'vscode';

const getSecurityKey = (): Promise<string | undefined> => {
    return new Promise((resolve, reject) => {
        vscode.window.showInputBox({ prompt: 'Encryption Key/Password' }).then(key => {
            if (key) {
                if (key.length > 0 && key.length < 5) {
                    reject(new Error('Invalid Key/Password: Minimum length is 5 characters',));
                } else {
                    resolve(key);
                }
            }
        });
    });
};

export default getSecurityKey;