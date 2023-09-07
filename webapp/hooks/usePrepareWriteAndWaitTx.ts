import { useToast } from "@chakra-ui/react";
import {
  useWaitForTransaction,
  usePrepareContractWrite,
  useContractWrite,
  UsePrepareContractWriteConfig,
  UseContractWriteConfig,
} from "wagmi";

export default function usePrepareWriteAndWaitTx(
  prepareOptions: UsePrepareContractWriteConfig,
  options?: {
    onTxConfirmed?: () => void;
  }
) {
  const toast = useToast();

  const isValid =
    prepareOptions &&
    prepareOptions.abi &&
    prepareOptions.address &&
    prepareOptions.functionName;

  const nonUndefinedAbi = prepareOptions.abi ? prepareOptions.abi : [];

  const prepareMutation = usePrepareContractWrite<
    typeof nonUndefinedAbi,
    string,
    number
  >(isValid ? prepareOptions : undefined);

  const writeMutation = useContractWrite({
    ...(prepareMutation.config as UseContractWriteConfig),
    onMutate: () => {
      toast({
        title: "Please approve the transaction in your wallet",
        status: "info",
        duration: 3000,
        position: "top",
        isClosable: true,
      });
    },
    onSuccess: (tx) => {
      toast({
        id: tx.hash,
        title: `PENDING ${tx.hash}`,
        status: "loading",
        duration: null,
        isClosable: false,
        position: "bottom-right",
      });
    },
    onError: (err) => {
      toast({
        title: "Transaction failed",
        description: err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    },
  });

  const resultTx = useWaitForTransaction({
    hash: writeMutation.data?.hash,
    onSuccess: (tx) => {
      toast.update(tx.transactionHash, {
        title: `SUCCESS ${tx.transactionHash}`,
        status: "success",
        duration: 15000,
        isClosable: true,
        position: "bottom-right",
      });
      options?.onTxConfirmed?.();
    },
  });

  return {
    prepareMutation,
    writeMutation,
    resultTx,
    write: writeMutation.write,
    writeAsync: writeMutation.writeAsync,
    isLoading:
      prepareMutation.isLoading ||
      writeMutation.isLoading ||
      (writeMutation.isSuccess && !resultTx.data),
    isError:
      prepareMutation.isError || writeMutation.isError || resultTx.isError,
    error: prepareMutation.error || writeMutation.error || resultTx.error,
    isSuccess:
      prepareMutation.isSuccess &&
      writeMutation.isSuccess &&
      resultTx.isSuccess,
  };
}
