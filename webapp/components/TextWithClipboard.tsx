import {
  useClipboard,
  Text,
  IconButton,
  HStack,
  Tooltip,
} from "@chakra-ui/react";
import { IconCheck, IconCopy } from "@tabler/icons-react";
import { ComponentProps } from "react";

import { truncateWithEllipsis } from "~~/utils";

interface TextWithClipboardProps extends ComponentProps<typeof Text> {
  value: string;
  truncateMaxLength?: number;
  containerProps?: ComponentProps<typeof HStack>;
}

/**
 * Text component with a copy button and an option to truncate the text
 */
function TextWithClipboard({
  value,
  truncateMaxLength,
  containerProps,
  ...props
}: TextWithClipboardProps) {
  const { onCopy, hasCopied } = useClipboard(value);

  return (
    <>
      <HStack spacing={1} {...containerProps}>
        <Text title={value} {...props}>
          {truncateMaxLength
            ? truncateWithEllipsis(value, truncateMaxLength)
            : value}
        </Text>
        <Tooltip label={hasCopied ? "Copied!" : "Copy"}>
          <IconButton
            aria-label="Copy"
            onClick={onCopy}
            variant="unstyled"
            boxSize="auto"
            color="primary.500"
          >
            {hasCopied ? <IconCheck size={16} /> : <IconCopy size={16} />}
          </IconButton>
        </Tooltip>
      </HStack>
    </>
  );
}

export default TextWithClipboard;
