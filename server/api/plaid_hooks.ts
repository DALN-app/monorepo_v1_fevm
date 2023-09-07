import express from 'express';
import Cors from "cors";
import { Request, Response } from "express";
import {
  Configuration,
  CountryCode,
  DepositoryAccountSubtype,
  PlaidApi,
  PlaidEnvironments,
  Products,
} from "plaid";

const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
      "PLAID-SECRET": process.env.PLAID_SECRET,
    },
  },
});

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(
  req: Request,
  res: Response,
  fn: (arg0: any, args1: any, args2: any) => any
) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}

const router = express.Router();

router.post('/', async (req: Request, res: Response) => {
  const client = new PlaidApi(configuration);

  await client
    .linkTokenCreate({
      user: {
        client_user_id: "123-test-user-id",
      },
      client_name: "Plaid Test App",
      products: [Products.Auth, Products.Transactions],
      country_codes: [CountryCode.Us],
      language: "en",
      webhook: process.env.PLAID_HOOK,
      account_filters: {
        depository: {
          account_subtypes: [
            DepositoryAccountSubtype.Checking,
            DepositoryAccountSubtype.Savings,
          ],
        },
      },
    })
    .then((response) => {
      res.status(200).json({ link_token: response.data.link_token });
    })
    .catch((error) => {
      console.log(`create link token failed: ${error}`);
      res.status(500).send(error);
    });
});

export default router;
