import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Center,
  CircularProgress,
  HStack,
  Progress,
} from "@chakra-ui/react";
import { useAccountModal } from "@rainbow-me/rainbowkit";
import { BigNumber } from "ethers";
import { AnimatePresence, motion } from "framer-motion";
import Head from "next/head";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { erc721ABI, useAccount, useConnect, useContractRead } from "wagmi";

import OnBoardingCenteredCard from "~~/components/OnBoardingCenteredCard";
import OnBoardingContentPiece from "~~/components/OnBoardingContentPiece";
import OnBoardingHeaderComponent from "~~/components/OnBoardingHeaderComponent";
import PageTransition from "~~/components/PageTransition";
import WalletConnectionCheck from "~~/components/WalletConnectionCheck";
import {
  useBasicFevmDalnGetRoleAdmin,
  useBasicFevmDalnGetTokenInfos,
  useBasicFevmDalnIsAdmin,
  useBasicFevmDalnTokenOfOwnerByIndex,
} from "~~/generated/wagmiTypes";
import { SpendAdmin } from "~~/oldContracts";

const OnboardingNotConnected = () => {
  const { openAccountModal } = useAccountModal();
  const { address } = useAccount();
  const router = useRouter();

  const [shouldLoad, setShouldLoad] = useState(true);

  const isAdminQuery = useBasicFevmDalnIsAdmin({
    args: [address || "0x0"],
    address: process.env.NEXT_PUBLIC_DALN_CONTRACT_ADDRESS as `0x${string}`,
    enabled: !!address,
    onSettled: () => {
      setShouldLoad(false);
    },
  });

  useEffect(() => {
    if (!address) {
      setShouldLoad(false);
    }

    if (address && !isAdminQuery.isLoading) {
      if (isAdminQuery.data) {
        void router.replace("/admin/dashboard");
      }
    }
  }, [address, isAdminQuery.data, isAdminQuery.isLoading, router]);

  return (
    <>
      <Head>
        <title>DALN - Admin</title>
      </Head>

      {address && shouldLoad ? (
        <PageTransition>
          <Center h="100vh">
            <CircularProgress isIndeterminate />
          </Center>
        </PageTransition>
      ) : (
        <PageTransition>
          <OnBoardingCenteredCard
            prependedContent={
              <>
                <OnBoardingHeaderComponent
                  title="DALN"
                  description="Be the shepherd for a vibrant data economy"
                />
              </>
            }
          >
            <HStack mb={24}>
              <OnBoardingContentPiece
                title="Access valuable data"
                content="Access valuable insights from rich consumer data without compromising data privacy"
              />
              <OnBoardingContentPiece
                title="Reward DAO members"
                content="Reward DAO members for their contribution to the data economy"
              />
              <OnBoardingContentPiece
                title="Protect data privacy"
                content="Get behavioral insights without compromising data privacy"
              />
            </HStack>

            <Center pos="relative">
              <AnimatePresence>
                {address && !isAdminQuery.isLoading && !isAdminQuery.data && (
                  <Alert
                    justifyContent="center"
                    borderRadius={12}
                    status="warning"
                    alignItems="center"
                    colorScheme="orange"
                    variant="subtle"
                    w={400}
                    px={6}
                    pos="absolute"
                    top={-16}
                    as={motion.div}
                    key="admin-nft-not-detected"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <AlertIcon />
                    <AlertTitle color="orange.500">Admin role</AlertTitle>
                    <AlertDescription color="orange.500">
                      not detected.{" "}
                      <Button
                        variant="link"
                        onClick={openAccountModal}
                        color="orange.500"
                      >
                        Change wallet?
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}

                <Box as={motion.div} layout>
                  <WalletConnectionCheck
                    notConnectedProps={{
                      variant: "solid",
                      size: "lg",
                    }}
                  >
                    <NextLink passHref href="/admin/dashboard">
                      <Button
                        isLoading={isAdminQuery.isLoading}
                        isDisabled={!isAdminQuery.data}
                        size="lg"
                      >
                        Enter admin dashboard
                      </Button>
                    </NextLink>
                  </WalletConnectionCheck>
                </Box>
              </AnimatePresence>
            </Center>
          </OnBoardingCenteredCard>
        </PageTransition>
      )}
    </>
  );
};

export default OnboardingNotConnected;
