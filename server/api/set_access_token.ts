import express, { Request, Response } from "express";
import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";
import { DynamoDB } from "aws-sdk";
import { OnboardingSteps } from "../enums";

const documentClient = new DynamoDB.DocumentClient({ region: "us-east-1" });

async function setToken(
  userId: string,
  token: string,
  itemId: string,
  address: string
) {
  const params = {
    TableName: "users",
    Item: {
      name: userId,
      address,
      onboardingStep: OnboardingSteps.Processing,
      plaid_access_token: token,
      plaid_item_id: itemId,
      plaid_history_synced: false,
    },
  };

  try {
    await documentClient.put(params).promise();
    return params.Item;
  } catch (error) {
    console.log(`setToken() failed: ${error}`);
    throw error;
  }
}

interface SetTokenProps extends Request {
  body: {
    public_token: string;
    address: string;
  };
}

const router = express.Router();

router.post("/", async (req: SetTokenProps, res: Response) => {
  const configuration = new Configuration({
    basePath: PlaidEnvironments.sandbox,
    baseOptions: {
      headers: {
        "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
        "PLAID-SECRET": process.env.PLAID_SECRET,
      },
    },
  });

  const client = new PlaidApi(configuration);

  let plaidItemId = "";
  let user;

  await client
    .itemPublicTokenExchange({
      public_token: req.body.public_token,
    })
    .then(async (response) => {
      plaidItemId = response.data.item_id;
      await setToken(
        "abc",
        response.data.access_token,
        response.data.item_id,
        req.body.address
      ).catch((error) => {
        console.log(`setToken() failed: ${error}`);
        res.status(500).send(error);
      });

      user = {
        name: "abc",
        address: req.body.address,
        onboardingStep: OnboardingSteps.Processing,
        plaid_access_token: response.data.access_token,
        plaid_item_id: response.data.item_id,
        plaid_history_synced: false,
      };

      // init the tx sync
      await client
        .transactionsSync({
          access_token: response.data.access_token,
        })
        .catch((error) => {
          console.log(`transactionsSync() failed: ${error}`);
          res.status(500).send(error);
        });
    })
    .then(() =>
      res.status(200).json({
        success: true,
        plaidItemId,
        user,
      })
    )
    .catch((error) => {
      console.log(`exchange public token failed: ${error}`);
      console.log(`public_token: ${req.body.public_token}`);
      res.status(500).send(error);
    });
});

export default router;
