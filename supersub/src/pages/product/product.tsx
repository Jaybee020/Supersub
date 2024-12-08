import "./product.scss";
import axios from "axios";
import dayjs from "dayjs";
import { formatUnits } from "viem";
import { useApp, useModal } from "contexts";
import { Fragment } from "react/jsx-runtime";
import { usePrivy } from "@privy-io/react-auth";
import { useQuery } from "@tanstack/react-query";
import EmptyState from "components/common/empty-state";
import {
  CaretDown,
  CheckCircle,
  CopySimple,
  PencilSimple,
  XCircle,
} from "@phosphor-icons/react";
import {
  AccordionItem,
  ControlledAccordion,
  useAccordionProvider,
} from "@szhsin/react-accordion";
import { defaultChain } from "utils/wagmi";
import { formatTimeInterval } from "utils/HelperUtils";
import { useState } from "react";
import { toast } from "sonner";

const Products = () => {
  const { openEditProductModal, openEditPlanModal } = useModal();
  const [copied, setCopied] = useState(false);
  const copyLink = (reference: string, type: string) => {
    navigator.clipboard.writeText(
      `${window.location.origin}/${type}?reference=${reference}`
    );
    setTimeout(() => setCopied(false), 1100);
  };

  // ACCORDION PROVIDER
  const providerValue = useAccordionProvider({
    transition: true,
    allowMultiple: true,
  });
  const { toggle } = providerValue;

  // FETCH PRODUCTS
  const { smartAddress } = useApp();
  const { getAccessToken } = usePrivy();

  const { data, isLoading, error } = useQuery({
    enabled: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
    queryKey: ["acctProducts", smartAddress],
    queryFn: async () => {
      const token = await getAccessToken();
      return await axios
        .get(`/api/products`, {
          params: {
            chainId: defaultChain.id,
            address: smartAddress,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) =>
          res?.data?.data?.products.filter(
            (item: any) =>
              item?.type && item?.type?.toLowerCase() !== "recurring"
          )
        );
    },
  });

  return (
    <>
      <div className="products">
        <div className="base-page__header row">
          <div className="base-page__header--block">
            <h2>Products</h2>
            <p>Manage your subscriptions and payments</p>
          </div>
        </div>

        {!data || error || isLoading || data?.length === 0 ? (
          <>
            <EmptyState
              error={error}
              isLoading={isLoading}
              data={{
                message: "No products created yet",
                loadingText: "Loading products...",
                errorMessage: "An error occurred while fetching products",
              }}
            />
          </>
        ) : (
          <>
            <ControlledAccordion
              className="base-page__body"
              providerValue={providerValue}
            >
              {data.map((item: any, index: number) => {
                return (
                  <Fragment key={index}>
                    <AccordionItem
                      itemKey={item?.createdAt}
                      className={"products-item"}
                      header={({ state: accordionState }) => (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          style={{
                            gap: "10px",
                            width: "100%",
                            display: "flex",
                            cursor: "default",
                            flexDirection: "column",
                          }}
                        >
                          <div className="r-block">
                            <div className="details-block--icon no-border">
                              <img src={item?.logoUrl} alt="" />
                            </div>

                            <div className="r-block flexed">
                              <div className="details-block--info">
                                <p className="main">{item?.name}</p>
                                {item.createdAt && (
                                  <p className="sub">
                                    {dayjs(item?.createdAt).format(
                                      "MMM DD, YYYY"
                                    )}
                                  </p>
                                )}
                              </div>

                              <div className="details-block--info centered">
                                <p className="main">
                                  {item?._count?.subscriptions}
                                </p>
                                <p className="sub">Subscribers</p>
                              </div>

                              <div className="products-item--btns">
                                <div className="copy-btn">
                                  <button
                                    onClick={() => {
                                      copyLink(
                                        item.onchainReference,
                                        "product"
                                      );
                                      toast.success("Copied to clipboard");
                                    }}
                                  >
                                    {copied ? (
                                      <CheckCircle
                                        size={18}
                                        weight="fill"
                                        color="#0ecb81"
                                      />
                                    ) : (
                                      <CopySimple size={18} weight="regular" />
                                    )}
                                  </button>
                                </div>
                                <div
                                  className="default-btn rounded"
                                  onClick={() => {
                                    openEditProductModal(item);
                                  }}
                                >
                                  <PencilSimple size={14} weight="fill" />
                                </div>

                                <div className="accordion-btn">
                                  <div
                                    className="accordion-btn__trigger"
                                    data-opened={accordionState.isEnter}
                                    onClick={() => {
                                      toggle(item?.createdAt);
                                    }}
                                  >
                                    <CaretDown size={16} weight="regular" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {item.description && (
                            <div className="products-description">
                              <p>{item.description}</p>
                            </div>
                          )}
                        </div>
                      )}
                    >
                      <div className="products-item__plans">
                        {item?.plans?.map((plan: any, ind: number) => {
                          const timeframes = {
                            days: plan.chargeInterval / 86400,
                            weeks: plan.chargeInterval / 604800,
                            months: plan.chargeInterval / 2628000,
                            years: plan.chargeInterval / 31536000,
                          };

                          const selectedTimeframe =
                            timeframes["years"] > 1 &&
                            Number.isInteger(timeframes["years"])
                              ? "years"
                              : timeframes["months"] > 1 &&
                                  Number.isInteger(timeframes["months"])
                                ? "months"
                                : timeframes["weeks"] > 1 &&
                                    Number.isInteger(timeframes["weeks"])
                                  ? "weeks"
                                  : "days";

                          return (
                            <div
                              key={ind}
                              className="products-item__plans--plan"
                            >
                              <span>
                                <p>
                                  {formatUnits(
                                    plan.price,
                                    plan?.token?.decimals
                                  )}{" "}
                                  {plan?.token?.symbol} — Every{" "}
                                  {/*
                                   * FORMAT TIMEFRAMES
                                   */}
                                  {`${formatTimeInterval(plan.chargeInterval)}`}
                                </p>
                              </span>

                              <span
                                className="products-item--btns"
                                style={{ gap: "2px" }}
                              >
                                <span
                                  className="default-btn rounded"
                                  onClick={() => {
                                    console.log({ ...plan, product: item });
                                    openEditPlanModal({
                                      ...plan,
                                      product: item,
                                    });
                                  }}
                                >
                                  <PencilSimple size={14} weight="fill" />
                                </span>
                                <span className="copy-btn">
                                  <button
                                    onClick={() => {
                                      copyLink(
                                        plan.onchainReference,
                                        "subscribe"
                                      );
                                      toast.success("Copied to clipboard");
                                    }}
                                  >
                                    {copied ? (
                                      <CheckCircle
                                        size={18}
                                        weight="fill"
                                        color="#0ecb81"
                                      />
                                    ) : (
                                      <CopySimple size={18} weight="regular" />
                                    )}
                                  </button>
                                </span>
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </AccordionItem>
                  </Fragment>
                );
              })}
            </ControlledAccordion>
          </>
        )}
      </div>
    </>
  );
};

export default Products;
