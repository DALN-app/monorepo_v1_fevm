import {
  Center,
  HStack,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
} from "@chakra-ui/react";
import { useAccount } from "wagmi";

import OnBoardingCenteredCard from "./OnBoardingCenteredCard";
import OnBoardingContentPiece from "./OnBoardingContentPiece";
import OnBoardingHeaderComponent from "./OnBoardingHeaderComponent";
import WalletConnectionCheck from "./WalletConnectionCheck";

function OverlayUserConnectionCheck() {
  const { isConnected } = useAccount();

  return (
    <Modal
      isOpen={!isConnected}
      isCentered
      onClose={() => undefined}
      size="5xl"
    >
      <ModalOverlay backdropFilter="blur(3px)" />
      <ModalContent borderRadius="xl" overflow="hidden">
        <ModalBody py={12} bgColor="primary.50">
          <OnBoardingCenteredCard
            prependedContent={
              <OnBoardingHeaderComponent
                title="DALN"
                description="Your data is more valuable than you think"
              />
            }
          >
            <HStack mb={20}>
              <OnBoardingContentPiece
                title="Control your data"
                content="Have true ownership and governance in the data economy"
              />
              <OnBoardingContentPiece
                title="Get rewards"
                content="Get rewards in FIL whenever your data is decrypted"
              />

              <OnBoardingContentPiece
                title="Preserve privacy"
                content="Pool your anonymized transaction data with other DAO members"
              />
            </HStack>

            <Center>
              <WalletConnectionCheck />
            </Center>
          </OnBoardingCenteredCard>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default OverlayUserConnectionCheck;
