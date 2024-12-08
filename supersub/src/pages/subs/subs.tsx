import "./subs.scss";
import axios from "axios";
import { useApp, useModal } from "contexts";
import { usePrivy } from "@privy-io/react-auth";
import { useQuery } from "@tanstack/react-query";
import { Menu, MenuItem } from "@szhsin/react-menu";
import EmptyState from "components/common/empty-state";
import {
  DotsThreeVertical,
  PencilSimple,
  SealCheck,
  Subtract,
} from "@phosphor-icons/react";
import { formatUnits } from "viem";
import { useState } from "react";
import dayjs from "dayjs";
import WalletIcon from "components/common/wallet-icon";
import { formatTimeInterval, truncate } from "utils/HelperUtils";
import { defaultChain } from "utils/wagmi";
import { now } from "lodash";

const Subs = () => {
  // FETCH PRODUCTS
  const { smartAddress, unsubscribeToPlan } = useApp();
  const { openEditSubscriptionModal } = useModal();
  const { getAccessToken } = usePrivy();

  const { data, isLoading, error } = useQuery({
    enabled: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
    queryKey: ["acctSubscriptions", smartAddress],
    queryFn: async () => {
      const token = await getAccessToken();
      return await axios
        .get(`/api/subscriptions`, {
          params: {
            chainId: defaultChain.id,
            address: smartAddress,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => res?.data?.data?.subscriptions);
    },
  });

  const [activeTab, setActiveTab] = useState("subscriptions");

  return (
    <div className="subs base-page">
      <div className="base-page__header">
        <h2>Subscriptions</h2>
        <p>Manage your subscriptions and payments</p>
      </div>

      {!data || error || isLoading || data?.length === 0 ? (
        <>
          <EmptyState
            error={error}
            isLoading={isLoading}
            icon={<Subtract size={60} weight="regular" color="#bbb" />}
            data={{
              message: "You have no active subscriptions",
              loadingText: "Loading subscriptions...",
              errorMessage: "An error occurred while fetching subscriptions",
            }}
          />
        </>
      ) : (
        <>
          <div className="tabs-btns">
            <div className="c-toggle-btns">
              {["subscriptions", "recurring"].map((item, index) => {
                return (
                  <button
                    key={index}
                    className="c-toggle-btns__btn"
                    data-active={activeTab === item}
                    onClick={() => setActiveTab(item)}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="base-page__body">
            {data
              ?.filter((item: any) => {
                return activeTab === "recurring"
                  ? item?.product?.type.toLowerCase() === "recurring"
                  : item?.product?.type.toLowerCase() !== "recurring";
              })
              ?.map((item: any, index: number) => {
                const timeframes = {
                  days: item?.plan.chargeInterval / 86400,
                  weeks: item?.plan.chargeInterval / 604800,
                  months: item?.plan.chargeInterval / 2628000,
                  years: item?.plan.chargeInterval / 31536000,
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
                  <div key={index} className="subs-item">
                    <div className="r-block">
                      <div className="details-block">
                        {activeTab === "recurring" ? (
                          <WalletIcon
                            address={item?.plan?.receivingAddress}
                            size={30}
                          />
                        ) : (
                          <div className="details-block--icon no-border">
                            <img src={item?.product?.logoUrl} alt="" />
                          </div>
                        )}

                        <div className="details-block--info">
                          <div
                            style={{
                              gap: "4px",
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                          >
                            <p className="main">
                              {activeTab === "recurring"
                                ? truncate(item?.plan?.receivingAddress, 12)
                                : item?.product?.name}
                            </p>
                            {activeTab === "subscriptions" && (
                              <SealCheck
                                size={13}
                                weight="fill"
                                color="#ee6f61"
                              />
                            )}
                          </div>
                          {item.createdAt && (
                            <p className="sub">
                              {dayjs(item?.createdAt).format("MMM DD, YYYY")}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="details-block">
                        <div className="details-block--info">
                          <p className="main">
                            {formatUnits(
                              item?.plan?.price,
                              item?.plan?.token?.decimals
                            )}{" "}
                            {item?.plan?.token?.symbol}
                          </p>

                          <p className="sub">
                            Every{" "}
                            {/*
                             * FORMAT TIMEFRAMES
                             */}
                            {`${formatTimeInterval(item?.plan?.chargeInterval)}`}
                          </p>
                        </div>
                      </div>

                      <div className="details-block--info">
                        <p className="main">
                          {!item?.isActive ? "Status" : "Next charge"}
                        </p>
                        {!item?.isActive ? (
                          <p className="sub">Inactive</p>
                        ) : (
                          <>
                            {item.createdAt && (
                              <p className="sub">
                                {item?.lastChargeDate
                                  ? dayjs(item?.lastChargeDate)
                                      .add(
                                        item?.plan?.chargeInterval,
                                        "seconds"
                                      )
                                      .format("MMM DD, YYYY")
                                  : dayjs(now()).format("MMM DD, YYYY")}
                              </p>
                            )}
                          </>
                        )}
                      </div>

                      <div
                        style={{ marginLeft: "15px" }}
                        className="products-item--btns"
                      >
                        <div
                          className="default-btn rounded"
                          onClick={() => {
                            openEditSubscriptionModal(item);
                          }}
                        >
                          <PencilSimple size={14} weight="fill" />
                        </div>

                        <div className="app-menu__container">
                          <Menu
                            transition
                            align={"end"}
                            direction={"bottom"}
                            menuButton={
                              <button
                                style={{
                                  width: "30px",
                                  height: "30px",
                                  display: "flex",
                                  cursor: "pointer",
                                  // marginLeft: "20px",
                                  alignItems: "flex-end",
                                  flexDirection: "column",
                                  justifyContent: "center",
                                }}
                              >
                                <DotsThreeVertical size={16} weight="regular" />
                              </button>
                            }
                            menuClassName={`app-menu`}
                          >
                            {["unsubscribe"].map((slug, ind) => (
                              <MenuItem
                                key={ind}
                                value={slug}
                                data-active={true}
                                onClick={() => {
                                  unsubscribeToPlan(
                                    item?.id,
                                    item?.beneficiary
                                  ); //TODO: change unsubscribe function
                                }}
                                className={`menu-item ${slug === "unsubscribe" ? "unsubscribe" : ""}`}
                              >
                                <p style={{ textTransform: "capitalize" }}>
                                  {slug}
                                </p>
                              </MenuItem>
                            ))}
                          </Menu>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </>
      )}
    </div>
  );
};

export default Subs;
