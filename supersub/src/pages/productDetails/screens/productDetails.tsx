import commaNumber from "comma-number";
import { formatUnits, getAddress } from "ethers";
import { formatTimeInterval, getSignificantDigits } from "utils/HelperUtils";
const ProductDetails = ({ data }: { data: any }) => {
  return (
    <>
      <div className="payment-preview__images">
        {/* <div className="payment-preview__images--img">
              <img alt="" src={"./assets/images/app/icon512_maskable.png"} />
            </div>
            <ArrowRight size={20} weight="bold" /> */}
        <div className="payment-preview__images--img">
          <img alt="" src={data?.logoUrl} />
        </div>
      </div>
      <div className="payment-preview__header">
        <div className="payment-preview__header-block">
          <h2>{data?.name}</h2>
          <p
            style={{
              maxWidth: "300px",
            }}
          >
            {data?.description}
          </p>
        </div>
      </div>
      <div className="payment-preview__body">
        <h3>Plans</h3>
        <div className="product-plans">
          {data.plans.map((planDetails: any, index: number) => {
            return (
              <div className="product-plan">
                <div className="product-plan--display">
                  <p>
                    {`${commaNumber(getSignificantDigits(formatUnits(planDetails?.price?.toString(), planDetails?.token?.decimals > 18 ? 18 : planDetails?.planToken?.decimals)))} ${
                      planDetails?.token?.symbol
                    } for `}
                    {`${formatTimeInterval(planDetails?.chargeInterval)}`}
                  </p>
                  {/* <Check size={18} weight="bold" /> */}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
export default ProductDetails;
