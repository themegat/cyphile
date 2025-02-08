import * as vscode from 'vscode';

const confrimPrompt = (message: string) => {
    return new Promise((resolve) => {
        vscode.window.showInformationMessage(message, 'Yes', 'No')
            .then(selection => {
                if (selection === 'Yes') {
                    resolve(true);
                } else if (selection === 'No') {
                    resolve(false);
                }
            });
    });
};

export { confrimPrompt };