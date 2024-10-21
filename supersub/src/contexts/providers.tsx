import App from "../App";
import AppProvider from "./AppProvider";
import { config } from "utils/wagmi.ts";
import ModalProvider from "./ModalProvider";
import { WagmiProvider } from "@privy-io/wagmi";
import { PrivyProvider } from "@privy-io/react-auth";
import AccountDataProvider from "./AccountDataProvider";
import { BrowserRouter as Router } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export const Providers = () => {
  return (
    <>
      <PrivyProvider
        appId={`${import.meta.env.VITE_PRIVY_APP_ID}`}
        config={{
          mfa: {
            noPromptOnMfaRequired: false,
          },
          appearance: {
            theme: "dark",
            logo: `https://res.cloudinary.com/alphaglitch/image/upload/fl_preserve_transparency/v1717382435/icon512_maskable_ru2xyj.jpg`,
          },
          loginMethods: ["email"],
          embeddedWallets: {
            createOnLogin: "users-without-wallets",
            noPromptOnSignature: false,
          },
        }}
      >
        <QueryClientProvider client={queryClient}>
          <WagmiProvider config={config}>
            <AppProvider>
              <AccountDataProvider>
                <ModalProvider>
                  <Router>
                    <App />
                  </Router>
                </ModalProvider>
              </AccountDataProvider>
            </AppProvider>
          </WagmiProvider>
        </QueryClientProvider>
      </PrivyProvider>
    </>
  );
};

export default Providers;
