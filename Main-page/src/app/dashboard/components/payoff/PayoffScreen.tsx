import { useDashboardShell } from "../../context/DashboardShellContext";
import { PayoffPreConnection } from "./PayoffPreConnection";
import { PayoffPostConnection, type PayoffRailMetrics } from "./PayoffPostConnection";

export type { PayoffRailMetrics };

export function PayoffScreen({
  onPayoffMetrics,
}: {
  onPayoffMetrics?: (m: PayoffRailMetrics | null) => void;
}) {
  const { connectionMode, plaidConnected } = useDashboardShell();
  const usePlaidLiveDataOnly = connectionMode === "post" && plaidConnected === true;
  if (connectionMode === "pre") {
    return <PayoffPreConnection />;
  }
  return (
    <PayoffPostConnection usePlaidLiveDataOnly={usePlaidLiveDataOnly} onPayoffMetrics={onPayoffMetrics} />
  );
}
