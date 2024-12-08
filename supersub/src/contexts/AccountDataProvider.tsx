import axios from "axios";
import dayjs from "dayjs";
import { useApp } from "contexts";
import { useBalance } from "wagmi";
import { formatUnits } from "viem";
import currencies from "constants/currencies";
import React, { useEffect, useMemo, useState } from "react";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import {
  Alchemy,
  OwnedToken,
  SortingOrder,
  OwnedNftsResponse,
  NftContractForNft,
  AssetTransfersCategory,
  GetTokensForOwnerResponse,
  AssetTransfersWithMetadataResponse,
} from "alchemy-sdk";
import { defaultChain, defaultNetwork } from "utils/wagmi";
import { ZeroAddress } from "ethers";
import { supportedTokens } from "constants/data";

export const alchemy = new Alchemy({
  network: defaultNetwork,
  apiKey: import.meta.env.VITE_ALCHEMY_API_KEY,
});

export default function AccountDataProvider(props: AccountDataProviderProps) {
  const { smartAddress } = useApp();
  const queryEnabled = useMemo(() => {
    return !!smartAddress;
  }, [smartAddress]);

  const [activeCurrency, setActiveCurrency] = useState(currencies[0]);

  const [txnSearch, setTxnSearch] = useState("");
  const [txnFilter, setTxnFilter] = useState<ITxnFilter>("all");

  const [ethPrices, setEthPrices] = useState<Record<string, number>>({});
  const [tokenPrices, setTokensBalances] = useState<ITokensBalances>({});
  const { data: rawEthBalance } = useBalance({
    address: smartAddress as `0x${string}`,
    chainId: defaultChain.id,
    query: {
      enabled: queryEnabled,
    },
  });

  const ethBalance = formatUnits(
    rawEthBalance?.value! || 0n,
    rawEthBalance?.decimals! || 18
  );

  // Fetch account tokens
  const acctTokens = useQuery<GetTokensForOwnerResponse>({
    enabled: queryEnabled,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    queryKey: ["acctTokens", smartAddress],
    queryFn: async () => {
      const tokens = await alchemy.core.getTokensForOwner(smartAddress!);
      const ethBalance = await alchemy.core.getBalance(smartAddress!);
      tokens["tokens"].push({
        contractAddress: ZeroAddress,
        name: "Ethereum",
        symbol: "ETH",
        decimals: 18,
        balance: formatUnits(ethBalance.toBigInt(), 18),
        logo: supportedTokens[ZeroAddress].image_url,
      });
      return tokens;
    },
  });

  // Fetch account txns
  const acctTxns = useQuery<AssetTransfersWithMetadataResponse>({
    enabled: queryEnabled,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    queryKey: ["acctTxns", smartAddress],
    queryFn: async () => {
      const fromTxns = await alchemy.core.getAssetTransfers({
        maxCount: 30,
        fromBlock: "0x0",
        withMetadata: true,
        excludeZeroValue: false,
        fromAddress: smartAddress,
        order: SortingOrder.DESCENDING,
        category: [
          AssetTransfersCategory.ERC20,
          AssetTransfersCategory.ERC721,
          AssetTransfersCategory.ERC1155,
          AssetTransfersCategory.INTERNAL,
          AssetTransfersCategory.EXTERNAL,
        ],
      });

      const toTxns = await alchemy.core.getAssetTransfers({
        maxCount: 30,
        fromBlock: "0x0",
        withMetadata: true,
        toAddress: smartAddress,
        excludeZeroValue: false,
        order: SortingOrder.DESCENDING,
        category: [
          AssetTransfersCategory.ERC20,
          AssetTransfersCategory.ERC721,
          AssetTransfersCategory.ERC1155,
          AssetTransfersCategory.INTERNAL,
          AssetTransfersCategory.EXTERNAL,
        ],
      });

      const sortedTxns = [...fromTxns.transfers, ...toTxns.transfers].sort(
        (a, b) => {
          return (
            dayjs(b?.metadata?.blockTimestamp).valueOf() -
            dayjs(a?.metadata?.blockTimestamp).valueOf()
          );
        }
      );

      return {
        transfers: sortedTxns,
      };
    },
  });

  // Filter txns based on search and filter
  const filteredTxns = useMemo(() => {
    if (!acctTxns.data?.transfers) return [];

    return acctTxns.data?.transfers.filter(
      (txn) =>
        (txnFilter === "all" ||
          (txnFilter === "sent" && txn.from === smartAddress?.toLowerCase()) ||
          (txnFilter === "received" &&
            txn.to === smartAddress?.toLowerCase())) &&
        (txnSearch === "" ||
          txn.from?.toLowerCase().includes(txnSearch.toLowerCase()) ||
          txn.to?.toLowerCase().includes(txnSearch.toLowerCase()) ||
          txn.hash?.toLowerCase().includes(txnSearch.toLowerCase()))
    );
  }, [acctTxns.data?.transfers, txnFilter, txnSearch]);

  // Get account balance
  const acctBalance = useMemo(() => {
    if (!acctTokens.data?.tokens) return { total: 0, tokens: 0 };

    const totalTokensBalance = acctTokens?.data?.tokens?.reduce(
      (acc, token) => {
        const price =
          tokenPrices[token.contractAddress]?.[activeCurrency?.slug] || 0;
        return acc + (token.balance ? price * Number(token.balance) : 0);
      },
      0
    );

    const totalEthBalance =
      totalTokensBalance + Number(ethBalance) * ethPrices[activeCurrency?.slug];

    return {
      total: isNaN(totalEthBalance) ? 0 : totalEthBalance,
      tokens: isNaN(totalTokensBalance) ? 0 : totalTokensBalance,
    };
  }, [ethPrices, tokenPrices, acctTokens?.data, activeCurrency]);

  // Fetch prices for tokens in ACTIVE CURRENCY
  useEffect(() => {
    const fetchPrices = async () => {
      if (!acctTokens.data?.tokens) return;
      const tokenAddresses = acctTokens.data.tokens.map(
        (token) => token.contractAddress
      );
      // .join("%2C");

      return;

      try {
        // comma separated currency slugs
        const currencySlugs = currencies.reduce((acc, curr) => {
          return acc + curr.slug + "%2C";
        }, "");

        const ethPrices = await axios
          .get(
            `https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=${currencySlugs}`
          )
          .then((res) => res.data.ethereum);

        setEthPrices(ethPrices);

        // fetch token prices
        const tokensBalancesReqs = tokenAddresses.map((address) => {
          return axios.get(
            `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${address}&vs_currencies=${currencySlugs}`
          );
        });

        const tokenPricesRes = await Promise.all(tokensBalancesReqs);
        const tokensBalancesArray = tokenPricesRes.map((res) => res.data);

        const tokenPrices = {} as ITokensBalances;
        tokensBalancesArray.forEach((res, index) => {
          tokenPrices[tokenAddresses[index]] = res[tokenAddresses[index]];
        });

        setTokensBalances(tokenPrices);
      } catch (error) {}
    };

    fetchPrices();
  }, [acctTokens?.data?.tokens]);

  return (
    <AccountDataContext.Provider
      value={{
        acctTxns,
        acctBalance,
        filteredTxns,

        ethPrices,
        ethBalance,
        tokenPrices,
        activeCurrency,
        acctTokens: acctTokens.data?.tokens || [],
      }}
    >
      {props.children}
    </AccountDataContext.Provider>
  );
}

interface IAcctBalance {
  total: number;
  tokens: number;
}

type ITokenBalance = {
  [token: string]: number;
};

type ITokensBalances = {
  [address: string]: ITokenBalance;
};

export interface ICollection {
  contract: NftContractForNft["openSeaMetadata"];
  nfts: OwnedNftsResponse["ownedNfts"];
}

export type ITxnFilter = "all" | "sent" | "received" | "minted";

interface AccountDataContext {
  activeCurrency: (typeof currencies)[number];

  ethBalance: string;
  acctTokens: OwnedToken[];
  acctBalance: IAcctBalance;
  tokenPrices: ITokensBalances;
  ethPrices: Record<string, number>;
  acctTxns: UseQueryResult<AssetTransfersWithMetadataResponse>;
  filteredTxns: AssetTransfersWithMetadataResponse["transfers"];
}

export const AccountDataContext = React.createContext({} as AccountDataContext);

type AccountDataProviderProps = {
  children: React.ReactNode;
};
