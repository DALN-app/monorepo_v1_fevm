import { Request, Response } from "express";
import * as fs from "fs/promises";
import * as path from "path";
import lighthouse from "@lighthouse-web3/sdk";
import { v4 as uuidv4 } from "uuid";
import express from "express";

const router = express.Router();

interface UploadEncrypted extends Request {
  body: {
    data: string;
    signedMessage: string;
    publicKey: string;
  };
}

router.post("/", async (req: UploadEncrypted, res: Response) => {
  try {
    const filename = uuidv4();

    const filePath = path.join("/tmp", `${filename}.json`);
    const fileContent = req.body.data;

    const file = await fs.writeFile(filePath, fileContent, "utf8");

    const readFile = await fs.readFile(filePath);

    console.log("File created: ", filePath);
    console.log("File content: ", readFile);
    console.log("file", file);

    if (!process.env.LIGHTHOUSE_API_KEY) {
      throw new Error("LIGHTHOUSE_API_KEY not found");
    }

    const encryptedFile = (await lighthouse.uploadEncrypted(
      filePath,
      process.env.LIGHTHOUSE_API_KEY,
      req.body.publicKey,
      req.body.signedMessage
    )) as {
      data: {
        Name: string;
        Hash: string;
        Size: string;
      };
    }; // Display response

    console.log("encryptedFile", encryptedFile);

    return res.status(200).send(encryptedFile);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

export default router;
