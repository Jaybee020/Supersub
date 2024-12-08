import "./pay.scss";
import axios from "axios";
import { useApp } from "contexts";
import { usePrivy } from "@privy-io/react-auth";
import { useQuery } from "@tanstack/react-query";
import { Infinity } from "@phosphor-icons/react";
import EmptyState from "components/common/empty-state";
import PaymentScreen from "./screens/pay";
import SigninToPay from "./screens/signin";
import { supportedChains } from "constants/data";
import { defaultChain } from "utils/wagmi";
const Pay = () => {
  const { getAccessToken } = usePrivy();
  const { params, authenticated, isMfaEnabled } = useApp();
  const { data, isLoading, error } = useQuery({
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
    enabled: !!params?.["reference"],
    queryKey: ["plan", params?.["reference"]],
    queryFn: async () => {
      const token = await getAccessToken();
      return await axios
        .get(`api/plan/${params?.["reference"]}`, {
          headers: {
            authorization: `Bearer ${token}`,
          },
        })
        .then((res) => res?.data?.data?.plan);
    },
  });
  const isAuthenticated = authenticated && isMfaEnabled;

  return (
    <>
      {!data || error || isLoading ? (
        <>
          <EmptyState
            error={!error}
            isLoading={isLoading}
            data={{
              message: "No products created yet",
              loadingText: "Loading Product details...",
              errorMessage:
                error?.message || "An error occurred while fetching products",
            }}
          />
        </>
      ) : (
        <div className="payment-preview">
          <div className="tabs-header">
            <div className="tabs-header__logo">
              <Infinity size={54} weight="light" />
              <p>Super Sub</p>
            </div>
            <div className="bricks">
              {Array.from({ length: 3 }).map((item, index) => {
                return <div key={index} className="bricks-block" />;
              })}
              <div className="version">
                <img src={supportedChains[defaultChain.id].image_url} alt="" />
              </div>
              <div className="indicator" />
            </div>
          </div>
          {isAuthenticated ? <PaymentScreen data={data} /> : <SigninToPay />}
        </div>
      )}
    </>
  );
};
export default Pay;
