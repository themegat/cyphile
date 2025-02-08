import path from "path";
import * as vscode from "vscode";
import sinon from "sinon";
import assert from "assert";

let inputBox: sinon.SinonStub;

suite("Decrypt Test Suite", () => {
  suiteSetup(async () => {
    const file = path.join(
      __dirname,
      "..",
      "..",
      "src",
      "test",
      "assets",
      "files",
      "test_decrypt_file.txt"
    );
    const doc = await vscode.workspace.openTextDocument(file);
    await vscode.window.showTextDocument(doc);
  });

  test("Decypher command works", async () => {
    await vscode.commands.executeCommand("cyphile.decypher");

    assert.equal(inputBox.calledOnce, true);
    const promptTest = inputBox.args[0][0];
    assert.equal(promptTest?.prompt, "Encryption Key/Password");
  });

  test("Key/password validated", async () => {
    const errorMessageDialog = sinon.stub(vscode.window, "showErrorMessage");
    inputBox.resolves("test");

    await vscode.commands.executeCommand("cyphile.decypher");

    assert.equal(errorMessageDialog.calledOnce, true);
    const message = errorMessageDialog.args[0][0];
    assert.equal(
      message,
      "Invalid Key/Password: Minimum length is 5 characters"
    );

    errorMessageDialog.restore();
  });

  test("Wrong key/password entered", async () => {
    const errorMessageDialog = sinon.stub(vscode.window, "showErrorMessage");
    inputBox.resolves("wrongkey");

    await vscode.commands.executeCommand("cyphile.decypher");

    assert.equal(errorMessageDialog.calledOnce, true);
    const message = errorMessageDialog.args[0][0];
    assert.equal(message, "Unsupported state or unable to authenticate data");

    errorMessageDialog.restore();
  });

  test("File decrypted successfully", async () => {
    const infoMessageDialog = sinon.stub(
      vscode.window,
      "showInformationMessage"
    );

    inputBox.resolves("testKey@123");

    await vscode.commands.executeCommand("cyphile.decypher");
    assert.equal(infoMessageDialog.calledOnce, true);
    const message = infoMessageDialog.args[0][0];
    assert.equal(message, "Current file decrypted");

    infoMessageDialog.restore();
  });
})
  .beforeEach(() => {
    inputBox = sinon.stub(vscode.window, "showInputBox");
  })
  .afterEach(() => {
    inputBox.restore();
  });
