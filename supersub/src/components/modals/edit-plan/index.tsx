import "./edit-plan.scss";
import { toast } from "sonner";
import { nanoid } from "nanoid";
import { isAddress } from "viem";
import { useMemo, useState } from "react";
import { useApp, useModal } from "contexts";
import { ClipLoader } from "react-spinners";
import useAppObjMenu from "hooks/useAppObjMenu";
import { supportedChains } from "constants/data";
import WalletIcon from "components/common/wallet-icon";
import { ISubscriptionPlan } from "types/subscription";
import { ArrowRight, CaretDown, CaretDoubleRight } from "@phosphor-icons/react";
import { IPlan } from "pages/account/tabs/history";

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

const EditPlanModal = () => {
  const { updatePlan } = useApp();
  const { activePlan }: { activePlan: IPlan } = useModal();

  const [loading, setLoading] = useState(false);
  const [destination, setDestination] = useState("");

  const [isDisabled, setIsDisabled] = useState(!activePlan?.isActive);

  const currentDestinationChain = Object.values(supportedChains).find(
    (chain) => chain.chain_id === activePlan?.destinationChain
  );

  const [selectedChain, setSelectedChain] = useState<
    (typeof supportedChains)[keyof typeof supportedChains] | null
  >(null);
  console.log("Reached Here", activePlan);

  const [ChainMenu] = useAppObjMenu({
    uppercase: false,
    align: "end",
    direction: "bottom",
    objecKey: "chain_name",
    menuClass: "chain-menu",
    items: Object.values(supportedChains).filter(
      (chain) => chain.chain_id !== activePlan?.destinationChain
    ),
    defaultOption: null,
    toggleCallback: (value) => setSelectedChain(value),
  });

  const updateData = useMemo(() => {
    return {
      planId: activePlan?.onchainReference.split(":")[1],
      recipient: isAddress(destination)
        ? destination
        : activePlan?.receivingAddress,
      destinationChain: selectedChain
        ? selectedChain.chain_id
        : activePlan?.destinationChain,
      isActive: !isDisabled,
    };
  }, [destination, isDisabled, selectedChain]);

  const hasChanged = useMemo(() => {
    return (
      updateData.recipient !== activePlan?.receivingAddress ||
      updateData.destinationChain !== activePlan?.destinationChain ||
      updateData.isActive !== activePlan?.isActive
    );
  }, [updateData]);

  const handleUpdatePlan = async () => {
    if (loading) return;

    if (destination.trim().length > 1 && !isAddress(destination)) {
      toast.error("Invalid destination address");
      return;
    }

    setLoading(true);

    try {
      await updatePlan(
        Number(updateData.planId),
        updateData.recipient as `0x${string}`,
        updateData.destinationChain,
        updateData.isActive
      );
      toast.success("Plan updated successfully");
    } catch (error: any) {
      toast.error(
        `Failed to update plan` +
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
          <img alt="preview" src={activePlan?.product?.logoUrl} />
        </div>
      </div>

      <div className="base-modal__header">
        <div className="base-modal__header-block">
          <h2>{activePlan?.product?.name}</h2>
          <p
            style={{
              maxWidth: "300px",
            }}
          >
            {activePlan?.product?.description}
          </p>
        </div>
      </div>

      <div className="base-modal__body">
        {/* CHAIN DESTINATION ADDRESS */}
        <div className="base-input">
          <WalletIcon size={24} address={destination || "0x"} />

          <div className="base-input__block padded">
            <input
              value={destination}
              placeholder="Change receiving address"
              onChange={(e) => setDestination(e.target.value as `0x${string}`)}
            />
            <p
              style={{
                color: "#ccc",
                fontSize: "12px",
              }}
            >
              Current: {activePlan?.receivingAddress}
            </p>
          </div>
        </div>

        {/* CHANGE CHAIN */}
        <div className="row">
          <div className="row-block medium">
            <p>Current chain:</p>
            <div className="icon">
              <img alt="" src={currentDestinationChain?.image_url || ""} />
            </div>
            <span
              style={{
                textTransform: "uppercase",
              }}
            >
              {currentDestinationChain?.short_name}
            </span>
          </div>

          <ArrowRight size={16} weight="bold" />

          <div className="row-block no-flex">
            <ChainMenu>
              <div
                className="r-block"
                style={{
                  cursor: "pointer",
                }}
              >
                {selectedChain && (
                  <div className="icon">
                    <img alt="" src={selectedChain?.image_url} />
                  </div>
                )}
                {selectedChain ? (
                  <p
                    style={{
                      fontSize: "14px",
                      textTransform: "uppercase",
                    }}
                  >
                    {selectedChain?.short_name}
                  </p>
                ) : (
                  <p
                    style={{
                      fontSize: "14px",
                    }}
                  >
                    Select new chain
                  </p>
                )}

                <CaretDown
                  size={16}
                  weight="bold"
                  style={{
                    marginTop: "-2px",
                  }}
                />
              </div>
            </ChainMenu>
          </div>
        </div>

        {/* TOGGLE PRODUCT */}
        <div className="row" style={{ marginTop: "4px" }}>
          <p style={{ paddingLeft: "10px" }}>Disable this plan </p>

          <button
            data-move={isDisabled}
            className="base-switch"
            onClick={() => {
              setIsDisabled(!isDisabled);
            }}
          >
            <div className="base-switch-toggle" />
          </button>
        </div>
      </div>

      <div
        className={`base-btn ${loading || !hasChanged ? "disabled" : ""}`}
        onClick={() => {
          handleUpdatePlan();
        }}
      >
        <p>Update plan for — {activePlan?.product?.name}</p>

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

export default EditPlanModal;
