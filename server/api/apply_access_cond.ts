import express from "express";
import lighthouse from "@lighthouse-web3/sdk";
import { BigNumberish } from "ethers";
import { Request, Response } from "express";

interface ApplyAccessConditionRequest extends Request {
  body: {
    cid: string;
    tokenId: BigNumberish;
    signedMessage: string;
    publicKey: string;
  };
}

const router = express.Router();

router.post("/", async (req: ApplyAccessConditionRequest, res: Response) => {
  try {
    const conditions = [
      {
        id: 1,
        chain: "Calibration",
        contractAddress: process.env.NEXT_PUBLIC_DALN_CONTRACT_ADDRESS,
        parameters: [req.body.tokenId],
        method: "getIsTokenDecrypted",
        standardContractType: "Custom",
        inputArrayType: ["uint256"],
        outputType: "bool",
        returnValueTest: {
          comparator: "==",
          value: "true",
        },
      },
      {
        id: 2,
        chain: "Calibration",
        contractAddress: process.env.NEXT_PUBLIC_DALN_CONTRACT_ADDRESS,
        parameters: [":userAddress"],
        method: "isAdmin",
        standardContractType: "Custom",
        inputArrayType: ["address"],
        outputType: "bool",
        returnValueTest: {
          comparator: "==",
          value: "true",
        },
      },
    ];

    const aggregator = "([1] and [2])";

    const response = await lighthouse.applyAccessCondition(
      req.body.publicKey,
      req.body.cid,
      req.body.signedMessage,
      conditions,
      aggregator
    );

    return res.status(200).send(response);
  } catch (error) {
    return res.status(500).send(error);
  }
});

export default router;
