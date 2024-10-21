import { useState } from "react";
import Searchbar from "components/common/searchbar";
import { ArrowUp, ArrowUpRight } from "@phosphor-icons/react";
import WalletIcon from "components/common/wallet-icon";

const AccountHistory = () => {
  const [searchTxn, searchTxns] = useState("");

  return (
    <div className="account-tabs--history">
      <div className="account-tabs--history__filters">
        <Searchbar
          value={searchTxn}
          onChange={searchTxns}
          placeholder="Name, Token, ID..."
        />
      </div>

      <div className="acct-history">
        {[
          {
            date: "May 10, 2024",
            items: [
              {
                icon: <ArrowUp size={16} weight="regular" />,

                date: "04:35 PM",
                platform: "Spotify",
                amount: "$20.22",
                transactionType: "Recurring Payment",
                transactionHash: "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0",
                iconUrl:
                  "https://asset.brandfetch.io/id20mQyGeY/ide1xH4k4a.png",
              },
              {
                icon: <ArrowUp size={16} weight="regular" />,

                date: "10:55 AM",
                platform: "Youtube",
                amount: "$103.78",
                transactionType: "One Time Payment",
                transactionHash: "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0",
                iconUrl:
                  "https://asset.brandfetch.io/idVfYwcuQz/id8hkaZwOR.png",
              },
              {
                icon: <ArrowUp size={16} weight="regular" />,

                date: "10:55 AM",
                platform: "alphaglitch.eth",
                amount: "$103.78",
                transactionType: "Withdrawal",
                address: "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0",
                transactionHash: "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0",
                iconUrl:
                  "https://asset.brandfetch.io/idVfYwcuQz/id8hkaZwOR.png",
              },
            ],
          },
        ].map((item, index) => {
          return (
            <div key={index} className="history-group">
              <div className="history-group__header">
                <p>{item.date}</p>
              </div>

              <div className="history-group__items">
                {item.items.map((item, index) => {
                  return (
                    <div key={index} className="history-item">
                      <div className="r-block">
                        <div className="details-block">
                          <div className="details-block--icon">{item.icon}</div>

                          <div className="details-block--info">
                            <p className="main">{item.amount}</p>
                            <p className="sub">{item.date}</p>
                          </div>
                        </div>

                        <div className="details-block">
                          <div className="details-block--icon no-border">
                            {item?.address ? (
                              <WalletIcon address={item.address} size={28} />
                            ) : (
                              <img src={item.iconUrl} alt="" />
                            )}
                          </div>

                          <div className="details-block--info">
                            <p className="main">{item.platform}</p>
                            <p className="sub">{item.transactionType}</p>
                          </div>
                        </div>

                        <div className="explorer-link">
                          <a
                            href={`https://etherscan.io/tx/${item.transactionHash}`}
                          >
                            <ArrowUpRight size={16} weight="regular" />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AccountHistory;
