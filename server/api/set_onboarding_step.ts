import express, { Request, Response } from "express";
import { DynamoDB } from "aws-sdk";
import { OnboardingSteps } from "../enums";

const documentClient = new DynamoDB.DocumentClient({ region: "us-east-1" });

interface SetOnboardingStep extends Request {
  body: {
    onboardingStep: OnboardingSteps;
    cid?: string;
  };
  params: {
    id: string;
  };
}

const router = express.Router();

router.post("/:id", async (req: SetOnboardingStep, res: Response) => {
  const { onboardingStep, cid } = req.body;

  const maybeOnboardingStep = (
    maybeOnboardingStep: unknown
  ): maybeOnboardingStep is keyof typeof OnboardingSteps => {
    return (
      Object.values(OnboardingSteps).indexOf(
        maybeOnboardingStep as OnboardingSteps
      ) !== -1
    );
  };

  if (onboardingStep && maybeOnboardingStep(onboardingStep)) {
    try {
      const params = {
        TableName: "users",
        Key: { address: req.params.id },
        ReturnValues: "ALL_NEW",
      };

      if (cid) {
        params["UpdateExpression"] =
          "SET onboardingStep = :onboardingStep, cid = :cid";
        params["ExpressionAttributeValues"] = {
          ":onboardingStep": onboardingStep,
          ":cid": cid,
        };
      } else {
        params["UpdateExpression"] = "SET onboardingStep = :onboardingStep";
        params["ExpressionAttributeValues"] = {
          ":onboardingStep": onboardingStep,
        };
      }

      const updatedUser = await documentClient.update(params).promise();
      return res.status(200).send({
        user: updatedUser.Attributes,
      });
    } catch (e) {
      return res.status(500).send("Error updating item");
    }
  } else {
    return res.status(400).send("Invalid onboarding step");
  }
});

export default router;
