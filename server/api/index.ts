import express from "express";

import apply_access_cond from "./apply_access_cond";
import burn from "./burn";
import check_historical_update_status from "./check_historical_update_status";
import create_link_token from "./create_link_token";
import get_onboarding_step from "./get_onboarding_step";
import plaid_hooks from "./plaid_hooks";
import plaid_transaction_sync from "./plaid_transaction_sync";
import set_access_token from "./set_access_token";
import set_onboarding_step from "./set_onboarding_step";
import upload_encrypted from "./upload_encrypted";

const router = express.Router();

router.use("/apply_access_cond", apply_access_cond);
router.use("/burn", burn);
router.use("/check_historical_update_status", check_historical_update_status);
router.use("/create_link_token", create_link_token);
router.use("/get_onboarding_step", get_onboarding_step);
router.use("/plaid_hooks", plaid_hooks);
router.use("/plaid_transaction_sync", plaid_transaction_sync);
router.use("/set_access_token", set_access_token);
router.use("/set_onboarding_step", set_onboarding_step);
router.use("/upload_encrypted", upload_encrypted);

export default router;
