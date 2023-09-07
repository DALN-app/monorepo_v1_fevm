import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Card,
  CardBody,
  CardHeader,
  Container,
  Flex,
  Heading,
  Link,
  Text,
  Wrap,
} from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { BigNumber } from "ethers";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import { useAccount, useContractRead } from "wagmi";

import { AdminDataTable } from "~~/components/AdminDashboard";
import { BurnSBT } from "~~/components/Dashboard";
import ConnectedLayout from "~~/components/layouts/ConnectedLayout";
import NavBar from "~~/components/NavBar";
import PageTransition from "~~/components/PageTransition";
import BackChevronSvgComponent from "~~/components/svgComponents/BackChevronSvgComponent";
import {
  basicFevmDalnABI,
  useBasicFevmDalnGetTokenInfos,
} from "~~/generated/wagmiTypes";
import { NextPageWithLayout } from "~~/pages/_app";

const AdminDashboard: NextPageWithLayout = () => {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>DALN - Dashboard</title>
      </Head>
      <PageTransition>
        <Container
          maxW="container.xl"
          mt={{
            base: 4,
            md: 16,
            lg: 24,
          }}
        >
          <Card w="full" size="lg">
            <CardHeader>
              <Flex justifyContent="space-between" alignItems="center" mb={3}>
                <Link display={"flex"} alignItems={"center"} href={"/"}>
                  <BackChevronSvgComponent />
                  <Text ml={4}>Back to dashboard</Text>
                </Link>

                <Box
                  sx={{
                    button: {
                      border: "1px solid #E2E8F0 !important",
                    },
                  }}
                >
                  <ConnectButton />
                </Box>
              </Flex>

              <Heading
                as="h1"
                size="md"
                fontWeight={500}
                textAlign="center"
                mt={4}
              >
                Manage DALN Data
              </Heading>
            </CardHeader>

            <CardBody>
              <AdminDataTable />
            </CardBody>
          </Card>
        </Container>
      </PageTransition>
    </>
  );
};

AdminDashboard.getLayout = function getLayout(page) {
  return <ConnectedLayout>{page}</ConnectedLayout>;
};

export default AdminDashboard;
