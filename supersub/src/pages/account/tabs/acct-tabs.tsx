import { NavLink, Outlet } from "react-router-dom";

const AccountTabs = () => {
  return (
    <div className="account-tabs">
      {/* <div className="account-tabs__header">
        <div className="c-toggle-btns">
          {["tokens", "history"].map((item, index) => {
            return (
              <NavLink
                key={index}
                className="c-toggle-btns__btn"
                to={index === 0 ? "." : "./history"}
              >
                {item}
              </NavLink>
            );
          })}
        </div>
      </div> */}

      <Outlet />
    </div>
  );
};

export default AccountTabs;
