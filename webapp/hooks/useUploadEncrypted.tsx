import lighthouse, { getAuthMessage } from "@lighthouse-web3/sdk";
import axios from "axios";
import { BigNumberish, ethers } from "ethers";
import React from "react";
import { useMutation } from "react-query";
import { useAccount, useSigner } from "wagmi";

const uploadEncrypted = async ({
  data,
  signedMessage,
  publicKey,
}: {
  data: string;
  signedMessage: string;
  publicKey: string;
}) => {
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_LAMBDA_SERVER_URL}/api/v1/upload_encrypted`,
    {
      data,
      signedMessage,
      publicKey,
    }
  );
  return response.data as {
    data: {
      Name: string;
      Hash: string;
      Size: string;
    };
  };
};

const applyAccessCondition = async ({
  cid,
  tokenId,
  signedMessage,
  publicKey,
}: {
  cid: string;
  tokenId: BigNumberish;
  signedMessage: string;
  publicKey: string;
}) => {
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_LAMBDA_SERVER_URL}/api/v1/apply_access_cond`,
    {
      cid,
      tokenId,
      signedMessage,
      publicKey,
    }
  );

  return response.data;
};

function useUploadEncrypted() {
  const { data: signer, isError, isLoading } = useSigner();
  const { address, isConnecting, isDisconnected } = useAccount();

  const applyAccessConditionMutation = useMutation(applyAccessCondition);
  const uploadEncryptedMutation = useMutation(uploadEncrypted);

  const encryptionSignature = async () => {
    if (!signer || !address) {
      return;
    }

    const getAuthMessage = await lighthouse.getAuthMessage(address);

    const messageRequested = (await lighthouse.getAuthMessage(address)).data
      .message;

    const signedMessage = await signer.signMessage(messageRequested);
    return {
      signedMessage: signedMessage,
      publicKey: address,
    };
  };

  const uploadFileEncrypted = async (data: string) => {
    const sig = await encryptionSignature();

    if (!sig) {
      return;
    }

    const response = await uploadEncryptedMutation.mutateAsync({
      data,
      signedMessage: sig.signedMessage,
      publicKey: sig.publicKey,
    });

    return response;
  };

  const setAccessCondition = async (cid: string, tokenId: BigNumberish) => {
    const sig = await encryptionSignature();

    if (!sig) {
      return;
    }

    const accessConditionRes = await applyAccessConditionMutation.mutateAsync({
      cid,
      tokenId,
      signedMessage: sig.signedMessage,
      publicKey: sig.publicKey,
    });

    return accessConditionRes;
  };

  return {
    uploadFileEncrypted,
    setAccessCondition,
    uploadEncryptedMutation,
    applyAccessConditionMutation,
  };
}

export default useUploadEncrypted;
