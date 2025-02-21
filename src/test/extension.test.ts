// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from "vscode";
import Sinon from "sinon";
import path from "path";
import * as assert from "assert";
import { clearDirectory, createFile } from "../util/system-file-helpers";

let fileDialog: Sinon.SinonStub;
let inputBox: Sinon.SinonStub;
let errorMessageDialog: Sinon.SinonStub;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const DELAY = 1000;
const TEST_TIMEOUT = 3000;

suite("Cyphile Test Suite", () => {
  vscode.window.showInformationMessage("Start all tests.");

  suite("Verify - Test Suite", () => {
    test("Verify - Sample test", () => {
      assert.strictEqual(-1, [1, 2, 3].indexOf(5));
      assert.strictEqual(-1, [1, 2, 3].indexOf(0));
    });
  });

  suite("Encrypt - Test Suite", () => {
    const testAssetDir = path.join(
      __dirname,
      "..",
      "..",
      "src",
      "test",
      "assets",
      "files",
      "encrypt"
    );

    suiteSetup(async () => {
      const filename = "test_encrypt_file.txt";
      const filePath = path.join(
        testAssetDir,
        filename
      );

      createFile(filename, "Sample test text file", testAssetDir);

      const doc = await vscode.workspace.openTextDocument(filePath);

      await vscode.window.showTextDocument(doc);
    });

    suiteTeardown(async () => {
      Sinon.reset();
      clearDirectory(testAssetDir);
      await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
    });

    test("Encrypt - Cypher command works", async () => {
      await vscode.commands.executeCommand("cyphile.cypher");

      assert.equal(inputBox.calledOnce, true);
      const promptTest = inputBox.args[0][0];
      assert.equal(promptTest?.prompt, "*Required - Provide a secret to encrypt with.");
    });

    test("Encrypt - Secret validated", async () => {
      inputBox.resolves("test");

      await vscode.commands.executeCommand("cyphile.cypher");
      await delay(DELAY);
      assert.equal(errorMessageDialog.calledOnce, true);
      const message = errorMessageDialog.args[0][0];
      assert.equal(
        message,
        "The secret should be at least 5 characters long and not blank."
      );
    }).timeout(TEST_TIMEOUT);

    test("Encrypt - File encrypted successfully", async () => {
      inputBox.onCall(0).resolves("testKey@123");
      inputBox.onCall(1).resolves();

      const infoMessageDialog = Sinon.stub(
        vscode.window,
        "showInformationMessage"
      );

      await vscode.commands.executeCommand("cyphile.cypher");
      await delay(DELAY);

      assert.equal(infoMessageDialog.calledOnce, true);
      const message = infoMessageDialog.args[0][0];
      assert.equal(message, "Current file Encrypted");

      infoMessageDialog.restore();
    }).timeout(TEST_TIMEOUT);

    test("Encrypt - Salt validated", async () => {
      inputBox.onCall(0).resolves("test@123");
      inputBox.onCall(1).resolves("11f");

      await vscode.commands.executeCommand("cyphile.cypher");
      await delay(DELAY);

      assert.equal(errorMessageDialog.calledOnce, true);
      const message = errorMessageDialog.args[0][0];
      assert.equal(
        message,
        "The salt must be an integer."
      );
    }).timeout(TEST_TIMEOUT);

    test("Encrypt - File encrypted successfully with salt", async () => {
      inputBox.onCall(0).resolves("testKey@123");
      inputBox.onCall(1).resolves("25");

      const infoMessageDialog = Sinon.stub(
        vscode.window,
        "showInformationMessage"
      );

      await vscode.commands.executeCommand("cyphile.cypher");
      await delay(DELAY);

      assert.equal(infoMessageDialog.calledOnce, true);
      const message = infoMessageDialog.args[0][0];
      assert.equal(message, "Current file Encrypted");

      infoMessageDialog.restore();
    }).timeout(TEST_TIMEOUT);
  });

  suite("Decrypt - Test Suite", () => {
    const testAssetDir = path.join(
      __dirname,
      "..",
      "..",
      "src",
      "test",
      "assets",
      "files",
      "decrypt"
    );

    suiteSetup(async () => {
      Sinon.reset();
    });

    const generateAndOpenSampleFile = async (fileContent?: string) => {
      const filename = "test_decrypt_file.txt";
      const filePath = path.join(
        testAssetDir,
        filename
      );

      createFile(filename, fileContent ?? "989ae6efe3a2a645ae06b1daced5384bd57632c63bbe2d" +
        "11727cf757c3b65289e7c1a120bd5bbae38c5d5a2c41c30d0de17584d274feea48371a6" +
        "f3f430dee708f4e19abfa19724ac3f90d15acce4930e04191fa6e5a113071c2f6c618147" +
        "15f26b005b4923dcd6fa5bcf2506786696878c414fd41", testAssetDir);
      const doc = await vscode.workspace.openTextDocument(filePath);
      await vscode.window.showTextDocument(doc);
    }

    const clearAndCloseSampleFile = async () => {
      await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
      await delay(DELAY);
      clearDirectory(testAssetDir);
    }

    suiteTeardown(() => {
      Sinon.reset();
    });

    test("Decrypt - Decypher command works", async () => {
      await generateAndOpenSampleFile();
      await vscode.commands.executeCommand("cyphile.decypher");
      await delay(DELAY);

      assert.equal(inputBox.calledOnce, true);
      const promptTest = inputBox.args[0][0];
      assert.equal(promptTest?.prompt, "*Required - Provide a secret to decrypt with.");
      await clearAndCloseSampleFile();
    }).timeout(TEST_TIMEOUT);

    test("Decrypt - Secret validated", async () => {
      await generateAndOpenSampleFile();
      inputBox.resolves("test");

      await vscode.commands.executeCommand("cyphile.decypher");
      await delay(DELAY);

      assert.equal(errorMessageDialog.calledOnce, true);
      const message = errorMessageDialog.args[0][0];
      assert.equal(
        message,
        "The secret should be at least 5 characters long and not blank."
      );

      await clearAndCloseSampleFile();
    }).timeout(TEST_TIMEOUT);

    test("Decrypt - Wrong secret entered", async () => {
      await generateAndOpenSampleFile();
      inputBox.onCall(0).resolves("wrongkey");
      inputBox.onCall(1).resolves();

      await vscode.commands.executeCommand("cyphile.decypher");
      await delay(DELAY);

      assert.equal(errorMessageDialog.calledOnce, true);
      const message = errorMessageDialog.args[0][0];
      assert.equal(message, "Unsupported state or unable to authenticate data");

      await clearAndCloseSampleFile();
    }).timeout(TEST_TIMEOUT);

    test("Decrypt - File decrypted successfully", async () => {
      await generateAndOpenSampleFile();
      const infoMessageDialog = Sinon.stub(
        vscode.window,
        "showInformationMessage"
      );

      inputBox.onCall(0).resolves("testKey@123");
      inputBox.onCall(1).resolves();

      await vscode.commands.executeCommand("cyphile.decypher");
      await delay(DELAY);

      assert.equal(infoMessageDialog.calledOnce, true);
      const message = infoMessageDialog.args[0][0];
      assert.equal(message, "Current file decrypted");

      infoMessageDialog.restore();
      await clearAndCloseSampleFile();
    }).timeout(TEST_TIMEOUT);


    test("Decrypt - Salt validated", async () => {
      await generateAndOpenSampleFile();
      inputBox.onCall(0).resolves("wrongkey");
      inputBox.onCall(1).resolves("F5");

      await vscode.commands.executeCommand("cyphile.decypher");
      await delay(DELAY);

      assert.equal(errorMessageDialog.calledOnce, true);
      const message = errorMessageDialog.args[0][0];
      assert.equal(message, "The salt must be an integer.");

      await clearAndCloseSampleFile();
    }).timeout(TEST_TIMEOUT);

    test("Decrypt - File decrypted successfully with salt", async () => {
      const saltedFileContent = "03146be821f1fa031196e77361ac5bf" +
        "a8d630b0b58425241f7e71230086117bc7dba76c858aa0276c45f40" +
        "6c8f1b4db9057553f042236c68025f5e598381cd6ab58fed4aec598d0f07";
      await generateAndOpenSampleFile(saltedFileContent);
      await delay(DELAY);

      inputBox.onCall(0).resolves("testKey@123");
      inputBox.onCall(1).resolves("25");
      const infoMessageDialog = Sinon.stub(
        vscode.window,
        "showInformationMessage"
      );

      await vscode.commands.executeCommand("cyphile.decypher");
      await delay(DELAY);

      assert.equal(infoMessageDialog.calledOnce, true);
      const message = infoMessageDialog.args[0][0];
      assert.equal(message, "Current file decrypted");

      infoMessageDialog.restore();
      await clearAndCloseSampleFile();
    }).timeout(TEST_TIMEOUT * 2);
  });

  suite("Encrypt Directory - Test Suite", () => {
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
      Sinon.reset();
    });

    const generateFiles = () => {
      createFile("test.txt", "Sample text file", testAssetDir);
      const json = { message: "Sample text file" };
      createFile("test.json", JSON.stringify(json, null, 2), testAssetDir);
      const sql = "SELECT * FROM table;";
      createFile("test.sql", sql, testAssetDir);
    };

    test("Encrypt Directory - Encrypt directory command works", async () => {
      generateFiles();
      fileDialog.resolves([{ fsPath: testAssetDir }]);
      await vscode.commands.executeCommand("cyphile.cypher-directory");
      assert.equal(fileDialog.calledOnce, true);
    });

    test("Encrypt Directory - Directory selected", async () => {
      fileDialog.resolves([{ fsPath: testAssetDir }]);
      await vscode.commands.executeCommand("cyphile.cypher-directory");

      assert.equal(fileDialog.calledOnce, true);
      assert.equal(inputBox.calledOnce, true);
    });

    test("Encrypt Directory - Secret validated", async () => {
      generateFiles();
      inputBox.onCall(0).resolves("t21");
      inputBox.onCall(1).resolves("t21");
      fileDialog.resolves([{ fsPath: testAssetDir }]);
      await vscode.commands.executeCommand("cyphile.cypher-directory");

      assert.equal(fileDialog.calledOnce, true);
      assert.equal(inputBox.calledOnce, true);

      await delay(DELAY);
      assert.equal(errorMessageDialog.calledOnce, true);
      const message = errorMessageDialog.args[0][0];
      assert.equal(
        message,
        "The secret should be at least 5 characters long and not blank."
      );
    }).timeout(TEST_TIMEOUT);

    test("Encrypt Directory - Confirm dialog displayed", async () => {
      generateFiles();

      const infoMessage = Sinon.stub(vscode.window, "showInformationMessage");
      fileDialog.resolves([{ fsPath: testAssetDir }]);
      inputBox.onCall(0).resolves("testKey@123");
      inputBox.onCall(1).resolves();
      infoMessage.resolves("No" as any);

      await vscode.commands.executeCommand("cyphile.cypher-directory");
      await delay(DELAY);

      assert.equal(fileDialog.calledOnce, true);
      assert.equal(inputBox.calledTwice, true);
      assert.equal(infoMessage.calledOnce, true);

      const message = infoMessage.args[0][0];
      assert.equal(message, "Are you sure you want to encrypt 3 files?");

      infoMessage.restore();
    }).timeout(TEST_TIMEOUT);

    test("Encrypt Directory - File encrypted successfully", async () => {
      generateFiles();

      const infoMessage = Sinon.stub(vscode.window, "showInformationMessage");
      infoMessage.resolves("Yes" as any);
      fileDialog.resolves([{ fsPath: testAssetDir }]);
      inputBox.onCall(0).resolves("testKey@123");
      inputBox.onCall(1).resolves();
      await vscode.commands.executeCommand("cyphile.cypher-directory");

      assert.equal(fileDialog.calledOnce, true);
      assert.equal(inputBox.calledTwice, true);

      await delay(DELAY);
      assert.equal(infoMessage.calledTwice, true);
      let message = infoMessage.args[0][0];
      assert.equal(message, "Are you sure you want to encrypt 3 files?");
      message = infoMessage.args[1][0];
      assert.equal(message, "3 files encrypted");

      infoMessage.restore();
    }).timeout(TEST_TIMEOUT);
  });

  suite("Decrypt Directory - Test Suite", () => {
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
      Sinon.reset();
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

    test("Decrypt Directory - Decrypt directory command works", async () => {
      generateFiles();
      fileDialog.resolves([{ fsPath: testAssetDir }]);
      await vscode.commands.executeCommand("cyphile.decypher-directory");
      assert.equal(fileDialog.calledOnce, true);
    });

    test("Decrypt Directory - Directory selected", async () => {
      generateFiles();
      fileDialog.resolves([{ fsPath: testAssetDir }]);
      await vscode.commands.executeCommand("cyphile.decypher-directory");

      assert.equal(fileDialog.calledOnce, true);
      assert.equal(inputBox.calledOnce, true);
    });

    test("Decrypt Directory - Secret validated", async () => {
      generateFiles();
      fileDialog.resolves([{ fsPath: testAssetDir }]);
      inputBox.onCall(0).resolves("test");
      inputBox.onCall(1).resolves();
      await vscode.commands.executeCommand("cyphile.decypher-directory");

      assert.equal(fileDialog.calledOnce, true);
      assert.equal(inputBox.calledOnce, true);

      await delay(DELAY);
      assert.equal(errorMessageDialog.calledOnce, true);
      const message = errorMessageDialog.args[0][0];
      assert.equal(
        message,
        "The secret should be at least 5 characters long and not blank."
      );
    }).timeout(TEST_TIMEOUT);

    test("Decrypt Directory - Confirm dialog displayed", async () => {
      generateFiles();

      const infoMessage = Sinon.stub(vscode.window, "showInformationMessage");
      fileDialog.resolves([{ fsPath: testAssetDir }]);
      inputBox.onCall(0).resolves("testKey@123");
      inputBox.onCall(1).resolves();
      infoMessage.resolves("No" as any);
      await vscode.commands.executeCommand("cyphile.decypher-directory");
      await delay(DELAY);

      assert.equal(fileDialog.calledOnce, true);
      assert.equal(inputBox.calledTwice, true);
      assert.equal(infoMessage.calledOnce, true);

      const message = infoMessage.args[0][0];
      assert.equal(message, "Are you sure you want to decrypt 3 files?");

      infoMessage.restore();
    }).timeout(TEST_TIMEOUT);

    test("Decrypt Directory - File decrypted successfully", async () => {
      generateFiles();

      const infoMessage = Sinon.stub(vscode.window, "showInformationMessage");
      infoMessage.resolves("Yes" as any);
      fileDialog.resolves([{ fsPath: testAssetDir }]);
      inputBox.onCall(0).resolves("testKey@123");
      inputBox.onCall(1).resolves();
      await vscode.commands.executeCommand("cyphile.decypher-directory");

      assert.equal(fileDialog.calledOnce, true);
      assert.equal(inputBox.calledTwice, true);

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
    errorMessageDialog = Sinon.stub(vscode.window, "showErrorMessage");
  })
  .afterEach(() => {
    fileDialog.restore();
    inputBox.restore();
    errorMessageDialog.restore();
    Sinon.restore();
  });
