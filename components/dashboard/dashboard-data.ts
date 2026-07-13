export type DashboardSeverity =
  | "neutral"
  | "healthy"
  | "warning"
  | "critical"
  | "info";

export type DashboardIcon =
  | "activity"
  | "alert"
  | "clock"
  | "cpu"
  | "dollar"
  | "radio"
  | "shield"
  | "trend"
  | "users";

export type DashboardMetric = {
  label: string;
  value: string;
  unit?: string;
  delta: string;
  deltaPositive?: boolean;
  detail?: string;
  severity?: DashboardSeverity;
  icon: DashboardIcon;
  href?: string;
};

export type TrendPoint = {
  label: string;
  value: number;
};

export type EquipmentLine = {
  name: string;
  value: number;
  severity: DashboardSeverity;
};

export type SensorGroup = {
  label: string;
  value: string;
  detail: string;
  severity: DashboardSeverity;
};

export type ActivityEvent = {
  title: string;
  detail: string;
  time: string;
  code: string;
  severity: DashboardSeverity;
};

export const operationalMetrics: DashboardMetric[] = [
  {
    label: "Production Output",
    value: "1,410",
    unit: "units/hr",
    delta: "+5.9% vs yesterday",
    deltaPositive: true,
    icon: "cpu",
  },
  {
    label: "OEE Efficiency",
    value: "83",
    unit: "%",
    delta: "2.1% below target",
    deltaPositive: false,
    severity: "warning",
    icon: "activity",
  },
  {
    label: "Unplanned Downtime",
    value: "2.8",
    unit: "hrs",
    delta: "40% above target",
    deltaPositive: false,
    severity: "critical",
    icon: "clock",
    href: "/downtime",
  },
  {
    label: "Active Sensors",
    value: "147",
    unit: "/ 152",
    delta: "5 sensors offline",
    deltaPositive: false,
    detail: "97% availability",
    icon: "radio",
    href: "/sensors",
  },
  {
    label: "Quality Score",
    value: "97.3",
    unit: "%",
    delta: "+1.5% vs last week",
    deltaPositive: true,
    severity: "healthy",
    icon: "trend",
  },
];

export const governanceMetrics: DashboardMetric[] = [
  {
    label: "Active Policies",
    value: "18",
    delta: "92% compliance",
    deltaPositive: true,
    icon: "shield",
    href: "/governance",
  },
  {
    label: "Governance Alerts",
    value: "4",
    delta: "1 requires escalation",
    deltaPositive: false,
    detail: "1 critical",
    severity: "critical",
    icon: "alert",
    href: "/governance",
  },
  {
    label: "Revenue MTD",
    value: "$2.4M",
    delta: "+8.2% vs last month",
    deltaPositive: true,
    icon: "dollar",
    href: "/financial",
  },
  {
    label: "Cost per Unit",
    value: "$4.18",
    delta: "2.3% optimized",
    deltaPositive: true,
    icon: "dollar",
  },
  {
    label: "Active Users",
    value: "142",
    delta: "+2 this week",
    deltaPositive: true,
    icon: "users",
    href: "/users",
  },
];

export const productionTrend: TrendPoint[] = [
  { label: "06:00", value: 1180 },
  { label: "08:00", value: 1240 },
  { label: "10:00", value: 1320 },
  { label: "12:00", value: 1250 },
  { label: "14:00", value: 1375 },
  { label: "16:00", value: 1330 },
  { label: "18:00", value: 1410 },
];

export const equipmentHealth: EquipmentLine[] = [
  { name: "Line A — Assembly", value: 92, severity: "healthy" },
  { name: "Line B — Welding", value: 76, severity: "warning" },
  { name: "Line C — Packaging", value: 88, severity: "healthy" },
  { name: "Line D — Inspection", value: 61, severity: "critical" },
  { name: "Line E — Testing", value: 95, severity: "healthy" },
];

export const sensorGroups: SensorGroup[] = [
  { label: "Flow Meters", value: "24 / 24", detail: "Zones A, B, C", severity: "healthy" },
  { label: "Temperature Probes", value: "38 / 40", detail: "2 degraded", severity: "warning" },
  { label: "Pressure Sensors", value: "18 / 18", detail: "All nominal", severity: "healthy" },
  { label: "Vibration Sensors", value: "12 / 14", detail: "D3 offline", severity: "critical" },
  { label: "Level Sensors", value: "15 / 16", detail: "1 in maintenance", severity: "warning" },
];

export const recentActivity: ActivityEvent[] = [
  {
    title: "Flow Meter D3 changed to critical",
    detail: "Sensor Intelligence · Calgary Plant",
    time: "8 min ago",
    code: "CRITICAL",
    severity: "critical",
  },
  {
    title: "Policy DIVU-DG-014 approved",
    detail: "Data Governance · Admin User",
    time: "24 min ago",
    code: "APPROVED",
    severity: "healthy",
  },
  {
    title: "Welding Line B crossed OEE threshold",
    detail: "Operations · Edmonton Plant",
    time: "41 min ago",
    code: "WARNING",
    severity: "warning",
  },
  {
    title: "Monthly financial snapshot generated",
    detail: "Reports · Automated workflow",
    time: "1 hr ago",
    code: "READY",
    severity: "info",
  },
  {
    title: "API credential rotation completed",
    detail: "Security Center · Production gateway",
    time: "2 hrs ago",
    code: "SECURE",
    severity: "healthy",
  },
];
