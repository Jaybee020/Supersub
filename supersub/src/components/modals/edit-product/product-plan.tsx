import { ISubscriptionPlan } from "types/subscription";

interface SubscriptionPlanProps {
  selectedPlan: string;
  plan: ISubscriptionPlan;
  updateSelectedPlan: (planId: string) => void;
}

const ProductPlan = ({
  plan,
  selectedPlan,
  updateSelectedPlan,
}: SubscriptionPlanProps) => {
  return (
    <>
      <div className="product-plan">
        <div className="product-plan--display">
          <p>
            {plan.amount} — Every {plan.interval} {plan.timeframe}
          </p>
        </div>

        <button
          className="select-plan--btn"
          onClick={() => {
            updateSelectedPlan(plan.id);
          }}
        >
          <div
            className="select-plan--btn__fill"
            data-active={plan.id === selectedPlan}
          />
        </button>
      </div>
    </>
  );
};

export default ProductPlan;
