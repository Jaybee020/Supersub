import "./edit-subscription.scss";
import "../../../pages/transfer/transfer.scss";
import { toast } from "sonner";
import { nanoid } from "nanoid";
import { isAddress } from "viem";
import { useMemo, useState } from "react";
import { useApp, useModal } from "contexts";
import { ClipLoader } from "react-spinners";
import useAppObjMenu from "hooks/useAppObjMenu";
import { supportedChains, supportedTokens } from "constants/data";
import WalletIcon from "components/common/wallet-icon";
import { ISubscriptionPlan } from "types/subscription";
import { ArrowRight, CaretDown, CaretDoubleRight } from "@phosphor-icons/react";
import { ISubscription } from "pages/account/tabs/history";
import { defaultChain, defaultToken } from "utils/wagmi";
import useAppMenu from "hooks/useMenu";
import { timeframes } from "constants/subs";
import DateSelector from "components/common/date-selector";
import dayjs from "dayjs";

const plans: ISubscriptionPlan[] = [
  {
    id: nanoid(),
    amount: "25 USDC",
    interval: "2",
    timeframe: "weeks",
  },
  {
    id: nanoid(),
    amount: "30 USDC",
    interval: "6",
    timeframe: "days",
  },
  {
    id: nanoid(),
    amount: "90 USDC",
    interval: "6",
    timeframe: "months",
  },
];

const EditSubscriptionModal = () => {
  const { updateSubscription } = useApp();
  const { activeSubscription }: { activeSubscription: ISubscription } =
    useModal();

  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    dayjs(activeSubscription?.subscriptionExpiry).toDate()
  );

  // const [isDisabled, setIsDisabled] = useState(!activeProduct?.isActive);

  // const currentDestinationChain = Object.values(supportedChains).find(
  //   (chain) => chain.chain_id === activeProduct?.destinationChain
  // );

  const [paymentToken, setPaymentToken] = useState(
    activeSubscription?.paymentTokenAddress
  );

  const [TokenMenu, selectedToken] = useAppObjMenu({
    uppercase: true,
    objecKey: "symbol",
    toggleCallback: (val) => setPaymentToken(val),
    items: Object.values(supportedTokens),
    defaultOption: supportedTokens[defaultToken],
  });

  const updateData = useMemo(() => {
    return {
      paymentToken: selectedToken?.address,
      endTime: selectedDate,

      // productId: activeProduct?.onchainReference,
      // recipient: isAddress(destination)
      //   ? destination
      //   : activeProduct?.receivingAddress,
      // destinationChain: selectedChain
      //   ? selectedChain.chain_id
      //   : activeProduct?.destinationChain,
      // isActive: !isDisabled,
    };
  }, [paymentToken, selectedDate]);

  const hasChanged = useMemo(() => {
    return (
      updateData.paymentToken !== activeSubscription?.paymentTokenAddress ||
      updateData.endTime !==
        dayjs(activeSubscription?.subscriptionExpiry).toDate()
    );
  }, [updateData]);

  const handleUpdateSubscription = async () => {
    if (loading) return;

    if (paymentToken.trim().length > 1 && !isAddress(paymentToken)) {
      toast.error("Invalid payment token address");
      return;
    }

    setLoading(true);

    try {
      await updateSubscription(
        Number(activeSubscription?.planOnchainReference.split(":")[1]),
        activeSubscription?.beneficiaryAddress as `0x${string}`,
        updateData.paymentToken,
        dayjs(updateData.endTime).unix(),
        undefined
      );
    } catch (error: any) {
      toast.error(
        `Failed to update product` +
          (error?.details
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

  // console.log(activeProduct);

  return (
    <div className="base-modal edit-product">
      <div className="c-img-input">
        <div className="c-img-input__preview sm">
          {activeSubscription.product.type === "SUBSCRIPTION" ? (
            <img alt="preview" src={activeSubscription.product?.logoUrl} />
          ) : (
            <WalletIcon
              address={activeSubscription.plan.receivingAddress}
              size={28}
            />
          )}
        </div>
      </div>

      <div className="base-modal__header">
        <div className="base-modal__header-block">
          <h2>{activeSubscription?.product?.name}</h2>
          <p
            style={{
              maxWidth: "300px",
            }}
          >
            {activeSubscription?.product?.description}
          </p>
        </div>
      </div>

      <div className="base-modal__body" style={{ display: "block" }}>
        <div className="base-input__block">
          <div
            className="row-block animated"
            style={{ background: "none", border: "none" }}
          >
            <p>Payment Token:</p>
            {/* DATE SELECTOR */}
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
          </div>
        </div>

        <div className="base-input__block">
          <div
            className="row-block animated"
            style={{ background: "none", border: "none" }}
          >
            {/* DATE SELECTOR */}
            <p>Subscription Expiry:</p>
            <DateSelector date={selectedDate} setDate={setSelectedDate} />
          </div>
        </div>
      </div>

      <div
        className={`base-btn ${loading || !hasChanged ? "disabled" : ""}`}
        onClick={async () => {
          try {
            await handleUpdateSubscription();
            toast.success("Subscription updated successfully");
          } catch (error) {
            toast.error("Failed to update subscription");
          }
        }}
      >
        <p>Update subscription for — {activeSubscription?.product?.name}</p>

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
  );
};

export default EditSubscriptionModal;
