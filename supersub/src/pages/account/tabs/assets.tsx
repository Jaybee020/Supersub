import millify from "millify";
import { useAccountData } from "contexts";
import { Coin } from "@phosphor-icons/react";
import { supportedTokens } from "constants/data";

const AccountAssets = () => {
  const { activeCurrency, acctTokens, tokenPrices } = useAccountData();

  return (
    <div className="account-tabs--assets">
      <div className="account-tabs--assets__header">
        <p>Asset</p>
        <p>Value</p>
      </div>

      <div className="account-tabs--assets__body">
        {acctTokens?.length === 0 ? (
          <p
            style={{
              width: "100%",
              color: "#bbb",
              fontSize: "14px",
              lineHeight: "1.5",
              textAlign: "center",
              padding: "40px 0 0px",
            }}
          >
            You have no assets in your account. <br />
            Go to the Transfer tab to send or receive assets.
          </p>
        ) : (
          acctTokens?.map((token, index) => {
            const tokenPrice =
              tokenPrices[token.contractAddress]?.[activeCurrency?.slug];
            const tokenBalance = tokenPrice * Number(token.balance);

            if (Number(token.balance) === 0) return null;

            return (
              <div key={index} className="acct-asset">
                <div className="acct-asset__block">
                  <div className="asset-icon">
                    {token.logo ||
                    supportedTokens[
                      token.contractAddress as keyof typeof supportedTokens
                    ]?.image_url ? (
                      <img
                        src={
                          token.logo ??
                          supportedTokens[
                            token.contractAddress as keyof typeof supportedTokens
                          ]?.image_url
                        }
                        alt=""
                      />
                    ) : (
                      <Coin size={20} />
                    )}
                  </div>

                  <div className="acct-asset__details">
                    <p className="main">{token.name}</p>
                    <p className="sub">
                      {!isNaN(Number(tokenPrice))
                        ? activeCurrency?.symbol +
                          (Number(tokenPrice) > 1000
                            ? millify(Number(tokenPrice), { precision: 2 })
                            : Number(tokenPrice).toFixed(2))
                        : activeCurrency?.symbol + "0.00"}
                    </p>
                  </div>
                </div>

                <div className="acct-asset__details flex-end">
                  <p className="main">
                    {!isNaN(Number(token.balance))
                      ? Number(token.balance) > 1000
                        ? millify(Number(token.balance), { precision: 2 })
                        : Number(token.balance).toFixed(2)
                      : ""}
                  </p>

                  <p className="sub">
                    {activeCurrency?.symbol}
                    {!isNaN(Number(tokenBalance))
                      ? millify(Number(tokenBalance), {
                          precision: 2,
                        })
                      : "0.00"}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AccountAssets;
