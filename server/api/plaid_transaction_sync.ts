import express, { Request, Response } from "express";
import { Configuration, PlaidApi, PlaidEnvironments, Transaction } from "plaid";
import AWS from "aws-sdk";

const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
      "PLAID-SECRET": process.env.PLAID_SECRET,
    },
  },
});

const dynamoDB = new AWS.DynamoDB.DocumentClient({ region: "us-east-1" });

const router = express.Router();

async function getAccessToken(item_id: string) {
  const params = {
    TableName: "users",
    FilterExpression: "plaid_item_id = :itemId",
    ExpressionAttributeValues: {
      ":itemId": item_id,
    },
  };

  const data = await dynamoDB.scan(params).promise();

  return data.Items?.[0]?.plaid_access_token as string;
}

// Fetches and returns all transactions from plaid
router.get("/:id", async (req: Request, res: Response) => {
  const itemId = req.params.id as string;

  if (!itemId) {
    return res.status(400).send("Missing item ID");
  }

  const access_token = await getAccessToken(itemId);

  const client = new PlaidApi(configuration);

  const transactions = [] as Transaction[];
  let hasMore = true;
  let cursor = undefined as string | undefined;

  while (hasMore) {
    const transactionsSyncRes = await client.transactionsSync({
      access_token: access_token,
      ...(cursor ? { cursor } : {}),
    });

    transactions.push(...transactionsSyncRes.data.added);

    hasMore = transactionsSyncRes.data.has_more;
    cursor = transactionsSyncRes.data.next_cursor;
  }

  try {
    return res.status(200).send({ ...transactions });
  } catch (e) {
    return res.status(500).send(e);
  }
});

export default router;
