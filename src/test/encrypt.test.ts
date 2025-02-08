// import { assert } from "chai";
import sinon from "sinon";
import * as vscode from "vscode";
import assert from "assert";
import path from "path";
import Sinon from "sinon";

let inputBoxPrompt: sinon.SinonStub;

suite("Encrypt Test Suite", () => {
  suiteSetup(async () => {
    const file = path.join(
      __dirname,
      "..",
      "..",
      "src",
      "test",
      "assets",
      "files",
      "test_encrypt_file.txt"
    );
    const doc = await vscode.workspace.openTextDocument(file);
    await vscode.window.showTextDocument(doc);
  });

  test("Cypher command works", async () => {
    await vscode.commands.executeCommand("cyphile.cypher");

    assert.equal(inputBoxPrompt.calledOnce, true);
    const promptTest = inputBoxPrompt.args[0][0];
    assert.equal(promptTest?.prompt, "Encryption Key/Password");
  });

  test("Key/password validated", async () => {
    const errorMessageDialog = sinon.stub(vscode.window, "showErrorMessage");
    inputBoxPrompt.resolves("test");

    await vscode.commands.executeCommand("cyphile.cypher");

    assert.equal(errorMessageDialog.calledOnce, true);
    const message = errorMessageDialog.args[0][0];
    assert.equal(
      message,
      "Invalid Key/Password: Minimum length is 5 characters"
    );

    errorMessageDialog.restore();
  });

  test("File encrypted successfully", async () => {
    const infoMessageDialog = Sinon.stub(
      vscode.window,
      "showInformationMessage"
    );

    inputBoxPrompt.resolves("testKey@123");

    await vscode.commands.executeCommand("cyphile.cypher");
    assert.equal(infoMessageDialog.calledOnce, true);
    const message = infoMessageDialog.args[0][0];
    assert.equal(message, "Current file Encrypted");

    infoMessageDialog.restore();
  });
})
  .beforeEach(() => {
    inputBoxPrompt = sinon.stub(vscode.window, "showInputBox");
  })
  .afterEach(() => {
    inputBoxPrompt.restore();
  });
