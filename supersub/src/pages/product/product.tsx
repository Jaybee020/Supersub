import "./product.scss";
import axios from "axios";
import dayjs from "dayjs";
import { formatUnits } from "viem";
import { useApp, useModal } from "contexts";
import { Fragment } from "react/jsx-runtime";
import { usePrivy } from "@privy-io/react-auth";
import { useQuery } from "@tanstack/react-query";
import EmptyState from "components/common/empty-state";
import { CaretDown, PencilSimple, XCircle } from "@phosphor-icons/react";
import {
  AccordionItem,
  ControlledAccordion,
  useAccordionProvider,
} from "@szhsin/react-accordion";
import { defaultChain } from "utils/wagmi";

const Products = () => {
  const { openEditProductModal } = useModal();

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
        .then((res) => res?.data?.data?.products);
    },
  });

  console.log(data);

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
              {data
                ?.filter(
                  (item: any) => item?.type.toLowerCase() !== "recurring"
                )
                .map((item: any, index: number) => {
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
                                <p>
                                  {formatUnits(
                                    plan.price,
                                    plan?.token?.decimals
                                  )}{" "}
                                  {plan?.token?.symbol} — Every{" "}
                                  {/*
                                   * FORMAT TIMEFRAMES
                                   */}
                                  {`${
                                    timeframes[selectedTimeframe] > 1
                                      ? timeframes[selectedTimeframe] + " "
                                      : ""
                                  }${
                                    timeframes[selectedTimeframe] > 1
                                      ? selectedTimeframe
                                      : selectedTimeframe.slice(0, -1)
                                  }`}
                                </p>
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
