import {
  Center,
  HStack,
  Box,
  Checkbox,
  Flex,
  Heading,
  Text,
  WrapItem,
  Link,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useAccount, useConnect } from "wagmi";

import WalletConnectionCheck from "./WalletConnectionCheck";

import JoinDALNButton from "~~/components/JoinDALNButton";
import Card from "~~/components/OnBoardingCard";
import { useBasicFevmDalnBalanceOf } from "~~/generated/wagmiTypes";
import useMutationCreateToken from "~~/hooks/useMutationCreateToken";

interface HasSBTCheckProps {
  isFetchingStep?: boolean;
}

function HasSBTCheck({ isFetchingStep }: HasSBTCheckProps) {
  const { address } = useAccount();
  const connection = useConnect();

  const [shouldLoad, setShouldLoad] = useState(true);

  const balanceQuery = useBasicFevmDalnBalanceOf({
    address: process.env.NEXT_PUBLIC_DALN_CONTRACT_ADDRESS as `0x${string}`,
    args: [address || "0x0"],
    enabled: !!address,
  });

  useEffect(() => {
    if (
      !connection.isLoading &&
      ((address && balanceQuery.isFetched) || !address)
    ) {
      setShouldLoad(false);
    }
  }, [connection.isLoading, balanceQuery.isFetched, address]);

  const [acceptTerms, setAcceptTerms] = useState(false);
  const { isLoading, isError, data, mutate } = useMutationCreateToken({});
  const linkToken = data?.link_token;

  useEffect(() => {
    if (acceptTerms) {
      mutate();
    }
  }, [mutate, acceptTerms]);

  if (shouldLoad) {
    return <Center h="100vh">Loading...</Center>;
  }

  return (
    <Center
      sx={{
        flex: 1,
      }}
    >
      <Box alignSelf="center" width="80vw">
        <Text textAlign="center" fontSize="lg" mb={8} color="#4A5568">
          Not a DALN member yet?
        </Text>
        <Card>
          <Heading as="h1" size="lg" textAlign="center" mb={2}>
            Join the party 🥳
          </Heading>
          <Heading as="h2" size="md" textAlign="center" mb={10}>
            for true ownership and monetization of your data
          </Heading>
          <WrapItem alignSelf="center">
            <Box justifyContent="start" alignItems="start">
              <HStack spacing="8px" alignItems="end" mb={6}>
                <Heading color={"primary.500"} as="h1" size="xl">
                  1. Upload & Encrypt
                </Heading>
                <Text fontSize="lg">credit card transactions</Text>
              </HStack>
              <HStack spacing="8px" alignItems="end" mb={6}>
                <Heading color={"primary.500"} as="h1" size="xl">
                  2. Mint
                </Heading>
                <Text fontSize="lg">
                  a non-transferrable DAO membership token
                </Text>
              </HStack>
              <HStack spacing="8px" alignItems="end" mb={6}>
                <Heading color={"primary.500"} as="h1" size="xl">
                  3. Get rewards
                </Heading>
                <Text fontSize="lg">for decrypted data</Text>
              </HStack>
              <Flex mb={6}>
                <Checkbox
                  isChecked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                >
                  <Text fontSize="sm" mb={0.5}>
                    By checking the box, I agree to DALN&apos;s{" "}
                    <Link
                      href="https://www.google.com"
                      color={"primary.500"}
                      isExternal
                    >
                      Terms of Use
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="https://www.google.com"
                      color={"primary.500"}
                      isExternal
                    >
                      Privacy Policy.
                    </Link>
                  </Text>
                </Checkbox>
              </Flex>
            </Box>
          </WrapItem>

          <Flex justifyContent="center">
            <WalletConnectionCheck>
              <JoinDALNButton
                linkToken={linkToken}
                isDisabled={!acceptTerms || isError || !linkToken}
                isLoading={isLoading || isFetchingStep}
              >
                Join DALN
              </JoinDALNButton>
            </WalletConnectionCheck>
          </Flex>
          <Flex justifyContent="center" mt={8}>
            <Text ml={2} maxWidth={720} fontSize="sm" align="center">
              Your data will be temporarily stored on a cloud server and then
              encrypted and uploaded to IPFS. The resulting IPFS link is
              immutable, and the data on the cloud server will be deleted.
            </Text>
          </Flex>
        </Card>
      </Box>
    </Center>
  );
}

export default HasSBTCheck;
