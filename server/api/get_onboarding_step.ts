import express, { Request, Response } from "express";
import { DynamoDB } from "aws-sdk";
import { OnboardingSteps } from "../enums";

const documentClient = new DynamoDB.DocumentClient({ region: "us-east-1" }); // replace with your AWS region

const router = express.Router();

router.get("/:id", async (req: Request, res: Response) => {
  const address = req.params.id;

  if (address) {
    const params = {
      TableName: "users", // replace with your DynamoDB table name
      Key: { address: address },
    };

    try {
      const result = await documentClient.get(params).promise();
      const user = result.Item;

      if (user) {
        return res.status(200).json({
          onboardingStep: user.onboardingStep as OnboardingSteps,
          plaidItemId: user.plaid_item_id as string | undefined,
          cid: user.cid as string | undefined,
        });
      } else {
        return res.status(404).send("User not found");
      }
    } catch (e) {
      return res.status(500).send("Error fetching onboarding step");
    }
  } else {
    return res.status(400).send("Invalid address");
  }
});

export default router;
