import Modal from "react-modal";
import { ReactNode, ReactElement, createContext, useState } from "react";

import { useApp } from "contexts";
import { Modals } from "./AppProvider";
import EditProductModal from "components/modals/edit-product";
import CreateProductModal from "components/modals/create-product";
import ProductPreviewModal from "components/modals/product-preview";
import EditSubscriptionModal from "components/modals/edit-subscription";
import EditPlanModal from "components/modals/edit-plan";

Modal.setAppElement("#root");

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  },
};

const ModalProvider = ({ children }: ModalProviderProps) => {
  const { modalStatus, setModalStatus, activeModal, setActiveModal } = useApp();

  const openModal = (modal: Modals) => {
    setActiveModal(modal);
    setModalStatus(true);
  };

  // EDIT PROUCTS MODAL
  const [activeProduct, setActiveProduct] = useState<any>(null);
  const openEditProductModal = (product: any) => {
    setActiveProduct(product);
    openModal("edit-product");
  };

  //EDIT PLAN MODAL
  const [activePlan, setActivePlan] = useState<any>(null);
  const openEditPlanModal = (plan: any) => {
    setActivePlan(plan);
    openModal("edit-plan");
  };
  //EDIT SUBSCRIPTION MODAL
  const [activeSubscription, setActiveSubscription] = useState<any>(null);
  const openEditSubscriptionModal = (subscription: any) => {
    setActiveSubscription(subscription);
    openModal("edit-subscription");
  };

  // CLOSE MODAL
  const closeModal = () => {
    setModalStatus(false);
    activeModal && setActiveModal("create-product");
  };

  return (
    <ModalContext.Provider
      value={{
        activeModal,
        activeProduct,
        activePlan,
        activeSubscription,

        openModal,
        closeModal,
        openEditProductModal,
        openEditPlanModal,
        openEditSubscriptionModal,
      }}
    >
      <>
        <Modal
          style={customStyles}
          isOpen={modalStatus}
          onRequestClose={closeModal}
          bodyOpenClassName={"modal-open"}
        >
          {activeModal === "create-product" ? (
            <CreateProductModal />
          ) : activeModal === "product-preview" ? (
            <ProductPreviewModal />
          ) : activeModal === "edit-product" ? (
            <EditProductModal />
          ) : activeModal === "edit-plan" ? (
            <EditPlanModal />
          ) : activeModal === "edit-subscription" ? (
            <EditSubscriptionModal />
          ) : null}
        </Modal>

        {children}
      </>
    </ModalContext.Provider>
  );
};

export default ModalProvider;

interface ModalProviderProps {
  children: ReactElement[] | ReactElement | ReactNode;
}

interface ModalContextType {
  activeProduct: any;
  activePlan: any;
  activeSubscription: any;
  activeModal: string;

  closeModal: () => void;
  openModal: (modal: Modals) => void;
  openEditProductModal: (product: any) => void;
  openEditPlanModal: (plan: any) => void;
  openEditSubscriptionModal: (subscription: any) => void;
}

export const ModalContext = createContext<ModalContextType>(
  {} as ModalContextType
);
