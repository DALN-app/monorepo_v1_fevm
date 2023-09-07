import express, { Request, Response } from "express";
import AWS from "aws-sdk";

const dynamoDB = new AWS.DynamoDB.DocumentClient({ region: "us-east-1" });

const router = express.Router();

router.get("/:id", async (req: Request, res: Response) => {
  const itemId = req.params.id;

  const params = {
    TableName: "users",
    FilterExpression: "plaid_item_id = :itemId",
    ExpressionAttributeValues: {
      ":itemId": itemId,
    },
  };

  try {
    const data = await dynamoDB.scan(params).promise();
    const item = data.Items ? data.Items[0] : null;
    return res.status(200).send({ isSynced: !!item?.plaid_history_synced });
  } catch (e) {
    return res.status(500).send(e);
  }
});

export default router;
