import {
  useDisclosure,
  Button,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from "@chakra-ui/react";
import axios from "axios";
import { BigNumber } from "ethers";
import { useRouter } from "next/router";
import { Component, ComponentProps, useEffect, useRef } from "react";
import { useMutation } from "react-query";
import { useAccount } from "wagmi";

import {
  basicFevmDalnABI,
  useBasicFevmDalnBalanceOf,
} from "~~/generated/wagmiTypes";
import usePrepareWriteAndWaitTx from "~~/hooks/usePrepareWriteAndWaitTx";

interface BurnSBTProps extends ComponentProps<typeof Button> {
  alertDialogProps?: Component<typeof AlertDialog>;
  tokenId?: BigNumber;
}

export default function BurnSBT({
  alertDialogProps,
  tokenId,
  ...props
}: BurnSBTProps) {
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef(null);
  const { address } = useAccount();

  const balanceQuery = useBasicFevmDalnBalanceOf({
    address: process.env.NEXT_PUBLIC_DALN_CONTRACT_ADDRESS as `0x${string}`,
    args: [address || "0x0"],
    enabled: !!address,
    watch: true,
  });

  const userBurn = usePrepareWriteAndWaitTx({
    address: process.env.NEXT_PUBLIC_DALN_CONTRACT_ADDRESS as `0x${string}`,
    abi: basicFevmDalnABI,
    functionName: "burn",
    args: [tokenId],
    enabled:
      !!process.env.NEXT_PUBLIC_DALN_CONTRACT_ADDRESS && tokenId !== undefined,
  });

  const burnFromDBMutation = useMutation(
    async () => {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_LAMBDA_SERVER_URL}/api/v1/burn/${address}`
      );
    },
    {
      onSuccess: () => {
        router.reload();
      },
    }
  );

  useEffect(() => {
    if (userBurn.isSuccess && balanceQuery.data && balanceQuery.data.lte(0)) {
      void router.push("/user/dashboard");
    }
  }, [balanceQuery.data, onClose, router, userBurn.isSuccess]);

  const handleBurn = async () => {
    if (userBurn.writeAsync) {
      try {
        await userBurn.writeAsync();
        await burnFromDBMutation.mutateAsync();
      } catch (e) {
        console.error("burn error", e);
        onClose();
      }
    }
  };

  return (
    <>
      <Button
        colorScheme="red"
        variant="outline"
        onClick={onOpen}
        isLoading={
          userBurn.isLoading || (userBurn.isSuccess && balanceQuery.data?.gt(0))
        }
        {...props}
      >
        Burn my SBT
      </Button>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        {...alertDialogProps}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Are you sure?
            </AlertDialogHeader>

            <AlertDialogBody>
              If you burn your soul-bound token, you will lose your DAO
              membership and stop sharing your data. You will also stop
              receiving rewards.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleBurn}
                isDisabled={!userBurn.writeAsync}
                ml={3}
                isLoading={userBurn.isLoading}
              >
                Burn it anyway
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}
