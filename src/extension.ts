// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import encryptFile from './command/encrypt';
import decryptFile from './command/decrypt';
import encryptDirectory from './command/encrypt-directory';
import decryptDirectory from './command/decrypt-directory';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Cyphile activated');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposables: vscode.Disposable[] = [];

	disposables.push(vscode.commands.registerCommand('cyphile.cypher', encryptFile));
	disposables.push(vscode.commands.registerCommand('cyphile.decypher', decryptFile));
	disposables.push(vscode.commands.registerCommand('cyphile.cypher-directory', encryptDirectory));
	disposables.push(vscode.commands.registerCommand('cyphile.decypher-directory', decryptDirectory));

	disposables.forEach(disposable => context.subscriptions.push(disposable));
}

// This method is called when your extension is deactivated
export function deactivate() {
	console.log('Cyphile de-activated');
}
