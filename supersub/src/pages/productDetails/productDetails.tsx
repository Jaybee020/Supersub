import "./pay.scss";
import axios from "axios";
import { useApp } from "contexts";
import { usePrivy } from "@privy-io/react-auth";
import { useQuery } from "@tanstack/react-query";
import { Infinity } from "@phosphor-icons/react";
import EmptyState from "components/common/empty-state";
import { supportedChains } from "constants/data";
import { defaultChain } from "utils/wagmi";
import ProductDetails from "./screens/productDetails";
const Product = () => {
  const { getAccessToken } = usePrivy();
  const { params, authenticated, isMfaEnabled } = useApp();
  const { data, isLoading, error } = useQuery({
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
    enabled: !!params?.["reference"],
    queryKey: ["product", params?.["reference"]],
    queryFn: async () => {
      const token = await getAccessToken();
      return await axios
        .get(`api/products/${params?.["reference"]}`, {
          headers: {
            authorization: `Bearer ${token}`,
          },
        })
        .then((res) => res?.data?.data?.product);
    },
  });

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
          <ProductDetails data={data} />
        </div>
      )}
    </>
  );
};
export default Product;
