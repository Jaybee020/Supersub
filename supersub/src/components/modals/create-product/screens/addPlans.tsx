import { nanoid } from "nanoid";
import { Plus } from "@phosphor-icons/react";
import { supportedTokens } from "constants/data";
import SubscriptionPlan from "../subscription-plan";
import { ISubscriptionPlan } from "types/subscription";

interface AddPlansProps {
  plans: ISubscriptionPlan[];
  updatePlans: (plan: ISubscriptionPlan[]) => void;
  chargeToken: (typeof supportedTokens)[keyof typeof supportedTokens];
}

const AddPlans = ({ plans, updatePlans, chargeToken }: AddPlansProps) => {
  const addNewPlan = () => {
    updatePlans([
      ...plans,
      {
        id: nanoid(),
        amount: "",
        interval: "",
        timeframe: "days",
      },
    ]);
  };

  const updateSubscriptionPlan = (
    planId: string,
    planUpdates: Omit<ISubscriptionPlan, "id">
  ) => {
    const newPlans = plans.map((plan) =>
      plan.id === planId
        ? {
            ...plan,
            ...planUpdates,
          }
        : plan
    );

    updatePlans(newPlans);
  };

  const deleteSubscriptionPlan = (planId: string) => {
    const newPlans = plans.filter((plan) => plan.id === planId);
    updatePlans(newPlans);
  };

  return (
    <>
      <div className="base-modal__header">
        <div className="base-modal__header-block">
          <h2>Add subscription plans</h2>
          <p>Set the price and interval for your subscription plans.</p>
        </div>
      </div>

      <div className="base-modal__body">
        <div className="subscription-plans">
          {plans.map((plan, ind, arr) => {
            return (
              <SubscriptionPlan
                key={ind}
                planId={plan?.id}
                chargeToken={chargeToken}
                showRemoveBtn={arr.length > 1}
                updateSubscriptionPlan={updateSubscriptionPlan}
                deleteSubscriptionPlan={deleteSubscriptionPlan}
              />
            );
          })}
        </div>

        <button className="add-plan-btn" onClick={addNewPlan}>
          <Plus size={16} weight="bold" />
        </button>
      </div>
    </>
  );
};

export default AddPlans;
