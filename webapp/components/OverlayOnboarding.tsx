import {
  Center,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Box,
  Flex,
  Heading,
  Text,
  Link,
  Button,
  Container,
  Spinner,
} from "@chakra-ui/react";
import axios, { AxiosResponse } from "axios";
import { BigNumber } from "ethers";
import { parseEther } from "ethers/lib/utils.js";
import { useCallback, useEffect, useMemo } from "react";
import { useQueryClient, useMutation, useQuery } from "react-query";
import { useAccount, useBalance } from "wagmi";

import HasSBTCheck from "./HasSBTCheck";
import DataBaseSvgComponent from "./svgComponents/DataBaseSvgComponent";
import SuccessSvgComponent from "./svgComponents/SuccessSvgComponent";
import UploadUserDataProgressBar from "./UploadUserDataProgressBar";
import WalletConnectionCheck from "./WalletConnectionCheck";

import Card from "~~/components/OnBoardingCard";
import {
  basicFevmDalnABI,
  useBasicFevmDalnBalanceOf,
  useBasicFevmDalnTokenOfOwnerByIndex,
} from "~~/generated/wagmiTypes";
import useMutationCreateToken from "~~/hooks/useMutationCreateToken";
import usePrepareWriteAndWaitTx from "~~/hooks/usePrepareWriteAndWaitTx";
import useUploadEncrypted from "~~/hooks/useUploadEncrypted";
import { NextPageWithLayout } from "~~/pages/_app";
import { OnboardingSteps } from "~~/types/onboarding";

const steps = {
  [OnboardingSteps.Processing]: {
    number: 1,
    title: "Waiting for Plaid data processing",
    subtitle: "Plaid is updating your data. This may take a few minutes.",
  },
  [OnboardingSteps.FetchingPlaid]: {
    number: 2,
    title: "Fetching your data from Plaid",
    subtitle:
      "Your data is being fetched from Plaid to be encrypted and stored on decentralized storage.",
  },
  [OnboardingSteps.Encryption]: {
    number: 3,
    title: "Encrypt your data",
    subtitle:
      "After encryption, your file will be stored on decentralized storage provided by IPFS.",
  },
  [OnboardingSteps.Minting]: {
    number: 4,
    title: "Encryption successful! Mint your token now",
    subtitle:
      "You will be asked to review and confirm the minting from your wallet.",
  },
  [OnboardingSteps.SetAccess]: {
    number: 5,
    title: "Set access condition",
    subtitle:
      "Sign this transaction to set the access condition for your data. This will ensure that only authorized parties such as DAO admins can decrypt and access your data. You will be rewarded whenever your data is decrypted.",
  },
  [OnboardingSteps.MintSuccess]: {
    number: 6,
    title: "Token mint successful",
    subtitle:
      "You can always burn the token in the personal dashboard if you wish to exit from the DAO and stop sharing your encrypted data.",
  },
};

const getHistoricalUpdateStatus = async (plaidItemId: string) => {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_LAMBDA_SERVER_URL}/api/v1/check_historical_update_status/${plaidItemId}`
  );
  return response.data;
};

const getPlaidTransactionSync = async (itemId: string) => {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_LAMBDA_SERVER_URL}/api/v1/plaid_transaction_sync/${itemId}`
  );
  return response.data;
};

