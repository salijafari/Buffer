import { useDashboardShell } from "../../context/DashboardShellContext";
import { CreditPreConnection } from "./CreditPreConnection";
import { CreditPostConnection } from "./CreditPostConnection";

export { CreditGraduationRail } from "./CreditGraduationRail";

export function CreditScreen() {
  const { connectionMode } = useDashboardShell();
  return connectionMode === "pre" ? <CreditPreConnection /> : <CreditPostConnection />;
}
