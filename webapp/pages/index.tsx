import {
  Center,
  Flex,
  Heading,
  LinkBox,
  LinkOverlay,
  Spacer,
  Link,
  Box,
  Text,
} from "@chakra-ui/react";
import Head from "next/head";
import Image from "next/image";
import NextLink from "next/link";

import FollowDalnFooter from "~~/components/FollowDalnFooter";
import DataSubscriberOptionSvgComponent from "~~/components/svgComponents/DataSubscriberOptionSvgComponent";
import EndUserOptionSvgComponent from "~~/components/svgComponents/EndUserOptionSvgComponent";
interface StyledLinkBoxProps extends React.ComponentProps<typeof LinkBox> {
  children: React.ReactNode;
  href: string;
  isDisabled?: boolean;
}

const StyledLinkBox = ({
  href,
  children,
  isDisabled,
  ...rest
}: StyledLinkBoxProps) => {
  return (
    <LinkBox
      sx={{
        width: "full",
        borderRadius: "lg",
        boxShadow: "md",
        borderWidth: 1,
        borderColor: "rgba(0, 0, 0, 0.15)",
        cursor: "pointer",
        transition: "all 0.2s",
        backgroundColor: "#FFFFFF",
        "&:hover": {
          transform: "scale(1.05)",
        },
        "&:active": {
          transform: "scale(0.95)",
        },
        height: 340,
        alignItems: "center",
        justifyContent: "center",
        ...(isDisabled && {
          opacity: 0.5,
          cursor: "not-allowed",
          pointerEvents: "none",
        }),
      }}
      {...rest}
    >
      <NextLink href={href} passHref aria-disabled={isDisabled}>
        <LinkOverlay cursor={isDisabled ? "not-allowed" : "pointer"}>
          {children}
        </LinkOverlay>
      </NextLink>
    </LinkBox>
  );
};

const RoleOptionComponent = ({
  title,
  description,
  svgComponent,
}: {
  title: string;
  description: string;
  svgComponent?: React.ReactNode;
}) => {
  return (
    <Center height="100%">
      <Flex flex={1} height="100%">
        <Flex p={6} direction="column" flex={1}>
          <Heading size="lg">{title}</Heading>
          <Spacer />
          <Text fontSize="sm" color="#828282">
            {description}
          </Text>
        </Flex>
        <Center>
          <Box justifyContent="center">{svgComponent}</Box>
        </Center>
      </Flex>
    </Center>
  );
};

const Home = () => {
  return (
    <div
      style={{
        backgroundImage: `url(${`/Gradient.png`})`,
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
        backgroundSize: "cover",
      }}
    >
      <Head>
        <title>DALN</title>
      </Head>
      <Flex flex={1} height={"100vh"} direction={"column"}>
        <Flex padding={4}>
          <Spacer />
          {/* I dunno why the color is not matched here */}
          <Link color="primary.500" as={NextLink} href="/admin">
            DAO Admin
          </Link>
        </Flex>
        <Center height="100%">
          <Flex direction={"column"} alignItems="center" flex={1}>
            <Box>
              <Image
                src="/logo-title.png"
                alt="logo"
                quality={100}
                width={292}
                height={112}
              />
            </Box>
            <Text mt={4} mb={20} fontSize="xl">
              A data DAO for monetizing credit card transaction data
            </Text>
            <Flex w="full" maxW="4xl">
              <StyledLinkBox href="/user/dashboard" marginRight={10}>
                <RoleOptionComponent
                  title="End users"
                  description="Have true ownership of your data and get rewards whenever your data is decrypted"
                  svgComponent={<EndUserOptionSvgComponent />}
                />
              </StyledLinkBox>
              <StyledLinkBox href="/datasubscriber/onboarding/not-connected">
                <RoleOptionComponent
                  title="Data Subscribers"
                  description="Access valuable insights from rich consumer data without compromising data privacy"
                  svgComponent={<DataSubscriberOptionSvgComponent />}
                />
              </StyledLinkBox>
            </Flex>
            <Text color="#616161" mt={6}>
              Want to learn more?
            </Text>
          </Flex>
        </Center>
        <Spacer flex={1} />
        <FollowDalnFooter />
      </Flex>
    </div>
  );
};

export default Home;
