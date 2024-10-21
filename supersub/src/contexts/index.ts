import { useContext } from "react";
import { AppContext } from "./AppProvider";
import { ModalContext } from "./ModalProvider";
import { AccountDataContext } from "./AccountDataProvider";

const useApp = () => {
  const value = useContext(AppContext);
  if (import.meta.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error("useApp must be wrapped in a <AppProvider />");
    }
  }
  return value;
};

const useModal = () => {
  const value = useContext(ModalContext);
  if (import.meta.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error("useModal must be wrapped in a <ModalProvider />");
    }
  }
  return value;
};

const useAccountData = () => {
  const value = useContext(AccountDataContext);
  if (import.meta.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error(
        "useAccountData must be wrapped in a <AccountDataProvider />"
      );
    }
  }
  return value;
};

export { useApp, useModal, useAccountData };
