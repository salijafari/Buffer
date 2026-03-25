import { useDashboardShell } from "../../context/DashboardShellContext";
import { PayoffPreConnection } from "./PayoffPreConnection";
import { PayoffPostConnection } from "./PayoffPostConnection";

export function PayoffScreen() {
  const { connectionMode, plaidConnected } = useDashboardShell();
  const usePlaidLiveDataOnly = connectionMode === "post" && plaidConnected === true;
  if (connectionMode === "pre") {
    return <PayoffPreConnection />;
  }
  return <PayoffPostConnection usePlaidLiveDataOnly={usePlaidLiveDataOnly} />;
}
