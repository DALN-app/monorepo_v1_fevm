import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Flex,
  ModalFooter,
  Button,
  Text,
} from "@chakra-ui/react";
import { BigNumber } from "ethers";
import { formatEther } from "ethers/lib/utils.js";
import { ComponentProps, useMemo } from "react";

import {
  basicFevmDalnABI,
  useBasicFevmDalnGetTokenInfo,
} from "~~/generated/wagmiTypes";
import usePrepareWriteAndWaitTx from "~~/hooks/usePrepareWriteAndWaitTx";

interface DecryptionModalProps
  extends Omit<ComponentProps<typeof Modal>, "children"> {
  tokenInfos: NonNullable<
    ReturnType<typeof useBasicFevmDalnGetTokenInfo>["data"]
  >[];
}

function DecryptionModal({ tokenInfos, ...props }: DecryptionModalProps) {
  const tokenIds = useMemo(
    () => tokenInfos.map((info) => info.id),
    [tokenInfos]
  );
  const totalPayment = useMemo(
    () =>
      tokenInfos.reduce((acc, info) => acc.add(info.price), BigNumber.from(0)),
    [tokenInfos]
  );

  const decryptMutation = usePrepareWriteAndWaitTx({
    address: process.env.NEXT_PUBLIC_DALN_CONTRACT_ADDRESS as `0x${string}`,
    abi: basicFevmDalnABI,
    functionName: "decrypt",
    args: [tokenIds],
    overrides: {
      value: totalPayment,
    },
  });

  const onConfirm = async () => {
    await decryptMutation.writeAsync?.();
    props.onClose();
  };

  return (
    <Modal isCentered size="sm" {...props}>
      <ModalOverlay backdropFilter="blur(3px)" />
      <ModalContent>
        <ModalHeader alignSelf="center">Decrypt Data</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex justifyContent="space-between" mb={2}>
            <Text>Data sets #</Text>
            <Text>{tokenInfos.length}</Text>
          </Flex>
          <Flex justifyContent="space-between">
            <Text>Total Payment</Text>
            <Text>{formatEther(totalPayment)} FIL</Text>
          </Flex>
        </ModalBody>

        <ModalFooter justifyContent={"space-between"}>
          <Button
            size={"lg"}
            width={"150px"}
            variant="ghost"
            onClick={props.onClose}
          >
            Cancel
          </Button>
          <Button
            size={"lg"}
            width={"150px"}
            onClick={onConfirm}
            isDisabled={decryptMutation.isLoading || decryptMutation.isError}
          >
            Confirm
          </Button>
        </ModalFooter>
        {decryptMutation.isError && (
          <Text color="red.500" textAlign="center">
            {decryptMutation.error?.message}
          </Text>
        )}
      </ModalContent>
    </Modal>
  );
}

export default DecryptionModal;
