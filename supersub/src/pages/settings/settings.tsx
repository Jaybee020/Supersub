import "./settings.scss";
import axios from "axios";
import ApiKey from "./api-key";
import { useApp } from "contexts";
import { usePrivy } from "@privy-io/react-auth";
import { useQuery } from "@tanstack/react-query";
import EmptyState from "components/common/empty-state";
import { CaretDoubleRight } from "@phosphor-icons/react";
import { useState } from "react";
import { ClipLoader } from "react-spinners";
import { toast } from "sonner";

const Settings = () => {
  // FETCH API KEYS
  const { smartAddress, uninstallPlugin } = useApp();
  const { getAccessToken } = usePrivy();
  const [loading, setLoading] = useState(false);
  const [destination, setDestination] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);

  const { data, isLoading, error } = useQuery({
    enabled: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
    queryKey: ["email", smartAddress],
    queryFn: async () => {
      const token = await getAccessToken();
      return await axios
        .get(`/api/email/${smartAddress}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) =>
          res.data.data.email ? setDestination(res.data.data.email) : "No Email"
        );
    },
  });

  return (
    <div className="settings base-page">
      <div className="base-page__header">
        <h2>Settings & Preferences</h2>
        <p>Manage your account settings</p>
      </div>

      {!data || error || isLoading ? (
        <>
          <EmptyState
            error={error}
            isLoading={isLoading}
            data={{
              message: "No Email created yet",
              loadingText: "Fetching Email...",
              errorMessage: "An error occurred while fetching Email",
            }}
          />
        </>
      ) : (
        <div className="base-page__body">
          <div className="base-input">
            <div className="base-input__block padded">
              <input
                value={destination}
                placeholder="Set Notification Email"
                onChange={(e) =>
                  setDestination(e.target.value as `0x${string}`)
                }
              />
              <p
                style={{
                  color: "#ccc",
                  fontSize: "12px",
                }}
              >
                {/* Current: {"0x"} */}
              </p>
            </div>
          </div>
          <button
            disabled={loading}
            className={`base-btn`}
            onClick={async () => {
              try {
                // uninstallPlugin();
                if (loading) return;

                setLoading(true);
                await axios
                  .put(`/api/email/${smartAddress}`, {
                    email: destination,
                  })
                  .then((res) => res?.data?.data?.email);
                toast.success("Email updated successfully");
              } catch (error) {
                toast.error("Failed to update email");
              }
            }}
          >
            <p>Update</p>
            {!loading ? (
              <div className="base-btn__icon">
                <CaretDoubleRight size={15} weight="bold" />
              </div>
            ) : (
              <div className="c-spinner">
                <ClipLoader
                  size={16}
                  color={"#fff"}
                  loading={true}
                  aria-label="Loading Spinner"
                />
              </div>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default Settings;
