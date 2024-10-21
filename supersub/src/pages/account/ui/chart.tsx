import { maxBy } from "lodash";
import testdata from "./test-data";
import { useMeasure } from "react-use";
import { useAccountData, useApp } from "contexts";
import WalletIcon from "components/common/wallet-icon";
import { Area, Tooltip, AreaChart, YAxis } from "recharts";
import { truncate } from "utils/HelperUtils";

const AccountChart = () => {
  const { smartAddress } = useApp();
  const [chartElem, { width: chartWidth, height: chartHeight }] = useMeasure();

  const { acctBalance, activeCurrency } = useAccountData();

  return (
    <div className="account-chart">
      <div className="account-chart__header">
        <WalletIcon address={smartAddress!} size={30} />
        <div className="details">
          <div className="acct-address">{truncate(smartAddress!, 18)}</div>
          <div className="acct-balance__eth">
            {acctBalance?.total.toFixed(2)} <span>{activeCurrency.name}</span>
          </div>
        </div>
      </div>

      <div ref={chartElem as any} className="account-chart__body">
        <AreaChart data={testdata} width={chartWidth} height={chartHeight}>
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#099b63" stopOpacity={0.1} />
              <stop offset="75%" stopColor="#111" stopOpacity={0} />
            </linearGradient>
          </defs>

          <YAxis
            hide
            domain={[0, Number(maxBy(testdata, "balance")?.balance) + 50]}
          />

          <Tooltip
            cursor={{
              stroke: "#bbb",
              strokeWidth: 0.8,
              strokeDasharray: "3 3",
            }}
            position={{ y: -10 }}
            content={({ payload }) => {
              return (
                <div className="chart-tooltip">
                  <p className="chart-tooltip__balance">
                    {`$${
                      payload?.[0]?.value
                        ? (payload[0].value as Number).toFixed(2)
                        : "0.00"
                    }`}
                  </p>
                  <p className="chart-tooltip__date">May 12, 2024, 01:56 PM</p>
                </div>
              );
            }}
          />

          <Area
            type="basis"
            // type="bump"
            fillOpacity={1}
            stroke="#099b63"
            dataKey="balance"
            strokeWidth={1.3}
            fill="url(#colorUv)"
          />
        </AreaChart>
      </div>

      <div className="account-chart__footer">
        {["1H", "1D", "1W", "1M", "1Y", "Max"].map((item, index) => {
          return (
            <div key={index} className="timeframe" data-active={index === 1}>
              {item}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AccountChart;
