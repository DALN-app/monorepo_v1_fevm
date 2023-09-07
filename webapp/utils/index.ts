export function truncateWithEllipsis(
  input: string,
  maxLengthPerSide: number
): string {
  if (input.length <= maxLengthPerSide * 2) {
    return input;
  }

  const leftSide = input.slice(0, maxLengthPerSide);
  const rightSide = input.slice(-maxLengthPerSide);
  return `${leftSide}...${rightSide}`;
}
