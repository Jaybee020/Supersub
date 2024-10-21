import commaNumber from "comma-number";
import { useMemo, useState } from "react";
import { ClipLoader } from "react-spinners";
import useAppObjMenu from "hooks/useAppObjMenu";
import { supportedTokens } from "constants/data";
import { Accordion, AccordionItem } from "@szhsin/react-accordion";
import {
  Check,
  CaretUp,
  CaretDown,
  CaretDoubleRight,
} from "@phosphor-icons/react";
import { useApp } from "contexts";

const PaymentScreen = ({ data }: { data: any }) => {
  const planDetails = useMemo(() => {
    const planTokenKey = Object.keys(supportedTokens).find(
      (key) =>
        supportedTokens[key as keyof typeof supportedTokens].address ===
        data?.token?.address
    );

    const planToken =
      supportedTokens[planTokenKey as keyof typeof supportedTokens];

    const planAmt =
      Number(data?.price || 0) /
      Math.pow(10, data?.token?.decimals ?? planToken?.decimals ?? 18);

    const timeframes = {
      days: Number(data?.chargeInterval) / 86400,
      weeks: Number(data?.chargeInterval) / 604800,
      months: Number(data?.chargeInterval) / 2629743,
      years: Number(data?.chargeInterval) / 31556926,
    };

    const selectedTimeframe =
      timeframes["years"] >= 1 && Number.isInteger(timeframes["years"])
        ? "years"
        : timeframes["months"] >= 1 && Number.isInteger(timeframes["months"])
          ? "months"
          : timeframes["weeks"] >= 1 && Number.isInteger(timeframes["weeks"])
            ? "weeks"
            : "days";

    return {
      price: planAmt,
      planToken,
      interval: timeframes[selectedTimeframe],
      timeframe:
        timeframes[selectedTimeframe] > 1
          ? selectedTimeframe
          : selectedTimeframe.slice(0, -1),
    };
  }, [data]);

  // ===============================
  const { subscribe } = useApp();

  const [destination, setDestination] = useState("");

  const [chargeToken, setChargeToken] = useState(
    supportedTokens["0x036CbD53842c5426634e7929541eC2318f3dCF7e"]
  );

  const [TokenMenu, selectedToken] = useAppObjMenu({
    uppercase: true,
    objecKey: "symbol",
    toggleCallback: (val) => setChargeToken(val),
    items: Object.values(supportedTokens),
    defaultOption:
      supportedTokens["0x036CbD53842c5426634e7929541eC2318f3dCF7e"],
  });

  const [loading, setLoading] = useState(false);
  const subscribeToPlan = async () => {
    setLoading(true);
    try {
      // const { data } = await api.post("/api/subscribe", {
      //   planId: planDetails.id,
      //   destination,
      //   chargeToken: chargeToken.address,
      // });
      // if (data?.status === 200) {
      //   // redirect to success page
      //   history.push("/success");
      // }

      await subscribe({
        //@ts-ignore
        planId: planDetails.id,
        endTime: 0,
        paymentToken: selectedToken,
        beneficiary: destination,
      });
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="payment-preview__images">
        {/* <div className="payment-preview__images--img">
              <img alt="" src={"./assets/images/app/icon512_maskable.png"} />
            </div>

            <ArrowRight size={20} weight="bold" /> */}

        <div className="payment-preview__images--img">
          <img alt="" src={data?.product?.logoUrl} />
        </div>
      </div>

      <div className="payment-preview__header">
        <div className="payment-preview__header-block">
          <h2>{data?.product?.name}</h2>
          <p
            style={{
              maxWidth: "300px",
            }}
          >
            {data?.product?.description}
          </p>
        </div>
      </div>

      <div className="payment-preview__body">
        <div className="product-plans">
          <div className="product-plan">
            <div className="product-plan--display">
              <p>
                {`${commaNumber(planDetails?.price?.toFixed(2))} ${
                  planDetails?.planToken.symbol
                } for `}
                {`${planDetails?.interval} ${planDetails?.timeframe}`}
              </p>

              <Check size={18} weight="bold" />
            </div>
          </div>
        </div>

        <Accordion
          transition
          transitionTimeout={250}
          className="config-accordion"
        >
          <AccordionItem
            header={({ state }) => {
              return (
                <div className="accordion-hd">
                  <p>Payment configuration</p>
                  <div
                    className="bttn chevron"
                    data-closed={!state.isEnter}
                    onClick={() => {
                      //
                    }}
                  >
                    <CaretUp size={15} weight="bold" />
                  </div>
                </div>
              );
            }}
          >
            <div
              style={{
                width: "100%",
                paddingTop: "14px",
              }}
            >
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
                      size={20}
                      weight="bold"
                      style={{
                        marginTop: "-2px",
                      }}
                    />
                  </div>
                </TokenMenu>

                <div className="base-input__block">
                  <input
                    value={destination}
                    className="v-line-left"
                    placeholder="Enter beneficiary address"
                    onChange={(e) =>
                      setDestination(e.target.value as `0x${string}`)
                    }
                  />
                </div>
              </div>
            </div>
          </AccordionItem>
        </Accordion>
      </div>

      <button
        disabled={loading}
        className={`base-btn`}
        onClick={() => {
          subscribeToPlan();
        }}
      >
        <p>Subscribe to {data?.product?.name}</p>

        {!loading ? (
          <div className="base-btn__icon">
            <CaretDoubleRight size={15} weight="bold" />
          </div>
        ) : (
          <div className="c-spinner">
            <ClipLoader
              size={16}
              color={"#fff"}
              loading={true}
              aria-label="Loading Spinner"
            />
          </div>
        )}
      </button>
    </>
  );
};

export default PaymentScreen;
