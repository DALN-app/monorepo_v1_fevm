import { Button, ButtonProps, Flex } from "@chakra-ui/react";
import axios, { AxiosError, AxiosResponse } from "axios";
import { useState } from "react";
import { PlaidLinkOnSuccess, usePlaidLink } from "react-plaid-link";
import { useMutation, useQueryClient } from "react-query";
import { useAccount } from "wagmi";

import { OnboardingSteps } from "~~/types/onboarding";

interface SetAccessTokenResponse {
  success: true;
  plaidItemId: string;
  user: {
    onboardingStep?: OnboardingSteps;
    plaid_item_id?: string;
    cid?: string;
  };
}

const setAccessToken = async ({
  public_token,
  address,
}: {
  public_token: string;
  address: string;
}) => {
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_LAMBDA_SERVER_URL}/api/v1/set_access_token`,
    {
      public_token,
      address,
    }
  );
  return response.data;
};
interface JoinDALNButtonProps extends ButtonProps {
  linkToken?: string;
}
export default function JoinDALNButton({
  linkToken,
  onClick = () => null,
  isDisabled,
  isLoading = false,
  ...props
}: JoinDALNButtonProps) {
  const [isPlaidLinkLoading, setIsPlaidLinkLoading] = useState(false);
  const { address } = useAccount();

  const queryClient = useQueryClient();

  const { mutateAsync, isLoading: isLoadingSetAccessToken } = useMutation<
    SetAccessTokenResponse,
    AxiosError,
    { public_token: string; address: string }
  >(setAccessToken, {
    onSuccess: (data) => {
      sessionStorage.setItem("plaidItemId", data.plaidItemId);

      queryClient.setQueryData(["get_onboarding_step", address], {
        onboardingStep: data.user.onboardingStep,
        plaidItemId: data.user.plaid_item_id,
        cid: data.user.cid,
      });
    },
    onError(error) {
      console.log(`axios.post() failed: ${error}`);
    },
  });

  const sendPublicTokenToBackend: PlaidLinkOnSuccess = async (
    public_token,
    metadata
  ) => {
    setIsPlaidLinkLoading(false);
    if (!address) return;
    await mutateAsync({ public_token, address });
  };

  const { open, ready } = usePlaidLink({
    token: linkToken || "",
    onSuccess: sendPublicTokenToBackend,
  });

  return (
    <Flex justifyContent="center">
      <Button
        size="lg"
        maxWidth={382}
        flex={1}
        isLoading={isLoading || isLoadingSetAccessToken || isPlaidLinkLoading}
        isDisabled={!linkToken || !ready || isDisabled}
        onClick={() => {
          setIsPlaidLinkLoading(true);
          open();
        }}
        {...props}
      >
        Join DALN
      </Button>
    </Flex>
  );
}
