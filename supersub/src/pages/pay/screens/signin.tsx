import { useApp } from "contexts";
import { Fingerprint } from "@phosphor-icons/react";

const SigninToPay = () => {
  const { login } = useApp();

  return (
    <>
      <div className="signin-block">
        <Fingerprint size={54} weight="light" />

        <p>You need to sign in to your account to pay for this</p>
      </div>

      <button
        className={`base-btn`}
        onClick={() => {
          login();
        }}
      >
        <p>Sign in to Super Sub</p>
      </button>
    </>
  );
};

export default SigninToPay;