function OverlayOnboarding() {
  const { address: userAddress } = useAccount();
  const userBalance = useBalance({
    address: userAddress,
  });
  const queryClient = useQueryClient();

  const { data: stepData, isFetching: isFetchingStep } = useQuery(
    ["get_onboarding_step", userAddress],
    async () => {
      const response = await axios.get<{
        onboardingStep: OnboardingSteps;
        plaidItemId?: string;
        cid?: string;
      }>(
        `${process.env.NEXT_PUBLIC_LAMBDA_SERVER_URL}/api/v1/get_onboarding_step/${userAddress}`
      );
      return response.data;
    },
    {
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  const step = stepData?.onboardingStep;

  const plaidItemId = useMemo(() => {
    if (typeof window === "undefined") return null;
    return stepData?.plaidItemId || sessionStorage.getItem("plaidItemId");
  }, [stepData?.plaidItemId]);

  const setStepMutation = useMutation<
    AxiosResponse<{
      user: {
        onboardingStep?: OnboardingSteps;
        plaid_item_id?: string;
        cid?: string;
      };
    }>,
    unknown,
    { newStep: keyof typeof steps; cid?: string }
  >(
    async ({ newStep, cid }) =>
      await axios.post(
        `${process.env.NEXT_PUBLIC_LAMBDA_SERVER_URL}/api/v1/set_onboarding_step/${userAddress}`,
        {
          onboardingStep: newStep,
          cid,
        }
      ),
    {
      onSuccess: ({ data }) => {
        queryClient.setQueryData(["get_onboarding_step", userAddress], {
          onboardingStep: data.user.onboardingStep,
          plaidItemId: data.user.plaid_item_id,
          cid: data.user.cid,
        });
      },
    }
  );

  const setStep = useCallback(
    (newStep: keyof typeof steps) => {
      if (setStepMutation.isLoading) return;
      setStepMutation.mutate({
        newStep,
      });
    },
    [setStepMutation]
  );

  const progress = useMemo(
    () =>
      step
        ? Math.round((100 / Object.keys(steps).length) * steps[step].number)
        : 0,
    [step]
  );

  const userTokenIdQuery = useBasicFevmDalnTokenOfOwnerByIndex({
    address: process.env.NEXT_PUBLIC_DALN_CONTRACT_ADDRESS as `0x${string}`,
    args: [userAddress || "0x0", BigNumber.from(0)],
    enabled: !!userAddress && step === OnboardingSteps.SetAccess,
    watch: true,
  });

  const historicalUpdateStatusQuery = useQuery(
    [plaidItemId, "check_historical_update_status"],
    () => getHistoricalUpdateStatus(plaidItemId as string),
    {
      enabled: !!plaidItemId && step === OnboardingSteps.Processing,
      onSuccess: (data) => {
        setStep(OnboardingSteps.FetchingPlaid);
      },
      refetchInterval: 500,
    }
  );

  const plaidTransactionSync = useQuery(
    [plaidItemId, "plaid_transaction_sync"],
    () => getPlaidTransactionSync(plaidItemId as string),
    {
      onSuccess: (data) => {
        console.log("********** Data from Plaid *********", data);
        if (step === OnboardingSteps.FetchingPlaid) {
          setStep(OnboardingSteps.Encryption);
        }
      },
      enabled:
        !!plaidItemId &&
        (step === OnboardingSteps.FetchingPlaid ||
          step === OnboardingSteps.Encryption),
    }
  );

  const {
    uploadFileEncrypted,
    setAccessCondition,
    uploadEncryptedMutation,
    applyAccessConditionMutation,
  } = useUploadEncrypted();

  console.log("****** current CID Value:", stepData?.cid);

  const mintToken = usePrepareWriteAndWaitTx(
    {
      address: process.env.NEXT_PUBLIC_DALN_CONTRACT_ADDRESS as `0x${string}`,
      abi: basicFevmDalnABI,
      functionName: "safeMint",
      args: [stepData?.cid || ""],
      enabled:
        !!process.env.NEXT_PUBLIC_DALN_CONTRACT_ADDRESS &&
        !!userAddress &&
        !!stepData?.cid,
    },
    {
      onTxConfirmed: () => {
        setStep(OnboardingSteps.SetAccess);
      },
    }
  );

  const loadingStep = useMemo(
    () => (
      <Card
        height={"300px"}
        maxWidth={"680px"}
        flex={1}
        borderStyle={"dashed"}
        borderWidth={1}
        borderColor="rgba(0, 0, 0, 0.3)"
        justifyContent="center"
      >
        <Container centerContent>
          <Spinner
            alignSelf="center"
            emptyColor="rgba(64, 117, 255, 0.2)"
            color="#4075FF"
            mb={6}
            mt={"69px"}
          />
          <Text textAlign="center" fontSize="md" mb={1} color="#4A5568">
            This may take a while...
          </Text>{" "}
          <Text textAlign="center" fontSize="md" color="#4A5568" mb={"69px"}>
            Please do not close your browser
          </Text>
        </Container>
      </Card>
    ),
    []
  );

  const encryptionStep = useMemo(
    () => (
      <Card
        height={"300px"}
        maxWidth={"680px"}
        flex={1}
        border="none"
        justifyContent="center"
      >
        <Container>
          <Center>
            <DataBaseSvgComponent />
          </Center>
          <Text textAlign="center" fontSize="md" color="#4A5568">
            Sign and encrypt your data
          </Text>
          <WalletConnectionCheck>
            <Flex flex={1} justifyContent="center" mt={10}>
              <Button
                maxWidth={320}
                size="lg"
                flex={1}
                mb={2}
                isLoading={
                  uploadEncryptedMutation.isLoading ||
                  setStepMutation.isLoading ||
                  plaidTransactionSync.isLoading
                }
                onClick={async () => {
                  const data = JSON.stringify(
                    plaidTransactionSync.data,
                    null,
                    2
                  );
                  const res = await uploadFileEncrypted(data);
                  if (!res) {
                    console.error("Error uploading encrypted file");
                  } else {
                    setStepMutation.mutate({
                      newStep: OnboardingSteps.Minting,
                      cid: res.data.Hash,
                    });
                  }
                }}
              >
                Encrypt data
              </Button>
            </Flex>
          </WalletConnectionCheck>
        </Container>
      </Card>
    ),
    [
      plaidTransactionSync.data,
      plaidTransactionSync.isLoading,
      setStepMutation,
      uploadEncryptedMutation.isLoading,
      uploadFileEncrypted,
    ]
  );

  const mintingStep = useMemo(
    () => (
      <Card
        height={"300px"}
        maxWidth={"680px"}
        flex={1}
        border="none"
        justifyContent="center"
      >
        <Container>
          <Center>
            <DataBaseSvgComponent />
          </Center>
          <Text textAlign="center" fontSize="md" color="#4A5568">
            The token is free to mint but you will pay a small gas fee in FIL
          </Text>
          <WalletConnectionCheck>
            <Flex
              flex={1}
              justifyContent="center"
              alignItems="center"
              mt={10}
              flexDir="column"
            >
              <Button
                maxWidth={320}
                size="lg"
                mb={2}
                isLoading={mintToken.isLoading || setStepMutation.isLoading}
                isDisabled={!mintToken.write}
                onClick={() => {
                  if (mintToken.write) {
                    mintToken.write();
                  }
                }}
              >
                Mint token
              </Button>
              {userBalance.data?.value.lt(parseEther("0.01")) && (
                <Text textAlign="center" fontSize="xs" color="red">
                  Make sure you have enough funds for gas
                </Text>
              )}
            </Flex>
          </WalletConnectionCheck>
        </Container>
      </Card>
    ),
    [mintToken, setStepMutation.isLoading, userBalance.data?.value]
  );

  const setAccessStep = useMemo(
    () => (
      <Card
        height={"300px"}
        maxWidth={"680px"}
        flex={1}
        border="none"
        justifyContent="center"
      >
        <Container>
          <Center>
            <DataBaseSvgComponent />
          </Center>
          <Text textAlign="center" fontSize="md" color="#4A5568">
            Sign to set access condition
          </Text>
          <WalletConnectionCheck>
            <Flex flex={1} justifyContent="center" alignItems="center" mt={10}>
              <Button
                maxWidth={320}
                size="lg"
                flex={1}
                mb={2}
                mx="auto"
                isLoading={
                  applyAccessConditionMutation.isLoading ||
                  userTokenIdQuery.isLoading ||
                  setStepMutation.isLoading ||
                  userTokenIdQuery.data === undefined
                }
                onClick={async () => {
                  if (userTokenIdQuery.data === undefined) {
                    console.error("TokenId not ready");
                    return;
                  }
                  if (!stepData?.cid) {
                    console.error("CID undefined");
                    return;
                  }
                  await setAccessCondition(
                    stepData?.cid,
                    userTokenIdQuery.data.toNumber()
                  );
                  setStep(OnboardingSteps.MintSuccess);
                }}
              >
                Set access condition
              </Button>
            </Flex>
          </WalletConnectionCheck>
        </Container>
      </Card>
    ),
    [
      applyAccessConditionMutation.isLoading,
      userTokenIdQuery.isLoading,
      userTokenIdQuery.data,
      setStepMutation.isLoading,
      stepData?.cid,
      setAccessCondition,
      setStep,
    ]
  );

  return (
    <Modal
      isOpen={step !== OnboardingSteps.MintSuccess}
      isCentered
      onClose={() => undefined}
      size="5xl"
    >
      <ModalOverlay backdropFilter="blur(3px)" />
      <ModalContent borderRadius="xl" overflow="hidden">
        <ModalBody py={12} bgColor="primary.50">
          {!step ? (
            <HasSBTCheck isFetchingStep={isFetchingStep} />
          ) : (
            <Center
              sx={{
                flex: 1,
              }}
            >
              <Box alignSelf="center" width="80vw" overflow={"hidden"}>
                <Heading as="h1" size="lg" textAlign="center" mb={2}>
                  {steps[step].title}
                </Heading>
                <Text textAlign="center" fontSize="lg" mb={16} color="#4A5568">
                  {steps[step].subtitle}
                </Text>
                <Center alignItems="center">
                  {(step === OnboardingSteps.Processing ||
                    step === OnboardingSteps.FetchingPlaid) &&
                    loadingStep}
                  {step === OnboardingSteps.Encryption && encryptionStep}
                  {step === OnboardingSteps.Minting && mintingStep}
                  {step === OnboardingSteps.SetAccess && setAccessStep}
                  {step === OnboardingSteps.MintSuccess && (
                    <Container>
                      <Flex flex={1} justifyContent="center">
                        <SuccessSvgComponent />
                      </Flex>
                      <Flex flex={1} justifyContent="center" mt={20}>
                        <Link href="/user/dashboard">
                          <Button maxWidth={320} size="lg" flex={1} mb={2}>
                            View in dashboard
                          </Button>
                        </Link>
                      </Flex>
                    </Container>
                  )}
                </Center>
                {step === OnboardingSteps.MintSuccess ? null : (
                  <UploadUserDataProgressBar progress={progress} />
                )}
              </Box>
            </Center>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default OverlayOnboarding;
