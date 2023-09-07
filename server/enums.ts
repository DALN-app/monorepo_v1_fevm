// should be in a package shared between server and client, but for now, just copy it
export enum OnboardingSteps {
  Processing = "processing",
  FetchingPlaid = "fetchingPlaid",
  Encryption = "encryption",
  Minting = "minting",
  SetAccess = "setAccess",
  MintSuccess = "mintSuccess",
}
