import "./product-preview.scss";
import { nanoid } from "nanoid";
import { useState } from "react";
import ProductPlan from "./product-plan";
import { ClipLoader } from "react-spinners";
import { ISubscriptionPlan } from "types/subscription";
import { CaretDoubleRight } from "@phosphor-icons/react";
import EmptyState from "components/common/empty-state";
import axios from "axios";
import { defaultChain } from "utils/wagmi";

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

const ProductPreviewModal = () => {
  const [loading, setLoading] = useState(false);

  const [selectedPlan, setSelectedzPlan] = useState(plans[0].id);

  const updateSelectedPlan = (planId: string) => {
    setSelectedzPlan(plans.find((p) => p.id === planId)?.id || "");
  };

  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  const getProductDetails = async ({
    productId,
    apiKey,
  }: {
    productId: string;
    apiKey: string;
  }) => {
    setIsLoading(true);

    try {
      // const token = await getAccessToken();

      const res = await axios
        .get(`/api/products/${productId}`, {
          params: {
            chainId: defaultChain.id,
          },
          headers: {
            "X-API-KEY": apiKey,
          },
        })
        .then((res) => res?.data?.data?.product);

      console.log(res);
      setData(res);
    } catch (error) {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!data || error || isLoading || data?.length === 0 ? (
        <>
          <EmptyState
            error={!error}
            isLoading={isLoading}
            data={{
              message: "No products created yet",
              loadingText: "Loading products...",
              errorMessage: "An error occurred while fetching products",
            }}
          />
        </>
      ) : (
        <div className="base-modal product-preview">
          <div className="c-img-input">
            <div className="c-img-input__preview sm">
              <img
                alt="preview"
                src={"https://asset.brandfetch.io/id20mQyGeY/ide1xH4k4a.png"}
              />
            </div>
          </div>

          <div className="base-modal__header">
            <div className="base-modal__header-block">
              <h2>Spotify</h2>
              <p
                style={{
                  maxWidth: "300px",
                }}
              >
                Subscribe to any of the premium plans below to enjoy quality
                music on spotify
              </p>
            </div>
          </div>

          <div className="base-modal__body">
            <div className="product-plans">
              {plans.map((plan, ind, arr) => {
                return (
                  <ProductPlan
                    key={ind}
                    plan={plan}
                    selectedPlan={selectedPlan}
                    updateSelectedPlan={updateSelectedPlan}
                  />
                );
              })}
            </div>
          </div>

          <div
            className={`base-btn ${loading ? "disabled" : ""}`}
            onClick={() => {
              //
            }}
          >
            <p>Subscribe to Spotify</p>

            <div className="base-btn__icon">
              <CaretDoubleRight size={15} weight="bold" />
            </div>

            {loading && (
              <div className="c-spinner">
                <ClipLoader
                  size={16}
                  color={"#000"}
                  loading={loading}
                  aria-label="Loading Spinner"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ProductPreviewModal;
