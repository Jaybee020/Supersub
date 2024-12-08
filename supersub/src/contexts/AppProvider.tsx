import axios from "axios";
import { toast } from "sonner";
import { WalletClientSigner, SmartAccountClient } from "@aa-sdk/core";
import { generateSmartWallet } from "utils/WalletUtils";
import { MultiOwnerModularAccount } from "@account-kit/smart-contracts";
import useUrlParams from "hooks/useURLParams";
import {
  useState,
  useEffect,
  ReactNode,
  ReactElement,
  createContext,
} from "react";
import {
  usePrivy,
  useLogin,
  useWallets,
  ConnectedWallet,
  useMfaEnrollment,
} from "@privy-io/react-auth";

// SUBSCRIPTION PLUGINS SETUP
import PluginClient from "contracts/subscriptionPlugin";
import { ICreateProductArgs, IRecurringPaymentArgs } from "types/PluginMethods";

export type Modals =
  | "payment"
  | "create-product"
  | "product-preview"
  | "edit-product"
  | "edit-plan"
  | "edit-subscription";

const AppProvider = ({ children }: AppProviderProps) => {
  // MODAL STATE
  const params = useUrlParams();
  const [modalStatus, setModalStatus] = useState(false);
  const [activeModal, setActiveModal] = useState<Modals>("create-product");

  // SMART WALLET STATE
  const [isSmartAccountReady, setIsSmartAccountReady] = useState(false);
  const [smartAccountClient, setSmartAccountClient] =
    useState<SmartAccountClient | null>(null);
  const [smartAccount, setSmartAccount] =
    useState<MultiOwnerModularAccount<WalletClientSigner> | null>(null);

  // **
  // SUBSCRIPTION PLUGINS CLIENT
  // **
  const [pluginClient, setPluginClient] = useState<PluginClient | null>(null);

  // PRIVY HOOKS
  const { wallets } = useWallets();
  const { ready, authenticated, user } = usePrivy();
  const { showMfaEnrollmentModal } = useMfaEnrollment();
  const { login } = useLogin({
    onOAuthLoginComplete: () => {
      showMfaEnrollmentModal();
    },
  });

  // COMPUTED PRIVY VALUES
  const isMfaEnabled = (user?.mfaMethods.length ?? 0) > 0;
  const embeddedWallet = wallets.find(
    (wallet) => wallet.walletClientType === "privy"
  );

  // LOGIN USER
  const userLogin = async () => {
    if (!authenticated) {
      login();
    } else if (!isMfaEnabled) {
      showMfaEnrollmentModal();
    }
  };

  // CREATE SMART WALLET
  const createSmartWallet = async (privyEoa: ConnectedWallet) => {
    const { account, pluginClient, smartAccountClient } =
      await generateSmartWallet(privyEoa);

    setSmartAccount(account);
    setPluginClient(pluginClient);
    setSmartAccountClient(smartAccountClient);
    setIsSmartAccountReady(true);
    //install plugin if it is not installed
    const isPluginInstalled = await pluginClient.isPluginInstalled();
    if (!isPluginInstalled) {
      await pluginClient.installPlugin();
    }
  };

  // IF EMBEDDED WALLET IS AVAILABLE,
  // CREATE SMART WALLET
  useEffect(() => {
    embeddedWallet?.address ? createSmartWallet(embeddedWallet) : null;
  }, [embeddedWallet?.address]);

  // **
  // SUBSCRIPTION PLUGINS METHODS
  // **

  // UPLOAD IMAGE TO CLOUDINARY
  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
    );

    const res = await axios.post(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
      formData
    );

    return res.data;
  };

  // CREATE PRODUCT WITH PLANS
  const createProduct = async (productData: ICreateProductArgs) => {
    if (!pluginClient) return;

    const {
      name,
      image,
      plans,
      description,
      recipient,
      chargeToken,
      destinationChain,
    } = productData;

    let logoUrl =
      "https://res.cloudinary.com/alphaglitch/image/upload/v1717259453/eq5qecksgo2ilp1pye2u.webp";

    if (image) {
      try {
        const imageRes = await uploadImage(image as File);
        logoUrl = imageRes.secure_url;
      } catch (error) {
        console.error(error);
      }
    }

    try {
      const product = await pluginClient.createProduct(
        name,
        description,
        logoUrl,
        1,
        plans.map((plan) => ({
          price: plan.price,
          chargeInterval: plan.chargeInterval,
          receivingAddress: recipient,
          destinationChain,
          tokenAddress: chargeToken,
        }))
      );

      // CLOSE MODAL
      toast.success("Product created successfully");
      setModalStatus(false);
    } catch (error: any) {
      toast.error(
        "Failed to create product" +
          (error?.details
            ? " with code " + JSON.parse(error?.details)?.code
            : ""),
        {
          description: error?.details
            ? JSON.parse(error?.details)?.message
            : undefined,
        }
      );
    }
  };

  // UPDATE PRODUCT
  const updateProduct = async (
    productId: number,
    recipient: `0x${string}`,
    destinationChain: number,
    isActive: boolean
  ) => {
    if (!pluginClient) return;

    try {
      const product = await pluginClient.updateProduct(productId, isActive);

      // CLOSE MODAL
      toast.success("Product updated successfully");
      setModalStatus(false);
    } catch (error: any) {
      toast.error(
        "Failed to update product" +
          (error?.details
            ? " with code " + JSON.parse(error?.details)?.code
            : ""),
        {
          description: error?.details
            ? JSON.parse(error?.details)?.message
            : undefined,
        }
      );
    }
  };

  const subscribeToPlan = async (
    planId: number,
    endTime: number,
    paymentToken?: string,
    beneficiary?: string,
    paymentTokenSwapFee?: number
  ) => {
    if (!pluginClient) return;

    try {
      const hash = await pluginClient.subscribe(
        planId,
        endTime,
        paymentToken,
        beneficiary,
        paymentTokenSwapFee
      );

      console.log("subscribe hash", hash);
      toast.success("Successfully subscribed to plan");
    } catch (error: any) {
      toast.error(
        "Failed to subscribe to plan" +
          (error?.details
            ? " with code " + JSON.parse(error?.details)?.code
            : ""),
        {
          description: error?.details
            ? JSON.parse(error?.details)?.message
            : undefined,
        }
      );
    }

    // const { planId, endTime, paymentToken, beneficiary, paymentTokenSwapFee } =
    //   susbscribeData;
  };

  const unsubscribeToPlan = async (planId: number, beneficiary: string) => {
    if (!pluginClient) return;

    try {
      const subscription = await pluginClient.unSubscribe(planId, beneficiary);

      // CLOSE MODAL
      toast.success("Subscription cancelled successfully");
      setModalStatus(false);
    } catch (error: any) {
      toast.error(
        "Failed to cancel subscription" +
          (error?.details
            ? " with code " + JSON.parse(error?.details)?.code
            : ""),
        {
          description: error?.details
            ? JSON.parse(error?.details)?.message
            : undefined,
        }
      );
    }
  };

  // CREATE RECURRING PAYMENT
  const createRecurringPayment = async (productData: IRecurringPaymentArgs) => {
    try {
      if (!pluginClient) return;

      const {
        initPlan,
        endTime,
        paymentToken,
        paymentTokenSwapFee,
        description,
      } = productData;

      const hash = await pluginClient.createRecurringPayment(
        //@ts-ignore
        initPlan,
        endTime,
        paymentToken,
        paymentTokenSwapFee,
        description
      );

      return hash;
    } catch (error: any) {
      toast.error(
        `Failed to create recurring payment` +
          (error?.details
            ? " with error code " + JSON.parse(error?.details)?.code
            : ""),
        {
          description: error?.details
            ? JSON.parse(error?.details)?.message
            : undefined,
        }
      );
    }
  };

  // TRANSFER FUNDS
  const transferFunds = async (
    value: number,
    tokenAddr: string,
    recipient: string,
    chainSelector: bigint,
    shouldBridge: boolean = false
  ) => {
    if (!pluginClient) return;

    if (shouldBridge) {
      const hash = await pluginClient.bridgeAsset(
        chainSelector,
        recipient,
        tokenAddr,
        value
      );

      return hash;
    } else {
      const hash = await pluginClient.sendToken(
        tokenAddr,
        recipient,
        BigInt(value)
      );

      return hash;
    }
  };

  const updatePlan = async (
    planId: number,
    recipient: `0x${string}`,
    destinationChain: number,
    isActive: boolean
  ) => {
    if (!pluginClient) return;

    try {
      const hash = await pluginClient.updatePlan(
        planId,
        recipient,
        destinationChain,
        isActive
      );

      // return hash;
    } catch (error: any) {
      toast.error(
        `Failed to update plan` +
          (error?.details
            ? " with error code " + JSON.parse(error?.details)?.code
            : ""),
        {
          description: error?.details
            ? JSON.parse(error?.details)?.message
            : undefined,
        }
      );
    }
  };

  const updateSubscription = async (
    planId: number,
    beneficiary: `0x${string}`,
    paymentTokenAddress: `0x${string}`,
    endTime: number,
    paymentTokenSwapFee?: number
  ) => {
    if (!pluginClient) return;

    try {
      const hash = await pluginClient.changeSubscriptionPlanPaymentInfo(
        planId,
        endTime,
        paymentTokenAddress,
        beneficiary,
        paymentTokenSwapFee
      );

      // return hash;
    } catch (error: any) {
      toast.error(
        `Failed to update subscription` +
          (error?.details
            ? " with error code " + JSON.parse(error?.details)?.code
            : ""),
        {
          description: error?.details
            ? JSON.parse(error?.details)?.message
            : undefined,
        }
      );
    }
  };

  const uninstallPlugin = async () => {
    if (pluginClient) {
      const hash = await pluginClient.uninstallPlugin();
      return hash;
    }
  };

  return (
    <AppContext.Provider
      value={{
        ready,
        isMfaEnabled,
        authenticated,
        isSmartAccountReady,
        smartAddress: smartAccount?.address,
        params,
        login: userLogin,
        updatePlan,
        updateSubscription,
        subscribeToPlan,
        uninstallPlugin,
        unsubscribeToPlan,
        transferFunds,
        createProduct,
        updateProduct,
        createRecurringPayment,

        // MODAL STATE
        modalStatus,
        activeModal,
        setModalStatus,
        setActiveModal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;

interface AppProviderProps {
  children: ReactElement[] | ReactElement | ReactNode;
}

interface AppContextType {
  // user: User | null;
  ready: boolean;
  isMfaEnabled: boolean;
  authenticated: boolean;
  isSmartAccountReady: boolean;
  smartAddress: string | undefined;
  params: Record<string, string>;
  login: () => void;

  unsubscribeToPlan: (planId: number, beneficiary: string) => Promise<void>;
  uninstallPlugin: () => Promise<void>;
  subscribeToPlan: (
    planId: number,
    endTime: number,
    paymentToken?: string,
    beneficiary?: string,
    paymentTokenSwapFee?: number
  ) => Promise<void>;
  transferFunds: (
    value: number,
    tokenAddr: string,
    recipient: string,
    chainSelector: bigint,
    shouldBridge?: boolean
  ) => Promise<string | undefined>;
  updateProduct: (
    productId: number,
    recipient: `0x${string}`,
    destinationChain: number,
    isActive: boolean
  ) => Promise<void>;
  updatePlan: (
    planId: number,
    recipient: `0x${string}`,
    destinationChain: number,
    isActive: boolean
  ) => Promise<void>;
  updateSubscription: (
    planId: number,
    beneficiary: `0x${string}`,
    paymentTokenAddress: `0x${string}`,
    endTime: number,
    paymentTokenSwapFee?: number
  ) => Promise<void>;
  createProduct: (productData: ICreateProductArgs) => Promise<void>;
  createRecurringPayment: (
    productData: IRecurringPaymentArgs
  ) => Promise<string | undefined>;

  // MODAL STATE
  modalStatus: boolean;
  activeModal: Modals;
  setActiveModal: (modal: Modals) => void;
  setModalStatus: (status: boolean) => void;
}

export const AppContext = createContext<AppContextType>({} as AppContextType);
