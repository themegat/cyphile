import assert from "assert";
import path from "path";
import Sinon from "sinon";
import * as vscode from "vscode";
import sinon from "sinon";
import generateFile from "./util/generate_file";

let fileDialog: Sinon.SinonStub;
let inputBox: Sinon.SinonStub;
let errorMessageDialog: sinon.SinonStub;

suite("Encrypt Directory Test Suite", () => {
  const testAssetDir = path.join(
    __dirname,
    "..",
    "..",
    "src",
    "test",
    "assets",
    "folder",
    "encrypt"
  );

  const generateFiles = () => {
    generateFile("test.txt", "Sample text file", testAssetDir);
    const json = { message: "Sample text file" };
    generateFile("test.json", JSON.stringify(json, null, 2), testAssetDir);
    const sql = "SELECT * FROM table;";
    generateFile("test.sql", sql, testAssetDir);
  };

  test("Encrypt directory command works", async () => {
    generateFiles();
    fileDialog.resolves([{ fsPath: testAssetDir }]);
    await vscode.commands.executeCommand("cyphile.cypher-directory");
    assert.equal(fileDialog.calledOnce, true);
  });

  test("Directory selected", async () => {
    fileDialog.resolves([{ fsPath: testAssetDir }]);
    await vscode.commands.executeCommand("cyphile.cypher-directory");

    assert.equal(fileDialog.calledOnce, true);
    assert.equal(inputBox.calledOnce, true);
  });

  test("Key/password validated", async () => {
    generateFiles();
    fileDialog.resolves([{ fsPath: testAssetDir }]);
    inputBox.resolves("test");
    await vscode.commands.executeCommand("cyphile.cypher-directory");

    assert.equal(fileDialog.calledOnce, true);
    assert.equal(inputBox.calledOnce, true);
    assert.equal(errorMessageDialog.calledOnce, true);
    const message = errorMessageDialog.args[0][0];
    assert.equal(
      message,
      "Invalid Key/Password: Minimum length is 5 characters"
    );
  });

  test("Confirm dialog displayed", async () => {
    generateFiles();

    const infoMessage = sinon.stub(vscode.window, "showInformationMessage");
    fileDialog.resolves([{ fsPath: testAssetDir }]);
    inputBox.resolves("testKey@123");
    infoMessage.resolves("No" as any);
    await vscode.commands.executeCommand("cyphile.cypher-directory");

    assert.equal(fileDialog.calledOnce, true);
    assert.equal(inputBox.calledOnce, true);
    assert.equal(infoMessage.calledOnce, true);

    const message = infoMessage.args[0][0];
    assert.equal(message, "Are you sure you want to encrypt 3 files?");

    infoMessage.restore();
  });

  test("File encrypted successfully", async () => {
    generateFiles();

    const infoMessage = sinon.stub(vscode.window, "showInformationMessage");
    infoMessage.resolves("Yes" as any);
    fileDialog.resolves([{ fsPath: testAssetDir }]);
    inputBox.resolves("testKey@123");
    await vscode.commands.executeCommand("cyphile.cypher-directory");

    assert.equal(fileDialog.calledOnce, true);
    assert.equal(inputBox.calledOnce, true);
    assert.equal(infoMessage.calledTwice, true);

    let message = infoMessage.args[0][0];
    assert.equal(message, "Are you sure you want to encrypt 3 files?");
    message = infoMessage.args[1][0];
    assert.equal(message, "3 files encrypted");

    infoMessage.restore();
  });
})
  .beforeEach(() => {
    fileDialog = Sinon.stub(vscode.window, "showOpenDialog");
    inputBox = Sinon.stub(vscode.window, "showInputBox");
    errorMessageDialog = sinon.stub(vscode.window, "showErrorMessage");
  })
  .afterEach(() => {
    fileDialog.restore();
    inputBox.restore();
    errorMessageDialog.restore();
  });
