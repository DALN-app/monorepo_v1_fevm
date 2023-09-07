import { Box, Button, Center, HStack, VStack } from "@chakra-ui/react";
import Head from "next/head";

import OnBoardingCard from "~~/components/OnBoardingCard";
import OnBoardingContentPiece from "~~/components/OnBoardingContentPiece";
import OnBoardingHeaderComponent from "~~/components/OnBoardingHeaderComponent";
import OnboardingGraphSvgComponent from "~~/components/svgComponents/OnboardingGraphSvgComponent";
const OnboardingNotConnected = () => {
  return (
    <>
      <Head>
        <title>DALN - Onboarding</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Center
        sx={{
          flex: 1,
        }}
      >
        <OnBoardingCard
          width={"90%"}
          alignSelf={"center"}
          prependedContent={
            <VStack spacing={6}>
              <OnBoardingHeaderComponent
                title="DALN"
                description="Harvest data insights & stay compliant"
              />
              <Button colorScheme="purple" size="md">
                Coming soon
              </Button>
            </VStack>
          }
        >
          <HStack>
            <Box flex={1}>
              <OnBoardingContentPiece
                textAlign="start"
                title="Control your data"
                content="Have true ownership and governance in the data economy"
                mb={10}
              />
              <OnBoardingContentPiece
                textAlign="start"
                title="Get rewards"
                content="Get rewards in FIL whenever your data is decrypted"
                mb={10}
              />
              <OnBoardingContentPiece
                textAlign="start"
                title="Preserve privacy"
                content="Pool your anonymized transaction data with other DAO members"
              />
            </Box>
            <OnboardingGraphSvgComponent />
          </HStack>
        </OnBoardingCard>
      </Center>
    </>
  );
};

export default OnboardingNotConnected;
