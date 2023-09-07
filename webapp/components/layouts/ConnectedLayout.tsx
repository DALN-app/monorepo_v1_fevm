import { ConnectButton } from "@rainbow-me/rainbowkit";

import OverlayOnboarding from "../OverlayUserConnectionCheck";

interface ConnectedLayoutProps {
  children: React.ReactNode;
}

const ConnectedLayout = ({ children }: ConnectedLayoutProps) => {
  return (
    <>
      <OverlayOnboarding />
      {children}
    </>
  );
};

export default ConnectedLayout;
