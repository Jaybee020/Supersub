import Modal from "react-modal";
import { ReactNode, ReactElement, createContext, useState } from "react";

import { useApp } from "contexts";
import { Modals } from "./AppProvider";
import EditProductModal from "components/modals/edit-product";
import CreateProductModal from "components/modals/create-product";
import ProductPreviewModal from "components/modals/product-preview";

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

        openModal,
        closeModal,
        openEditProductModal,
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
  activeModal: string;

  closeModal: () => void;
  openModal: (modal: Modals) => void;
  openEditProductModal: (product: any) => void;
}

export const ModalContext = createContext<ModalContextType>(
  {} as ModalContextType
);
