import "./settings.scss";
import axios from "axios";
import ApiKey from "./api-key";
import { useApp } from "contexts";
import { usePrivy } from "@privy-io/react-auth";
import { useQuery } from "@tanstack/react-query";
import EmptyState from "components/common/empty-state";

const Settings = () => {
  // FETCH API KEYS
  const { smartAddress } = useApp();
  const { getAccessToken } = usePrivy();

  const { data, isLoading, error } = useQuery({
    enabled: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
    queryKey: ["apiKeys", smartAddress],
    queryFn: async () => {
      const token = await getAccessToken();
      return await axios
        .get(`/api/api-keys`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => res?.data?.data);
    },
  });

  return (
    <div className="settings base-page">
      <div className="base-page__header">
        <h2>API'S & Preferences</h2>
        <p>Copy API keys to integrate Super Sub with your favorite platforms</p>
      </div>

      {!data || error || isLoading ? (
        <>
          <EmptyState
            error={error}
            isLoading={isLoading}
            data={{
              message: "No Api keys created yet",
              loadingText: "Fetching Api keys...",
              errorMessage: "An error occurred while fetching Api keys",
            }}
          />
        </>
      ) : (
        <div className="base-page__body">
          {(data ? Object.keys(data) : []).map((itemKey, index) => {
            return (
              <ApiKey key={index} itemKey={itemKey} itemValue={data[itemKey]} />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Settings;
