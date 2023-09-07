import { Center, CircularProgress } from "@chakra-ui/react";
import axios from "axios";
import { useMemo } from "react";
import { useQuery } from "react-query";
import { useAccount, useConnect } from "wagmi";

import OverlayOnboarding from "../OverlayOnboarding";

import PageTransition from "~~/components/PageTransition";
import { OnboardingSteps } from "~~/types/onboarding";

interface HasSBTProps {
  children: React.ReactNode;
}

const HasSBT = ({ children }: HasSBTProps) => {
  const { address } = useAccount();
  const { isLoading } = useConnect();
  const {
    data: stepData,
    isFetchedAfterMount: isStepFetched,
    isError,
  } = useQuery(
    ["get_onboarding_step", address],
    async () => {
      const response = await axios.get<{
        onboardingStep: OnboardingSteps;
      }>(
        `${process.env.NEXT_PUBLIC_LAMBDA_SERVER_URL}/api/v1/get_onboarding_step/${address}`
      );
      return response.data;
    },
    {
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  const loader = useMemo(() => {
    return (
      <Center h="100vh">
        <CircularProgress isIndeterminate />
      </Center>
    );
  }, []);

  return (
    <PageTransition>
      {isLoading || (address && !isStepFetched) ? (
        loader
      ) : (
        <>
          {(isError ||
            stepData?.onboardingStep !== OnboardingSteps.MintSuccess) && (
            <OverlayOnboarding />
          )}
          {children}
        </>
      )}
    </PageTransition>
  );
};

export default HasSBT;
