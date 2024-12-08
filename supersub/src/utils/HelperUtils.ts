import { getAddress } from "ethers";
import { isAddress } from "viem";

/**
 * Check if a string is a valid URL
 */
export const isValidUrl = (urlString: string) => {
  var urlPattern = new RegExp(
    "^(https?:\\/\\/)?" + // validate protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // validate domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // validate OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // validate port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // validate query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  ); // validate fragment locator
  return !!urlPattern.test(urlString);
};

/**
 * Truncates string (in the middle) via given lenght value
 */
export function truncate(value?: string, length = 13) {
  if (!value) {
    return value;
  }
  if (value?.length <= length) {
    return value;
  }

  const separator = "...";
  const stringLength = length - separator.length;
  const frontLength = Math.ceil(stringLength / 2);
  const backLength = Math.floor(stringLength / 2);

  return (
    value.substring(0, frontLength) +
    separator +
    value.substring(value.length - backLength)
  );
}

/**
 * Extracts Ethereum address from a string
 */
export function extractEthAddress(inputString: string) {
  const ethAddressRegex = /0x[a-fA-F0-9]{40}/;
  const match = inputString.match(ethAddressRegex);
  return match ? match[0] : "";
}

/**
 * Gets significant digits from a number string
 * @param numStr
 * @returns
 */
export function getSignificantDigits(
  numStr: string,
  maxPrecision = 5,
  minPrecision = 2
) {
  // Remove any whitespace
  numStr = numStr.trim();

  // Validate min/max precision
  if (minPrecision < 0 || maxPrecision < minPrecision) {
    throw new Error("Invalid precision parameters");
  }

  // Remove whitespace and validate input
  const cleanStr = numStr.trim();
  if (!/^-?\d*\.?\d+$/.test(cleanStr)) {
    throw new Error("Invalid number format");
  }

  // Handle negative numbers
  const isNegative = cleanStr.startsWith("-");
  const absStr = isNegative ? cleanStr.slice(1) : cleanStr;

  // Split into integer and decimal parts
  const [intPart, decPart = ""] = absStr.split(".");

  // Format decimal part: pad with zeros if needed and trim to max precision
  let formattedDecimal = (decPart + "0".repeat(maxPrecision))
    .slice(0, maxPrecision)
    .replace(/0+$/, ""); // Remove trailing zeros

  // Add zeros back if needed to meet minimum precision
  if (formattedDecimal.length < minPrecision) {
    formattedDecimal =
      formattedDecimal + "0".repeat(minPrecision - formattedDecimal.length);
  }

  // Handle integer part, removing leading zeros except for zero itself
  const integerPart = intPart === "0" ? "0" : intPart.replace(/^0+/, "");

  // Combine parts
  const result = formattedDecimal
    ? `${integerPart}.${formattedDecimal}`
    : minPrecision > 0
      ? `${integerPart}.${"0".repeat(minPrecision)}`
      : integerPart;

  return (isNegative ? "-" : "") + result;
}

export function getTokenImageFromTrustWallet(chain: string, addr: string) {
  const chainMapping: Record<string, string> = {
    bsc: "smartchain",
    eth: "ethereum",
    polygon: "polygon",
    avalanche: "avalanchec",
    arbitrum: "arbitrum",
    fantom: "fantom",
    optimism: "optimism",
  };

  const checkSumAddr = getAddress(addr);
  return `https://assets-cdn.trustwallet.com/blockchains/${chainMapping[chain]}/assets/${checkSumAddr}/logo.png`;
}

export function formatTimeInterval(seconds: number): string {
  type TimeUnit = {
    value: number;
    unit: string;
    threshold: number;
    conversion: number;
  };

  const timeUnits: TimeUnit[] = [
    {
      value: 31556952,
      unit: "year",
      threshold: Infinity,
      conversion: 31556952,
    },
    { value: 2629746, unit: "month", threshold: 12, conversion: 2629740 },
    { value: 604800, unit: "week", threshold: 4.34524, conversion: 604800 },
    { value: 86400, unit: "day", threshold: 7, conversion: 86400 },
    { value: 3600, unit: "hour", threshold: 24, conversion: 3600 },
    { value: 60, unit: "minute", threshold: 60, conversion: 60 },
    { value: 1, unit: "second", threshold: 60, conversion: 1 },
  ];
  if (seconds < 0) throw new Error("Time interval cannot be negative");
  if (!Number.isFinite(seconds))
    throw new Error("Time interval must be finite");

  // Handle special cases
  if (seconds === 0) return "0 seconds";
  if (seconds < 1) return `${(seconds * 1000).toFixed(0)} milliseconds`;

  for (let i = 0; i < timeUnits.length; i++) {
    const unit = timeUnits[i];
    const nextUnit = timeUnits[i + 1];

    const value = seconds / unit.conversion;

    // Check if this is the appropriate unit
    if (value >= 1) {
      // If there's no next unit, or if using the next unit would result in a value less than 1
      // or if using this unit gives us a cleaner representation
      if (
        !nextUnit ||
        seconds / nextUnit.conversion < 1 ||
        value < unit.threshold
      ) {
        const roundedValue = Math.round(value * 100) / 100;
        return `${roundedValue} ${unit.unit}${roundedValue === 1 ? "" : "s"}`;
      }
    }
  }

  // This should never be reached due to the second entry
  const roundedSeconds = Math.round(seconds);
  return `${roundedSeconds} second${roundedSeconds === 1 ? "" : "s"}`;
}

/**
 * Gets data from various signTypedData request methods by filtering out
 * a value that is not an address (thus is data).
 * If data is a string convert it to object
 */
export function getSignTypedDataParamsData(params: string[]) {
  const data = params.filter((p) => isAddress(p))[0];

  if (typeof data === "string") {
    return JSON.parse(data);
  }

  return data;
}

/**
 * Get our address from params checking if params string contains one
 * of our wallet addresses
 */
export function getWalletAddressFromParams(addresses: string[], params: any) {
  const paramsString = JSON.stringify(params);
  let address = "";

  addresses.forEach((addr) => {
    if (paramsString.includes(addr)) {
      address = addr;
    }
  });

  return address;
}
