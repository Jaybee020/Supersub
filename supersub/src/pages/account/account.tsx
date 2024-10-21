import "./account.scss";
import AccountChart from "./ui/chart";
import AccountTabs from "./tabs/acct-tabs";

const Account = () => {
  return (
    <div className="account">
      <AccountChart />
      <AccountTabs />
    </div>
  );
};

export default Account;
