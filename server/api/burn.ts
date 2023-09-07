import express, { Request, Response } from "express";
import AWS from "aws-sdk";

const dynamoDB = new AWS.DynamoDB.DocumentClient({ region: "us-east-1" });

interface SetOnboardingStep extends Request {
  query: {
    id: string;
  };
}

const router = express.Router();

router.delete("/:id", async (req: SetOnboardingStep, res: Response) => {
  const params = {
    TableName: "users",
    Key: {
      address: req.params.id,
    },
  };

  try {
    const data = await dynamoDB.get(params).promise();
    if (!data.Item) {
      return res.status(400).send("Error, user doesn't exist");
    }

    await dynamoDB.delete(params).promise();
    return res.status(201).send("User removed from collection");
  } catch (e) {
    return res.status(500).send("Error removing user from collection");
  }
});

export default router;
