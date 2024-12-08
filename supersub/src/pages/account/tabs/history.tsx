import { useState } from "react";
import Searchbar from "components/common/searchbar";
import { ArrowDown, ArrowUp, ArrowUpRight } from "@phosphor-icons/react";
import WalletIcon from "components/common/wallet-icon";
import { useQuery } from "@tanstack/react-query";
import { getAccessToken } from "@privy-io/react-auth";
import axios from "axios";
import { defaultChain } from "utils/wagmi";
import { useApp } from "contexts";
import EmptyState from "components/common/empty-state";
import { formatDate } from "date-fns";
import dayjs from "dayjs";
import { formatUnits, parseUnits } from "viem";
import { isAddress } from "ethers";
import { chain, truncate } from "lodash";

export interface ITransactionType {
  narration: string;
  recipient: string;
  subscriptionOnchainReference: string;
  tokenOnchainReference: string;
  onchainReference: string;
  requestReference: string;
  amount: string;
  sender: string;
  tokenAddress: string;
  type: string;
  status: string;
  createdAt: Date;
  chainId: number;
  subscription: ISubscription;
  token: { symbol: string; decimals: number; logoUrl: string };
}

export interface IProduct {
  id: number;
  name: string;
  description: string;
  logoUrl: string;
  type: string;
  onchainReference: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  chainId: number;
  creatorAddress: string;
}

export interface IPlan {
  id: number;
  onchainReference: string;
  price: string;
  token: { symbol: string; decimals: number; logoUrl: string };
  chargeInterval: number;
  isActive: boolean;
  receivingAddress: string;
  product: IProduct;
  destinationChain: number;
}

export interface ISubscription {
  id: number;
  onchainReference: string;
  subscriptionExpiry: string;
  lastChargeDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  chainId: number;
  creatorAddress: string;
  planOnchainReference: string;
  productOnchainReference: string;
  subscriberAddress: string;
  beneficiaryAddress: string;
  paymentTokenAddress: string;
  paymentTokenOnchainReference: string;
  product: IProduct;
  plan: IPlan;
}

//use includes instead of ===
export const getPlatform = (txn: ITransactionType) => {
  if (txn.narration.includes("Subscription fee charged")) {
    return txn.subscription.product.name;
  } else if (txn.narration.includes("Recurring payment made to")) {
    return txn.recipient;
  } else if (txn.narration.includes("Subscription fee received")) {
    return txn.subscription.product.name;
  } else if (txn.narration.includes("Recurring payment received")) {
    return txn.sender;
  } else if (txn.narration.includes("Withdrawal")) {
    return txn.recipient;
  } else if (txn.narration.includes("Deposit")) {
    return txn.sender;
  }
};

const AccountHistory = () => {
  const [searchTxn, searchTxns] = useState("");
  const { smartAddress } = useApp();

  const { data, isLoading, error } = useQuery({
    enabled: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
    queryKey: ["acctProducts", smartAddress],
    queryFn: async () => {
      const token = await getAccessToken();
      return await axios
        .get(`/api/transactions`, {
          params: {
            chainId: defaultChain.id,
            address: smartAddress,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) =>
          res?.data?.data?.transactions.map((txn: ITransactionType) => {
            return {
              txnType: txn.type,
              icon:
                txn.type == "WITHDRAWAL" ? (
                  <ArrowUp size={16} weight="regular" />
                ) : (
                  <ArrowDown size={16} color="green" weight="regular" />
                ),
              //if created at is on the same day as today, show time, else show date
              date: dayjs(txn.createdAt).isSame(dayjs(), "day")
                ? dayjs(txn.createdAt).format("h:mm A")
                : dayjs(txn.createdAt).format("MMM DD, YYYY"),
              transactionType: txn.narration.slice(0, 25),
              transactionHash: txn.onchainReference.split(":")[1],
              chainId: txn.chainId,
              platform: truncate(getPlatform(txn), { length: 17 }),
              amount: `${formatUnits(BigInt(txn.amount), txn.token.decimals)} ${
                txn.token.symbol
              }`,
              address: isAddress(getPlatform(txn))
                ? getPlatform(txn)
                : undefined,
              iconUrl: isAddress(getPlatform(txn)) ? (
                <WalletIcon address={getPlatform(txn) || ""} size={20} />
              ) : (
                <img src={txn.subscription.product.logoUrl} alt="" />
              ), //TODO: Make deynamic based on address.
            };
          })
        )
        .catch((err) => {
          console.log(err);
        });
    },
  });

  return (
    <div className="account-tabs--history">
      <div className="account-tabs--history__filters">
        <Searchbar
          value={searchTxn}
          onChange={searchTxns}
          placeholder="Name, Token, ID..."
        />
      </div>

      {!data || error || isLoading || data?.length === 0 ? (
        <>
          <EmptyState
            error={error}
            isLoading={isLoading}
            data={{
              message: "No transactions found",
              loadingText: "Loading transactions...",
              errorMessage: "An error occurred while fetching transactions",
            }}
          />
        </>
      ) : (
        <div className="acct-history">
          {[
            {
              date: "May 10, 2024",
              items: data,
            },
          ].map((item, index) => {
            return (
              <div key={index} className="history-group">
                {/* <div className="history-group__header">
                  <p>{item.date}</p>
                </div> */}

                <div className="history-group__items">
                  {item.items.map((item: any, index: any) => {
                    return (
                      <div key={index} className="history-item">
                        <div className="r-block">
                          <div className="details-block">
                            <div
                              className="details-block--icon"
                              style={{
                                borderColor:
                                  item.txnType === "WITHDRAWAL"
                                    ? "#ff5c5c"
                                    : "#0A9B63",
                              }}
                            >
                              {item.icon}
                            </div>

                            <div className="details-block--info">
                              <p className="main">{item.amount}</p>
                              <p className="sub">{item.date}</p>
                            </div>
                          </div>

                          <div className="details-block">
                            <div className="details-block--icon no-border">
                              {item?.address ? (
                                <WalletIcon address={item.address} size={28} />
                              ) : (
                                item.iconUrl
                              )}
                            </div>

                            <div className="details-block--info">
                              <p className="main">{item.platform}</p>
                              <p className="sub">{item.transactionType}</p>
                            </div>
                          </div>

                          <div className="explorer-link">
                            <a
                              target="blank"
                              href={`/transaction?reference=${item.chainId}:${item.transactionHash}`}
                            >
                              <ArrowUpRight size={16} weight="regular" />
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AccountHistory;
