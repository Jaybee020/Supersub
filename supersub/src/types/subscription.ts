export type ISubscriptionPlan = {
  id: string;
  amount: string;
  interval: string;
  timeframe: "days" | "weeks" | "months" | "years";
};
