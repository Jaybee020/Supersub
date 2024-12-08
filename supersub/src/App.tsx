import { Toaster } from "sonner";
import { useApp } from "contexts";
import { Route, Routes } from "react-router-dom";

import Auth from "pages/auth/auth";
import Tabs from "pages/tabs/tabs";
import Subs from "pages/subs/subs";
import Account from "pages/account/account";
import Products from "pages/product/product";
import Settings from "pages/settings/settings";
import Transfer from "pages/transfer/transfer";
import AppLoader from "components/app/appLoader";
import AccountAssets from "pages/account/tabs/assets";
import AccountHistory from "pages/account/tabs/history";
import {
  CheckCircle,
  Info,
  WarningCircle,
  XCircle,
} from "@phosphor-icons/react";
import Pay from "pages/pay/pay";
import { ReceiptInfo } from "pages/receipt/receipt";
import Product from "pages/productDetails/productDetails";

function App() {
  const { ready, authenticated, isMfaEnabled, isSmartAccountReady } = useApp();

  return (
    <>
      <main>
        {!ready || (ready && authenticated && !isSmartAccountReady) ? (
          <AppLoader
            message={
              ready && authenticated && !isSmartAccountReady
                ? "Fetching Smart Wallet..."
                : ""
            }
          />
        ) : (
          <div className="page-content">
            <Routes>
              {authenticated && isMfaEnabled ? (
                <>
                  <Route path="/subscribe" element={<Pay />} />
                  <Route path="/transaction" element={<ReceiptInfo />} />
                  <Route path="/product" element={<Product />} />

                  <Route path="/" element={<Tabs />}>
                    <Route path="/" element={<Account />}>
                      <Route path="/" element={<AccountAssets />} />
                      <Route path="/history" element={<AccountHistory />} />
                    </Route>
                    <Route path="/subs" element={<Subs />} />
                    <Route path="/transfer" element={<Transfer />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/settings" element={<Settings />} />
                  </Route>
                </>
              ) : (
                <>
                  <Route path="/subscribe" element={<Pay />} />
                  <Route path="/transaction" element={<ReceiptInfo />} />
                  <Route path="/product" element={<Product />} />

                  <Route path="/*" element={<Auth />} />
                </>
              )}
            </Routes>
          </div>
        )}
      </main>

      <Toaster
        theme="dark"
        position="top-center"
        className="toast-block"
        icons={{
          info: <Info size={16} weight="fill" color="#eba267" />,
          error: <XCircle size={16} weight="fill" color="#ff5c5c" />,
          success: <CheckCircle size={18} weight="fill" color="#16f19d" />,
          warning: <WarningCircle size={16} weight="fill" color="#eba267" />,
        }}
      />
    </>
  );
}

export default App;
