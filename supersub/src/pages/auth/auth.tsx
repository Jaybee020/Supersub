import "./auth.scss";
import { useApp } from "contexts";
import {
  ShieldCheck,
  Infinity,
  Fingerprint,
  ArrowRight,
} from "@phosphor-icons/react";

const Auth = () => {
  const { login, ready, authenticated, isMfaEnabled, isSmartAccountReady } =
    useApp();

  return (
    <div className="auth">
      <div className="auth-block get-started">
        <div className="get-started__logo">
          <Infinity size={54} weight="light" />
          <p>Super Sub</p>
        </div>

        <div className="get-started__body">
          <h3>
            Manage
            <br />
            your subs & <br />
            payments <br /> in one place.
          </h3>

          <button onClick={() => login()}>
            {authenticated && !isMfaEnabled ? (
              <>
                <p>Link Passkey</p>
                <Fingerprint size={17} weight="regular" />
              </>
            ) : (
              <>
                <p>Get Started </p>
                <ArrowRight size={17} weight="regular" />
              </>
            )}
          </button>
        </div>
      </div>

      <div className="auth-block features">
        {[
          {
            illustration: "./assets/images/illustrations/8.webp",
            icon: (
              <ShieldCheck
                size={54}
                weight="light"
                className="features--block__icon"
              />
            ),
            smallText: "Secure payments with your passkey",
          },
          {
            illustration: "./assets/images/illustrations/1.webp",
            largeText: "40+",
            smallText: "Connect Supersub to your favorite platforms",
          },
          {
            illustration: "./assets/images/illustrations/6.webp",
            largeText: "23X",
            smallText: "Time saved with Recurring payments",
          },
          {
            illustration: "./assets/images/illustrations/1.svg",
            largeText: "",
            smallText: "Analytics to track where your money goes with ease",
          },
        ].map((item, index) => {
          return (
            <div key={index} className="features--block">
              <div className="features--block__text">
                {item.icon ? item.icon : <h1>{item.largeText}</h1>}
                <p>{item.smallText}</p>
              </div>

              {item.illustration && (
                <div className="features--block__illustration">
                  <img src={item.illustration} alt="" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Auth;
