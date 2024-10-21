import "./tabs.scss";
import { useModal } from "contexts";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Plus,
  Infinity,
  ArrowsLeftRight,
  FadersHorizontal,
  FingerprintSimple,
  ContactlessPayment,
} from "@phosphor-icons/react";

const Tabs = () => {
  const { openModal } = useModal();

  const location = useLocation();

  return (
    <div className="tabs">
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
            <img
              src="https://moonpay-marketing-c337344.payloadcms.app/media/base%20logo.webp"
              alt=""
            />
          </div>

          <div className="indicator" />
        </div>
      </div>

      <div className="tabs-screens">
        <Outlet />
      </div>

      {/* ADD PRODUCT TRIGGER */}
      {location.pathname === "/products" && (
        <button
          className="create-product-trigger"
          onClick={() => openModal("create-product")}
        >
          <Plus size={18} weight="bold" />
        </button>
      )}

      <div className="tabs-navigation">
        {[
          {
            path: "/",
            label: "Account",
            icon: <FingerprintSimple size={16} weight="bold" />,
          },
          {
            label: "Transfer",
            path: "/transfer",
            icon: (
              <ArrowsLeftRight
                size={16}
                weight="bold"
                style={
                  {
                    // transform: "rotate(-45deg)",
                  }
                }
              />
            ),
          },
          {
            label: "Subs",
            path: "/subs",
            icon: <ContactlessPayment size={16} weight="bold" />,
          },
          {
            label: "Products",
            path: "/products",
            icon: <ContactlessPayment size={16} weight="bold" />,
          },
          {
            label: "Settings",
            path: "/settings",
            icon: <FadersHorizontal size={16} weight="bold" />,
          },
        ].map((item, index) => {
          return (
            <NavLink
              key={index}
              to={item.path}
              className="tabs-navigation__item"
            >
              {item.icon}
              <p>{item.label}</p>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

export default Tabs;
