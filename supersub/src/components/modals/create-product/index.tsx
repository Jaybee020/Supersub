import "./create-product.scss";
import { toast } from "sonner";
import { nanoid } from "nanoid";
import { useApp } from "contexts";
import AddPlans from "./screens/addPlans";
import { ClipLoader } from "react-spinners";
import { parseUnits, isAddress } from "viem";
import ProductForm from "./screens/productForm";
import { ISubscriptionPlan } from "types/subscription";
import { useEffect, useMemo, useRef, useState } from "react";
import { supportedChains, supportedTokens } from "constants/data";
import { ArrowLeft, CameraPlus, CaretDoubleRight } from "@phosphor-icons/react";
import { defaultChain } from "utils/wagmi";

const CreateProductModal = () => {
  const { createProduct } = useApp();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [recipient, setRecipient] = useState("");
  const [chargeToken, setChargeToken] = useState(
    supportedTokens["0x036CbD53842c5426634e7929541eC2318f3dCF7e"]
  );
  const [destinationChain, setDestinationChain] = useState(
    supportedChains["base_sepolia"]
  );

  const [loading, setLoading] = useState(false);
  const [screen, setScreen] = useState<"product" | "plans">("product");

  // HANDLE IMAGE UPLOAD
  const imageRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | undefined>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onSelectFile = (e: any) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setSelectedFile(e.target.files[0]);
  };

  useEffect(() => {
    // create the preview
    if (!selectedFile) return;
    const objectUrl = URL.createObjectURL(selectedFile as Blob);
    setPreview(objectUrl);

    // free memory when ever this component is unmounted
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  // SUBSCRIPTION PLANS
  const [plans, updatePlans] = useState<ISubscriptionPlan[]>([
    {
      id: nanoid(),
      amount: "",
      interval: "",
      timeframe: "days",
    },
  ]);

  const productData = useMemo(() => {
    const plansFormated = plans.map((plan) => {
      return {
        price: Number(parseUnits(plan?.amount || "", chargeToken.decimals)),
        chargeInterval:
          Number(plan.interval) *
          (plan.timeframe === "days"
            ? 86400
            : plan.timeframe === "weeks"
              ? 604800
              : plan.timeframe === "months"
                ? 2629743
                : plan.timeframe === "years"
                  ? 31556926
                  : 0),
      };
    });

    return {
      name,
      description,
      image: selectedFile,
      plans: plansFormated,
      recipient: recipient as `0x${string}`,
      destinationChain: destinationChain.chain_id,
      chargeToken: chargeToken.address as `0x${string}`,
    };
  }, [
    name,
    plans,
    recipient,
    description,
    chargeToken,
    selectedFile,
    destinationChain,
  ]);

  const changeScreen = async () => {
    if (name.trim().length < 3 || name.trim().length > 32) {
      toast.error("Product name must be between 3 and 32 characters");
      return;
    }
    if (description.trim().length < 1 || description.trim().length > 200) {
      toast.error("Product description must be between 1 and 200 characters");
      return;
    }
    if (!isAddress(recipient)) {
      toast.error("Invalid recipient address");
      return;
    }
    if (!chargeToken) {
      toast.error("Please select a charge token");
      return;
    }

    setScreen("plans");
  };

  const createNewProduct = async () => {
    if (loading) return;

    // VALIDATE EACH PLAN
    for (let i = 0; i < plans.length; i++) {
      const plan = plans[i];

      if (plan.amount === "" || plan.interval === "") {
        toast.error("Please fill all plan fields");
        return;
      }
    }

    setLoading(true);
    try {
      await createProduct({
        ...productData,
      });
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="base-modal create-product">
      <div className="base-modal--action-btns">
        {screen === "plans" && (
          <button onClick={() => setScreen("product")}>
            <ArrowLeft size={16} weight="bold" />
          </button>
        )}
      </div>

      <div className="c-img-input">
        <div
          className="c-img-input__preview"
          onClick={() => {
            if (imageRef.current) {
              imageRef.current.click();
            }
          }}
        >
          <img
            alt="preview"
            src={preview || "./assets/images/illustrations/4.webp"}
          />
          <input
            type="file"
            ref={imageRef}
            accept="image/*"
            multiple={false}
            name="supersub-[image]"
            onChange={onSelectFile}
            className="image-file-input"
          />

          <button className="add-image-btn">
            <CameraPlus size={18} weight="regular" />
          </button>
        </div>
      </div>

      {screen === "product" ? (
        <ProductForm
          name={name}
          setName={setName}
          recipient={recipient}
          description={description}
          setRecipient={setRecipient}
          setDescription={setDescription}
          setChargeToken={setChargeToken}
          setDestinationChain={setDestinationChain}
        />
      ) : (
        <AddPlans
          plans={plans}
          updatePlans={updatePlans}
          chargeToken={chargeToken}
        />
      )}

      <div
        className={`base-btn ${loading ? "disabled" : ""}`}
        onClick={() => {
          if (screen === "product") {
            changeScreen();
          } else {
            createNewProduct();
          }
        }}
      >
        <p>
          {screen === "product"
            ? "Next — Add subscription plans"
            : "Create product"}
        </p>

        {!loading && (
          <div className="base-btn__icon">
            <CaretDoubleRight size={15} weight="bold" />
          </div>
        )}

        {loading && (
          <div className="c-spinner">
            <ClipLoader
              size={16}
              color={"#fff"}
              loading={loading}
              aria-label="Loading Spinner"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateProductModal;
