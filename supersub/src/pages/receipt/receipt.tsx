import "./receipt.scss";
import "../pay/pay.scss";
import { useState } from "react";
import { Coins, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { getPlatform, ITransactionType } from "pages/account/tabs/history";
import { formatUnits, getAddress, isAddress } from "ethers";
import { supportedChains, supportedTokens } from "constants/data";
import { useQuery } from "@tanstack/react-query";
import { useApp } from "contexts";
import axios from "axios";
import { defaultChain } from "utils/wagmi";
import EmptyState from "components/common/empty-state";
import { Infinity } from "@phosphor-icons/react";
import WalletIcon from "components/common/wallet-icon";
import { formatTimeInterval, getSignificantDigits } from "utils/HelperUtils";

export function getNarration(narration: string) {
  if (narration.includes("Subscription fee")) {
    return "Subscription fee charged";
  } else if (narration.includes("Recurring payment")) {
    return "Recurring payment made";
  }
}

export const ReceiptInfo = () => {
  const [showDetails, setShowDetails] = useState(false);
  const { params, smartAddress } = useApp();
  const txnReference = params?.["reference"];

  const { data, isLoading, error } = useQuery<ITransactionType>({
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
    enabled: !!params?.["reference"],
    queryKey: ["transaction", params?.["reference"]],
    queryFn: async () => {
      return await axios
        .get(`/api/transaction/${txnReference}`)
        .then((res) => res?.data?.data?.transaction);
    },
  });

  const formatTime = (dateString: string | number | Date) => {
    const time = new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
    //add Today if date is today
    if (new Date(dateString).toDateString() === new Date().toDateString()) {
      return `Today at ${time}`;
    }
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatExpiryDate = (dateString: string | number | Date) => {
    const date = new Date(dateString);
    if (date.getFullYear() > 2099) return "Indefinite";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const truncateAddress = (address?: string | any[]) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const chain = supportedChains[data?.chainId as number];

  return (
    <>
      {!data || error || isLoading ? (
        <EmptyState
          error={!error}
          isLoading={isLoading}
          data={{
            message: "Transaction Not Found",
            loadingText: "Fetching Transaction details...",
            errorMessage:
              error?.message || "An error occurred while fetching transaction",
          }}
        />
      ) : (
        <div className="payment-preview">
          <div className="tabs-header">
            <div className="tabs-header__logo">
              <Infinity size={54} weight="light" />
              <p>Super Sub</p>
            </div>
            <div className="bricks">
              {Array.from({ length: 3 }).map((item, index) => {
                return <div key={index} className="bricks-block" />;
              })}
              <div className="version">
                <img src={supportedChains[defaultChain.id].image_url} alt="" />
              </div>
              <div className="indicator" />
            </div>
          </div>
          <div className="receipt-container">
            <div className="receipt-container__content">
              {/* Amount */}
              <div className="receipt-amount">
                {/* {smartAddress && (
                  <span className="receipt-amount__value">
                    {data.type === "WITHDRAWAL" ? "SENT" : "RECEIVED"}
                  </span>
                )} */}
                {data?.token?.logoUrl ||
                supportedTokens[getAddress(data.tokenAddress)].image_url ? (
                  <img
                    src={
                      data?.token?.logoUrl ||
                      supportedTokens[getAddress(data.tokenAddress)].image_url
                    }
                    alt={data.token.symbol}
                    className="receipt-amount__icon"
                  />
                ) : (
                  <Coins className="receipt-amount__icon receipt-amount__icon--coin" />
                )}
                <span className="receipt-amount__value">
                  {getSignificantDigits(
                    formatUnits(data.amount, data.token.decimals)
                  )}{" "}
                  {data.token.symbol}
                </span>
              </div>

              {/* Details */}

              <div className="receipt-details">
                <div className="receipt-details__row">
                  <span className="receipt-details__label">Status</span>
                  <span
                    className={`receipt-details__value receipt-details__value--${data.status === "SUCCESS" ? "success" : "error"}`}
                  >
                    {data.status}
                  </span>
                </div>

                {/* In the Details section, modify the transaction parties display */}
                {
                  // If no smart address, show both From and To
                  <>
                    <div className="receipt-details__row">
                      <span className="receipt-details__label">From</span>
                      <div className="receipt-details__value receipt-details__value--product">
                        {isAddress(data.sender) ? (
                          <WalletIcon address={data.sender || ""} size={20} />
                        ) : (
                          <img
                            src={
                              isAddress(getPlatform(data))
                                ? "https://asset.brandfetch.io/idVfYwcuQz/id8hkaZwOR.png"
                                : data.subscription.product.logoUrl
                            }
                            alt={getPlatform(data)}
                          />
                        )}
                        <span>
                          {isAddress(data.sender)
                            ? truncateAddress(data.sender)
                            : getPlatform(data)}
                        </span>
                      </div>
                    </div>
                    <div className="receipt-details__row">
                      <span className="receipt-details__label">To</span>
                      <div className="receipt-details__value receipt-details__value--product">
                        {isAddress(getPlatform(data)) ? (
                          <WalletIcon
                            address={data.recipient || ""}
                            size={20}
                          />
                        ) : (
                          <img
                            src={
                              isAddress(getPlatform(data))
                                ? "https://asset.brandfetch.io/idVfYwcuQz/id8hkaZwOR.png"
                                : data.subscription.product.logoUrl
                            }
                            alt={getPlatform(data)}
                          />
                        )}

                        <span>
                          {isAddress(getPlatform(data))
                            ? truncateAddress(data.recipient)
                            : getPlatform(data)}
                        </span>
                      </div>
                    </div>
                  </>
                }
                {
                  <div className="receipt-details__row">
                    <span className="receipt-details__label">Narration</span>
                    <span className="receipt-details__value">
                      {getNarration(data.narration)}
                    </span>
                  </div>
                }

                {data.subscription.product.type == "SUBSCRIPTION" && (
                  <div className="receipt-details__row">
                    <span className="receipt-details__label">Beneficiary</span>

                    <div className="receipt-details__value receipt-details__value--product">
                      {isAddress(data.subscription.beneficiaryAddress) ? (
                        <WalletIcon
                          address={data.subscription.beneficiaryAddress || ""}
                          size={20}
                        />
                      ) : (
                        <img
                          src={
                            isAddress(getPlatform(data))
                              ? "https://asset.brandfetch.io/idVfYwcuQz/id8hkaZwOR.png"
                              : data.subscription.product.logoUrl
                          }
                          alt={getPlatform(data)}
                        />
                      )}
                      <span>
                        {isAddress(data.subscription.beneficiaryAddress)
                          ? truncateAddress(
                              data.subscription.beneficiaryAddress
                            )
                          : getPlatform(data)}
                      </span>
                    </div>
                  </div>
                )}

                {(data.narration.includes("Subscription ") ||
                  data.narration.includes("Recurring payment")) && (
                  <div className="receipt-details__row">
                    <span className="receipt-details__label">Plan Info</span>
                    <span className="receipt-details__value">
                      <p>
                        {getSignificantDigits(
                          formatUnits(
                            data.subscription.plan.price,
                            data.subscription.plan?.token?.decimals
                          )
                        )}{" "}
                        {data.subscription.plan?.token?.symbol} For{" "}
                        {/*
                         * FORMAT TIMEFRAMES
                         */}
                        {`${formatTimeInterval(data.subscription.plan.chargeInterval)}`}
                      </p>
                    </span>
                  </div>
                )}

                <div className="receipt-details__row">
                  <span className="receipt-details__label">
                    Transaction Date
                  </span>
                  <span className="receipt-details__value">
                    {formatTime(data.createdAt)}
                  </span>
                </div>
              </div>

              {/* Expandable Details */}
              {showDetails && (
                <div className="receipt-expandable">
                  <div className="receipt-details__row">
                    <span className="receipt-details__label">Chain</span>
                    <div className="receipt-expandable__chain">
                      <img src={chain.image_url} alt={chain.chain_name} />
                      <span>{chain.chain_name}</span>
                    </div>
                  </div>

                  <div className="receipt-details__row">
                    <span className="receipt-details__label">
                      Transaction Hash
                    </span>
                    <a
                      href={`${chain.scan_url}/tx/${data.onchainReference.split(":")[1]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="receipt-expandable__hash-link"
                    >
                      <span className="mono">
                        {truncateAddress(data.onchainReference.split(":")[1])}
                      </span>
                      <ExternalLink />
                    </a>
                  </div>

                  <div className="receipt-details__row">
                    <span className="receipt-details__label">
                      Request Reference
                    </span>
                    <p className="receipt-expandable__reference">
                      {truncateAddress(data.requestReference)}
                    </p>
                  </div>
                  <div className="receipt-details__row">
                    <span className="receipt-details__label">
                      Subscription ends at
                    </span>
                    <span className="receipt-details__value">
                      {formatExpiryDate(data.subscription.subscriptionExpiry)}
                    </span>
                  </div>
                </div>
              )}

              {/* Toggle Button */}
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="receipt-toggle"
              >
                {showDetails ? <ChevronUp /> : <ChevronDown />}
                <span>{showDetails ? "Show Less" : "More Info"}</span>
              </button>

              {/* Footer */}
              <div className="receipt-footer">
                <img
                  src="https://framerusercontent.com/images/BQGOer1CxYU3t6tiGVPvxkOyi2E.svg?scale-down-to=512"
                  alt="Request Logo"
                  className="receipt-footer__logo"
                />
                <span className="receipt-footer__text">Powered by Request</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
