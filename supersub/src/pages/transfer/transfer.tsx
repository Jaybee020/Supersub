import "./transfer.scss";
import dayjs from "dayjs";
import { toast } from "sonner";
import { useApp } from "contexts";
import useAppMenu from "hooks/useMenu";
import { useMemo, useState } from "react";
import { timeframes } from "constants/subs";
import { ClipLoader } from "react-spinners";
import { isAddress, parseUnits } from "viem";
import { truncate } from "utils/HelperUtils";
import useAppObjMenu from "hooks/useAppObjMenu";
import WalletIcon from "components/common/wallet-icon";
import DateSelector from "components/common/date-selector";
import { supportedChains, supportedTokens } from "constants/data";
import {
  CaretDown,
  CopySimple,
  CheckCircle,
  CaretDoubleRight,
  ArrowsIn,
  EscalatorUp,
} from "@phosphor-icons/react";
import { defaultChain, defaultToken } from "utils/wagmi";

//change default tokens and chains and images
const Transfer = () => {
  const { createRecurringPayment, transferFunds, smartAddress } = useApp();

  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [destination, setDestination] = useState("");
  const [isRecurring, setIsrecurring] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    dayjs().add(1, "day").toDate()
  );

  // COPY ADDRESS
  const [copied, setCopied] = useState(false);
  const copyAddress = (addr = smartAddress) => {
    setCopied(true);
    navigator.clipboard.writeText(addr!);
    setTimeout(() => setCopied(false), 1100);
  };

  const [interval, setInterval] = useState("");

  const [chargeToken, setChargeToken] = useState(supportedTokens[defaultToken]);
  const [destinationChain, setDestinationChain] = useState(
    supportedChains[defaultChain.id]
  );

  const [TokenMenu, selectedToken] = useAppObjMenu({
    uppercase: true,
    objecKey: "symbol",
    toggleCallback: (val) => setChargeToken(val),
    items: Object.values(supportedTokens),
    defaultOption: supportedTokens[defaultToken],
  });

  const [ChainMenu, selectedChain] = useAppObjMenu({
    uppercase: false,
    objecKey: "chain_name",
    menuClass: "chain-menu",
    items: Object.values(supportedChains),
    defaultOption: supportedChains[defaultChain.id],
    toggleCallback: (value) => setDestinationChain(value),
  });

  const [TimeframeMenu, timeframe] = useAppMenu({
    align: "end",
    uppercase: false,
    menuClass: "chain-menu",
    toggleCallback: () => {},
    defaultOption: timeframes[0],
    items: timeframes.map((chain) => chain),
  });

  const paymentData = useMemo(() => {
    return {
      recipient: destination as `0x${string}`,
      destinationChain: destinationChain.chain_id,
      chargeToken: chargeToken.address as `0x${string}`,
      price: Number(parseUnits(amount || "", chargeToken.decimals)),
      endTime: dayjs(selectedDate).unix() || dayjs().add(1, "day").unix(),
      chargeInterval:
        Number(interval) *
        (timeframe === "days"
          ? 86400
          : timeframe === "weeks"
            ? 604800
            : timeframe === "months"
              ? 2629743
              : timeframe === "years"
                ? 31556926
                : 0),
    };
  }, [amount, chargeToken, destination, interval, selectedDate, timeframe]);

  const sendFunds = async () => {
    if (loading) return;

    if (!isAddress(destination)) {
      toast.error("Invalid recipient address");
      return;
    }

    if (amount.trim() === "") {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!chargeToken) {
      toast.error("Please select a charge token");
      return;
    }

    if (interval.trim() === "" && isRecurring) {
      toast.error("Please enter an interval");
      return;
    }

    setLoading(true);
    try {
      // TRANSFER FUNDS
      if (!isRecurring) {
        const hash = await transferFunds(
          Number(parseUnits(amount, chargeToken.decimals)),
          paymentData.chargeToken,
          destination,
          destinationChain.chain_selector,
          destinationChain.chain_id !== defaultChain.id
        );

        // SUCCESSFUL TRANSFER
        toast.success("Funds transferred successfully", {
          description: `Transaction hash: ${hash}`,
        });
      } else {
        // CREATE RECURRING PAYMENT
        const hash = await createRecurringPayment({
          initPlan: {
            price: paymentData.price,
            chargeInterval: paymentData.chargeInterval,
            tokenAddress: paymentData.chargeToken,
            receivingAddress: paymentData.recipient,
            destinationChain: paymentData.destinationChain,
          },
          endTime: paymentData.endTime,
          // paymentToken: paymentData.paymentToken,
          // paymentTokenSwapFee: paymentData.paymentTokenSwapFee,
          // description: paymentData.description,
        });

        // SUCCESSFUL CREATED RECURRING PAYMENT
        toast.success("Recurring payment created successfully", {
          description: `Transaction hash: ${hash}`,
        });
      }

      // RESET FORM
      setAmount("");
      setInterval("");
      setDestination("");
      setSelectedDate(dayjs().add(1, "day").toDate());
    } catch (error: any) {
      toast.error(
        `Failed to ${isRecurring ? "create recurring payment" : "transfer funds"}` +
          (error?.details && !isRecurring
            ? " with error code " + JSON.parse(error?.details)?.code
            : ""),
        {
          description: error?.details
            ? JSON.parse(error?.details)?.message
            : undefined,
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const onRamp = () => {
    toast.message("Coming soon...");
  };

  return (
    <div className="base-page transfer">
      <div className="base-page__header">
        <h2>Send and Receive</h2>
        <p>Copy your address to make deposits, create recurring payments</p>
      </div>

      <div className="base-page__body">
        <div className="transfer-block">
          <div className="r-block">
            <div className="details-block">
              <WalletIcon size={30} address="0x1" />

              <div className="details-block--info">
                <p className="sub no-transform">
                  Copy address to deposit funds
                </p>
                <p className="main">{truncate(smartAddress, 16)}</p>
              </div>
            </div>

            <div className="copy-btn">
              <button onClick={() => copyAddress()}>
                {copied ? (
                  <CheckCircle size={18} weight="fill" color="#0ecb81" />
                ) : (
                  <CopySimple size={18} weight="regular" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div
          onClick={() => onRamp()}
          className={`base-btn`}
          style={{ width: "220px", alignSelf: "center", height: "45px" }}
        >
          <p>Fund from bank</p>

          {!loading && (
            <div className="base-btn__icon">
              <EscalatorUp size={15} weight="bold" />
            </div>
          )}

          {loading && (
            <div className="c-spinner">
              <ClipLoader
                size={16}
                color={"#fff"}
                loading={loading}
                aria-label="Loading Spinner"
              />
            </div>
          )}
        </div>

        <div className="withdrawal-header" style={{ marginTop: "10px" }}>
          <p>Transfer</p>
        </div>

        <div
          style={{
            padding: "6px 14px",
          }}
          className="base-input horPad"
        >
          <ChainMenu>
            <div
              className="r-block"
              style={{
                cursor: "pointer",
              }}
            >
              <div className="base-input--icon">
                <img alt="" src={selectedChain?.image_url} />
              </div>

              <p
                style={{
                  fontSize: "14px",
                  textTransform: "uppercase",
                }}
              >
                {selectedChain.short_name}
              </p>

              <CaretDown
                size={16}
                weight="bold"
                style={{
                  marginTop: "-2px",
                }}
              />
            </div>
          </ChainMenu>

          <div className="base-input__block">
            <input
              value={destination}
              className="v-line-left"
              placeholder="Enter recipient's address"
              onChange={(e) => setDestination(e.target.value as `0x${string}`)}
            />
          </div>
        </div>

        <div
          style={{
            padding: "6px 14px",
          }}
          className="base-input horPad"
        >
          <TokenMenu>
            <div
              className="r-block"
              style={{
                cursor: "pointer",
              }}
            >
              <div className="base-input--icon">
                <img alt="" src={selectedToken?.image_url} />
              </div>

              <p
                style={{
                  fontSize: "14px",
                  textTransform: "uppercase",
                }}
              >
                {selectedToken?.symbol}
              </p>

              <CaretDown
                size={16}
                weight="bold"
                style={{
                  marginTop: "-2px",
                }}
              />
            </div>
          </TokenMenu>

          <div className="base-input__block ">
            <input
              type="number"
              value={amount}
              placeholder="Amount"
              className="v-line-left"
              onKeyDown={(e) => {
                if (e.key === "e") {
                  e.preventDefault();
                }
              }}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </div>

        <div className="row-block pad">
          <p className="recurring-label">Make this a recurring payment?</p>

          <button
            data-move={isRecurring}
            className="base-switch"
            onClick={() => {
              setIsrecurring(!isRecurring);
            }}
          >
            <div className="base-switch-toggle" />
          </button>
        </div>

        {isRecurring && (
          <div className="row-block animated">
            <div className="recurring-interval">
              {/* INTERVAL */}
              <div
                style={{
                  padding: "2px 14px",
                }}
                className="base-input bgColor horPad"
              >
                <div className="base-input__block">
                  <input
                    type="number"
                    pattern="[0-9]*"
                    value={interval}
                    onKeyDown={(e) => {
                      if (e.key === "e") {
                        e.preventDefault();
                      }
                    }}
                    placeholder={`Interval in ${timeframe}`}
                    onChange={(e) => setInterval(e.target.value)}
                  />
                </div>

                {/* SELECT TIMEFRAME */}
                <TimeframeMenu>
                  <div
                    className="r-block"
                    style={{
                      height: "30px",
                      cursor: "pointer",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "14px",
                        textTransform: "uppercase",
                      }}
                    >
                      {Number(interval) > 1
                        ? timeframe
                        : timeframe.slice(0, -1)}
                    </p>

                    <CaretDown
                      size={16}
                      weight="bold"
                      style={{
                        marginTop: "-2px",
                      }}
                    />
                  </div>
                </TimeframeMenu>
              </div>
            </div>

            {/* DATE SELECTOR */}
            <DateSelector date={selectedDate} setDate={setSelectedDate} />
          </div>
        )}

        <div
          onClick={() => sendFunds()}
          className={`base-btn ${
            !loading &&
            (!chargeToken ||
              amount.trim() === "" ||
              !isAddress(destination) ||
              (interval.trim() === "" && isRecurring))
              ? "disabled"
              : ""
          }`}
        >
          <p>{isRecurring ? "Create recurring payment" : "Transfer funds"}</p>

          {!loading && (
            <div className="base-btn__icon">
              <CaretDoubleRight size={15} weight="bold" />
            </div>
          )}

          {loading && (
            <div className="c-spinner">
              <ClipLoader
                size={16}
                color={"#fff"}
                loading={loading}
                aria-label="Loading Spinner"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transfer;
