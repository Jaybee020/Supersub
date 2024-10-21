import useAppMenu from "hooks/useMenu";
import { timeframes } from "constants/subs";
import { useEffect, useState } from "react";
import { supportedTokens } from "constants/data";
import { X, CaretDown } from "@phosphor-icons/react";
import { ISubscriptionPlan } from "types/subscription";

interface SubscriptionPlanProps {
  planId: string;
  showRemoveBtn?: boolean;
  updateSubscriptionPlan: (
    planId: string,
    plan: Omit<ISubscriptionPlan, "id">
  ) => void;
  deleteSubscriptionPlan: (planId: string) => void;
  chargeToken: (typeof supportedTokens)[keyof typeof supportedTokens];
}

const SubscriptionPlan = ({
  planId,
  chargeToken,
  showRemoveBtn = true,
  deleteSubscriptionPlan,
  updateSubscriptionPlan,
}: SubscriptionPlanProps) => {
  const [amount, setAmount] = useState("");
  const [interval, setInterval] = useState("");

  const [TimeframeMenu, timeframe] = useAppMenu({
    uppercase: false,
    menuClass: "chain-menu",
    toggleCallback: () => {},
    defaultOption: timeframes[0],
    items: timeframes.map((chain) => chain),
  });

  useEffect(() => {
    updateSubscriptionPlan(planId, {
      amount,
      interval,
      timeframe: timeframe as any,
    });
  }, [amount, interval, timeframe]);

  return (
    <>
      <div className="subscription-plan">
        {/* AMOUNT */}
        <div
          className="base-input bgColor"
          style={{
            maxWidth: "136px",
          }}
        >
          <div className="base-input--icon">
            <img alt="" src={chargeToken?.image_url} />
          </div>

          <div className="base-input__block">
            <input
              type="number"
              value={amount}
              placeholder="Amount"
              onKeyDown={(e) => {
                if (e.key === "e") {
                  e.preventDefault();
                }
              }}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </div>

        {/* INTERVAL */}
        <div className="base-input bgColor">
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
            <div className="r-block">
              <p
                style={{
                  fontSize: "14px",
                  textTransform: "uppercase",
                }}
              >
                {Number(interval) > 1 ? timeframe : timeframe.slice(0, -1)}
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

        {showRemoveBtn && (
          <button
            className="remove-plan--btn"
            onClick={() => deleteSubscriptionPlan(planId)}
          >
            <X size={16} weight="bold" />
          </button>
        )}
      </div>
    </>
  );
};

export default SubscriptionPlan;
