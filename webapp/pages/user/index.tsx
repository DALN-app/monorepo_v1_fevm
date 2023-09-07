import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Center,
  CircularProgress,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAccount, useContractRead } from "wagmi";

import PageTransition from "~~/components/PageTransition";
import {
  basicFevmDalnABI,
  useBasicFevmDalnBalanceOf,
} from "~~/generated/wagmiTypes";

export default function UserHome() {
  const { address } = useAccount();

  const balanceQuery = useBasicFevmDalnBalanceOf({
    address: process.env.NEXT_PUBLIC_DALN_CONTRACT_ADDRESS as `0x${string}`,
    args: [address || "0x0"],
    enabled: !!address,
  });

  const router = useRouter();

  useEffect(() => {
    if (address && balanceQuery.isSuccess) {
      if (balanceQuery.data && balanceQuery.data.gt(0)) {
        void router.replace("/user/dashboard");
      }

      if (balanceQuery.data && balanceQuery.data.lte(0)) {
        void router.replace("/user/onboarding/no-token");
      }
    }
  }, [address, balanceQuery.data, balanceQuery.isSuccess, router]);

  if (!address && router.isReady) {
    void router.replace("/user/onboarding/not-connected");
  }

  if (balanceQuery.isError) {
    return (
      <PageTransition>
        <Center h="100vh">
          <Alert
            status="error"
            variant="subtle"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            flex={1}
          >
            <AlertIcon boxSize="40px" mr={0} />
            <AlertTitle mt={4} mb={1} fontSize="lg">
              Error loading your token balance
            </AlertTitle>
            <AlertDescription maxWidth="sm">
              We&apos;re sorry, an error occurred while loading your token
              balance. Please try again or contact support.
            </AlertDescription>
          </Alert>
        </Center>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <Center h="100vh">
        <CircularProgress isIndeterminate />
      </Center>
    </PageTransition>
  );
}
