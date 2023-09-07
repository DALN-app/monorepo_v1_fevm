import axios, { AxiosResponse } from "axios";
import { useMutation } from "react-query";

interface CreateLinkResponse {
  link_token: string;
}

const createLinkToken = async () => {
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_LAMBDA_SERVER_URL}/api/v1/create_link_token`
  );

  return response.data as CreateLinkResponse;
};

const useMutationCreateToken = (options: Parameters<typeof useMutation>[2]) =>
  useMutation<CreateLinkResponse>(["create-token"], createLinkToken, options);

export default useMutationCreateToken;
