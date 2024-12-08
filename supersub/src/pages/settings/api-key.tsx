import { useState } from "react";
import { CheckCircle, CopySimple, Eye, EyeClosed } from "@phosphor-icons/react";

interface ApiKeyProps {
  itemKey: string;
  itemValue: string;
}

const ApiKey = ({ itemKey, itemValue }: ApiKeyProps) => {
  const [show, setShow] = useState(false);

  const [copied, setCopied] = useState(false);
  const copyKey = (key: string) => {
    setCopied(true);
    navigator.clipboard.writeText(key!);
    setTimeout(() => setCopied(false), 1100);
  };

  return (
    <div className="settings-item">
      <div className="r-block">
        <div className="details-block">
          <div
            style={{
              cursor: "pointer",
            }}
            className="details-block--icon"
            onClick={() => {
              setShow(!show);
            }}
          >
            {show ? (
              <Eye size={18} weight="light" />
            ) : (
              <EyeClosed size={18} weight="light" />
            )}
          </div>
          {/* 
          <div className="details-block--info">
            <p className="sub no-transform">{itemKey}</p>
            <p className="main">{show ? itemValue : "*********************"}</p>
          </div> */}
        </div>

        <div className="copy-btn">
          <button onClick={() => copyKey(itemValue)}>
            {copied ? (
              <CheckCircle size={18} weight="fill" color="#0ecb81" />
            ) : (
              <CopySimple size={18} weight="regular" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKey;
