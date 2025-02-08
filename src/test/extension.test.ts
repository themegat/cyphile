// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from "vscode";
// import * as myExtension from '../../extension';
import sinon from "sinon";
import Sinon from "sinon";
import path from "path";
import * as assert from "assert";
import { clearDirectory, createFile } from "../util/system-file-helpers";

let fileDialog: Sinon.SinonStub;
let inputBox: Sinon.SinonStub;
let errorMessageDialog: sinon.SinonStub;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const DELAY = 1000;
const TEST_TIMEOUT = 3000;

suite("Extension Test Suite", () => {
  vscode.window.showInformationMessage("Start all tests.");

  suite("Sample test", () => {
    test("Sample test", () => {
      assert.strictEqual(-1, [1, 2, 3].indexOf(5));
      assert.strictEqual(-1, [1, 2, 3].indexOf(0));
    });
  });

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

    suiteTeardown(() => {
      sinon.reset();
    });

    test("Cypher command works", async () => {
      await vscode.commands.executeCommand("cyphile.cypher");

      assert.equal(inputBox.calledOnce, true);
      const promptTest = inputBox.args[0][0];
      assert.equal(promptTest?.prompt, "Encryption Key/Password");
    });

    test("Key/password validated", async () => {
      inputBox.resolves("test");

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

      inputBox.resolves("testKey@123");

      await vscode.commands.executeCommand("cyphile.cypher");
      assert.equal(infoMessageDialog.calledOnce, true);
      const message = infoMessageDialog.args[0][0];
      assert.equal(message, "Current file Encrypted");

      infoMessageDialog.restore();
    });
  });

  suite("Decrypt Test Suite", () => {
    suiteSetup(async () => {
      sinon.reset();
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

    suiteTeardown(() => {
      sinon.reset();
    });

    test("Decypher command works", async () => {
      await vscode.commands.executeCommand("cyphile.decypher");

      assert.equal(inputBox.calledOnce, true);
      const promptTest = inputBox.args[0][0];
      assert.equal(promptTest?.prompt, "Encryption Key/Password");
    });

    test("Key/password validated", async () => {
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
  });

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

    suiteTeardown(() => {
      clearDirectory(testAssetDir);
      sinon.reset();
    });

    const generateFiles = () => {
      createFile("test.txt", "Sample text file", testAssetDir);
      const json = { message: "Sample text file" };
      createFile("test.json", JSON.stringify(json, null, 2), testAssetDir);
      const sql = "SELECT * FROM table;";
      createFile("test.sql", sql, testAssetDir);
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
      inputBox.resolves("t21");
      fileDialog.resolves([{ fsPath: testAssetDir }]);
      await vscode.commands.executeCommand("cyphile.cypher-directory");

      assert.equal(fileDialog.calledOnce, true);
      assert.equal(inputBox.calledOnce, true);

      await delay(DELAY);
      assert.equal(errorMessageDialog.calledOnce, true);
      const message = errorMessageDialog.args[0][0];
      assert.equal(
        message,
        "Invalid Key/Password: Minimum length is 5 characters"
      );
    }).timeout(TEST_TIMEOUT);

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

      await delay(DELAY);
      assert.equal(infoMessage.calledTwice, true);
      let message = infoMessage.args[0][0];
      assert.equal(message, "Are you sure you want to encrypt 3 files?");
      message = infoMessage.args[1][0];
      assert.equal(message, "3 files encrypted");

      infoMessage.restore();
    }).timeout(TEST_TIMEOUT);
  });

  suite("Decrypt Directory Test Suite", () => {
    const testAssetDir = path.join(
      __dirname,
      "..",
      "..",
      "src",
      "test",
      "assets",
      "folder",
      "decrypt"
    );

    suiteTeardown(() => {
      clearDirectory(testAssetDir);
      sinon.reset();
    });

    const generateFiles = () => {
      const text =
        "29d372c9de468c50e207225cd04351f39c3ebeebad5ea8d07a31b4897344337f420c51be4c1802bed11fb7ff7b55790b85846ff84a3d0dd3e4fd888c9ac30a0bae98f64acd86fcb6f0a5b5a3bad789f0214050a0648abc1adb792b7313b86954a6cb19e0a6aceee2b9579d6c1114ea89";
      createFile("test.txt", text, testAssetDir);
      const json =
        "cfccaaa43cbc9939bbf24bb35072c7a16f04ab6e971d08e864fd9bacef030621bccf820bc8e31fe30c5e9352d2b0ee9ce9d77cb7ca7cbb4deeb9659dde05f3c1a9b0ef00e808f46c049acc57751a7818aa04c17a5607af82e04c7d623fd2bd48176f75845f2d690f6b45c507621aedd5faf0001263b64f08c6f78ecb9dd5dcd8c9611a";
      createFile("test.json", json, testAssetDir);
      const sql =
        "6cc9fe47ab7d34a7ab601b83e8f66fe38db15d28179ceb3de158d2bbdab4abd1dc2c49244bac8c2c67fec39606af63e50809372d4a86f3b9516ea0b48f9fd22d03350ca12e9e0b75805a0f14d0c664321e854f2e9ef4ecb7957b51d0abc98c92d6cc3aa698a941ea02fbc6e76cedb4b1c08d7e40";
      createFile("test.sql", sql, testAssetDir);
    };

    test("Decrypt directory command works", async () => {
      generateFiles();
      fileDialog.resolves([{ fsPath: testAssetDir }]);
      await vscode.commands.executeCommand("cyphile.decypher-directory");
      assert.equal(fileDialog.calledOnce, true);
    });

    test("Directory selected", async () => {
      generateFiles();
      fileDialog.resolves([{ fsPath: testAssetDir }]);
      await vscode.commands.executeCommand("cyphile.decypher-directory");

      assert.equal(fileDialog.calledOnce, true);
      assert.equal(inputBox.calledOnce, true);
    });

    test("Key/password validated", async () => {
      generateFiles();
      fileDialog.resolves([{ fsPath: testAssetDir }]);
      inputBox.resolves("test");
      await vscode.commands.executeCommand("cyphile.decypher-directory");

      assert.equal(fileDialog.calledOnce, true);
      assert.equal(inputBox.calledOnce, true);

      await delay(DELAY);
      assert.equal(errorMessageDialog.calledOnce, true);
      const message = errorMessageDialog.args[0][0];
      assert.equal(
        message,
        "Invalid Key/Password: Minimum length is 5 characters"
      );
    }).timeout(TEST_TIMEOUT);

    test("Confirm dialog displayed", async () => {
      generateFiles();

      const infoMessage = sinon.stub(vscode.window, "showInformationMessage");
      fileDialog.resolves([{ fsPath: testAssetDir }]);
      inputBox.resolves("testKey@123");
      infoMessage.resolves("No" as any);
      await vscode.commands.executeCommand("cyphile.decypher-directory");

      assert.equal(fileDialog.calledOnce, true);
      assert.equal(inputBox.calledOnce, true);
      assert.equal(infoMessage.calledOnce, true);

      const message = infoMessage.args[0][0];
      assert.equal(message, "Are you sure you want to decrypt 3 files?");

      infoMessage.restore();
    });

    test("File decrypted successfully", async () => {
      generateFiles();

      const infoMessage = sinon.stub(vscode.window, "showInformationMessage");
      infoMessage.resolves("Yes" as any);
      fileDialog.resolves([{ fsPath: testAssetDir }]);
      inputBox.resolves("testKey@123");
      await vscode.commands.executeCommand("cyphile.decypher-directory");

      assert.equal(fileDialog.calledOnce, true);
      assert.equal(inputBox.calledOnce, true);

      await delay(DELAY);
      assert.equal(infoMessage.calledTwice, true);
      let message = infoMessage.args[0][0];
      assert.equal(message, "Are you sure you want to decrypt 3 files?");
      message = infoMessage.args[1][0];
      assert.equal(message, "3 files decrypted");

      infoMessage.restore();
    }).timeout(TEST_TIMEOUT);
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
