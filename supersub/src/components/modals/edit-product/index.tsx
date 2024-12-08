import "./edit-product.scss";
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

const EditProductModal = () => {
  const { updateProduct } = useApp();
  const { activeProduct } = useModal();

  const [loading, setLoading] = useState(false);
  const [destination, setDestination] = useState("");

  const [isDisabled, setIsDisabled] = useState(!activeProduct?.isActive);

  const currentDestinationChain = Object.values(supportedChains).find(
    (chain) => chain.chain_id === activeProduct?.destinationChain
  );

  const [selectedChain, setSelectedChain] = useState<
    (typeof supportedChains)[keyof typeof supportedChains] | null
  >(null);

  const [ChainMenu] = useAppObjMenu({
    uppercase: false,
    align: "end",
    direction: "bottom",
    objecKey: "chain_name",
    menuClass: "chain-menu",
    items: Object.values(supportedChains).filter(
      (chain) => chain.chain_id !== activeProduct?.destinationChain
    ),
    defaultOption: null,
    toggleCallback: (value) => setSelectedChain(value),
  });

  const updateData = useMemo(() => {
    return {
      productId: activeProduct?.onchainReference.split(":")[1],
      recipient: isAddress(destination)
        ? destination
        : activeProduct?.receivingAddress,
      destinationChain: selectedChain
        ? selectedChain.chain_id
        : activeProduct?.destinationChain,
      isActive: !isDisabled,
    };
  }, [destination, isDisabled, selectedChain]);

  const hasChanged = useMemo(() => {
    return (
      updateData.recipient !== activeProduct?.receivingAddress ||
      updateData.destinationChain !== activeProduct?.destinationChain ||
      updateData.isActive !== activeProduct?.isActive
    );
  }, [updateData]);

  const handleUpdateProduct = async () => {
    if (loading) return;

    if (destination.trim().length > 1 && !isAddress(destination)) {
      toast.error("Invalid destination address");
      return;
    }

    setLoading(true);

    try {
      await updateProduct(
        updateData.productId,
        updateData.recipient,
        updateData.destinationChain,
        updateData.isActive
      );
      toast.success("Product updated successfully");
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
          <img alt="preview" src={activeProduct?.logoUrl} />
        </div>
      </div>

      <div className="base-modal__header">
        <div className="base-modal__header-block">
          <h2>{activeProduct?.name}</h2>
          <p
            style={{
              maxWidth: "300px",
            }}
          >
            {activeProduct?.description}
          </p>
        </div>
      </div>

      <div className="base-modal__body">
        {/* CHAIN DESTINATION ADDRESS */}
        {/* <div className="base-input">
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
              Current: {activeProduct?.receivingAddress}
            </p>
          </div>
        </div> */}

        {/* CHANGE CHAIN */}
        {/* <div className="row">
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
        </div> */}

        {/* TOGGLE PRODUCT */}
        <div className="row" style={{ marginTop: "4px" }}>
          <p style={{ paddingLeft: "10px" }}>Disable this product </p>

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
          handleUpdateProduct();
        }}
      >
        <p>Update product — {activeProduct?.name}</p>

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

export default EditProductModal;
