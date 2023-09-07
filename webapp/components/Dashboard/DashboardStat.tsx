import {
  Card,
  CardBody,
  LinkBox,
  LinkOverlay,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
} from "@chakra-ui/react";

interface DashboardItemProps {
  label: string;
  helpText?: string;
  number: string;
  href?: string;
  isExternalHref?: boolean;
}

export default function DashboardItem({
  label,
  helpText,
  number,
  href,
  isExternalHref = false,
}: DashboardItemProps) {
  return (
    <Card
      display="flex"
      justifyContent="center"
      alignItems="center"
      variant="outline"
      as={LinkBox}
    >
      <CardBody textAlign="center">
        <Stat>
          <StatLabel>{label}</StatLabel>
          <LinkOverlay href={href} isExternal={isExternalHref}>
            <StatNumber display="inline-block">{number}</StatNumber>
          </LinkOverlay>
          {helpText && (
            <StatHelpText display="inline-block" ml={1}>
              {helpText}
            </StatHelpText>
          )}
        </Stat>
      </CardBody>
    </Card>
  );
}
