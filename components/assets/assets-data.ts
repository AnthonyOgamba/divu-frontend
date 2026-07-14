export type AssetStatus = "Online" | "Warning" | "Maintenance" | "Offline" | "Decommissioned";
export type AssetRisk = "Low" | "Medium" | "High" | "Critical";
export type AssetCriticality = "Low" | "Medium" | "High" | "Critical";
export type AssetClassification = "Public" | "Internal" | "Confidential" | "Restricted";

export type AssetLocation = {
  siteId: string;
  siteName: string;
  hallId: string;
  hallName: string;
  lineId: string;
  lineName: string;
  stationId: string;
  stationName: string;
};

export type IndustrialAsset = {
  id: string;
  assetId: string;
  name: string;
  machineType: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  location: AssetLocation;
  network: {
    firmwareVersion: string;
    ipAddress: string;
    protocol: string;
  };
  lifecycle: {
    status: AssetStatus;
    installationDate: string;
    warrantyExpiry: string;
    lastMaintenance: string;
    nextMaintenance: string;
    serviceInterval: string;
  };
  governance: {
    policy: string;
    classification: AssetClassification;
    criticality: AssetCriticality;
    dataSource: string;
    encryptionRequired: boolean;
  };
  monitoring: {
    healthScore: number;
    oee: number;
    risk: AssetRisk;
    sensorCount: number;
    predictiveMaintenance: boolean;
    healthMonitoring: boolean;
    anomalyDetected: boolean;
  };
};

export type AssetMaintenanceRecord = {
  id: string;
  assetId: string;
  type: "Scheduled" | "Unscheduled" | "Emergency";
  outcome: "Completed" | "Partial" | "Failed";
  title: string;
  notes: string;
  technician: string;
  date: string;
  durationHours: number;
  parts: string[];
};

export type AssetSensor = {
  id: string;
  assetId: string;
  name: string;
  type: string;
  status: "Active" | "Warning" | "Critical" | "Offline";
  reading: string;
  unit: string;
  battery: number;
  updated: string;
};

const detA1: AssetLocation = { siteId: "site-detroit", siteName: "Detroit Assembly Plant", hallId: "det-hall-a", hallName: "Hall A — Body Shop", lineId: "det-line-a", lineName: "Line A", stationId: "det-line-a-station-1", stationName: "Station 1" };
const detA2: AssetLocation = { ...detA1, stationId: "det-line-a-station-2", stationName: "Station 2" };
const detC1: AssetLocation = { siteId: "site-detroit", siteName: "Detroit Assembly Plant", hallId: "det-hall-b", hallName: "Hall B — Paint Shop", lineId: "det-line-c", lineName: "Line C", stationId: "det-line-c-station-1", stationName: "Station 1" };
const detD3: AssetLocation = { ...detC1, lineId: "det-line-d", lineName: "Line D", stationId: "det-line-d-station-3", stationName: "Station 3" };
const detE2: AssetLocation = { siteId: "site-detroit", siteName: "Detroit Assembly Plant", hallId: "det-hall-c", hallName: "Hall C — General Assembly", lineId: "det-line-e", lineName: "Line E", stationId: "det-line-e-station-2", stationName: "Station 2" };
const detF1: AssetLocation = { ...detE2, lineId: "det-line-f", lineName: "Line F", stationId: "det-line-f-station-1", stationName: "Station 1" };
const stu11: AssetLocation = { siteId: "site-stuttgart", siteName: "Stuttgart Manufacturing Hub", hallId: "stu-hall-1", hallName: "Hall 1 — Stamping", lineId: "stu-line-1", lineName: "Line 1", stationId: "stu-line-1-station-1", stationName: "Station 1" };
const stu22: AssetLocation = { ...stu11, lineId: "stu-line-2", lineName: "Line 2", stationId: "stu-line-2-station-2", stationName: "Station 2" };
const stu34: AssetLocation = { siteId: "site-stuttgart", siteName: "Stuttgart Manufacturing Hub", hallId: "stu-hall-2", hallName: "Hall 2 — Welding", lineId: "stu-line-3", lineName: "Line 3", stationId: "stu-line-3-station-4", stationName: "Station 4" };
const osaA1: AssetLocation = { siteId: "site-osaka", siteName: "Osaka Production Site", hallId: "osa-hall-a", hallName: "Hall A — Precision Machining", lineId: "osa-line-alpha", lineName: "Line α", stationId: "osa-line-alpha-station-1", stationName: "Station 1" };
const osaB3: AssetLocation = { ...osaA1, lineId: "osa-line-beta", lineName: "Line β", stationId: "osa-line-beta-station-3", stationName: "Station 3" };

function createAsset(assetId: string, name: string, machineType: string, location: AssetLocation, overrides: Partial<IndustrialAsset> = {}): IndustrialAsset {
  return {
    id: assetId.toLowerCase(), assetId, name, machineType,
    manufacturer: "DIVU Industrial", model: "IND-400", serialNumber: `SN-${assetId.slice(4)}-2026`, location,
    network: { firmwareVersion: "4.2.1", ipAddress: "192.168.1.20", protocol: "OPC-UA" },
    lifecycle: { status: "Online", installationDate: "2024-01-15", warrantyExpiry: "2028-01-15", lastMaintenance: "2026-06-20", nextMaintenance: "2026-09-20", serviceInterval: "90 days" },
    governance: { policy: "Sensor Telemetry Retention", classification: "Internal", criticality: "High", dataSource: "Industrial IoT Gateway", encryptionRequired: true },
    monitoring: { healthScore: 90, oee: 87, risk: "Low", sensorCount: 2, predictiveMaintenance: true, healthMonitoring: true, anomalyDetected: false },
    ...overrides,
  };
}

export const initialAssets: IndustrialAsset[] = [
  createAsset("AST-0011", "CNC Milling Machine #1", "CNC Mill", detA1, { manufacturer: "Haas", model: "VF-2SS", serialNumber: "HAS-20241101", monitoring: { healthScore: 91, oee: 88, risk: "Low", sensorCount: 3, predictiveMaintenance: true, healthMonitoring: true, anomalyDetected: false } }),
  createAsset("AST-0012", "Robotic Welding Arm #3", "Welding Robot", detA2, { manufacturer: "FANUC", model: "ARC Mate 120iC", network: { firmwareVersion: "2.8.0", ipAddress: "192.168.1.12", protocol: "MQTT" }, monitoring: { healthScore: 88, oee: 86, risk: "Low", sensorCount: 2, predictiveMaintenance: true, healthMonitoring: true, anomalyDetected: false } }),
  createAsset("AST-0021", "Hydraulic Press #7", "Hydraulic Press", detC1, { manufacturer: "Schuler", model: "MSD 400", network: { firmwareVersion: "1.5.3", ipAddress: "192.168.1.21", protocol: "Modbus TCP" }, lifecycle: { status: "Warning", installationDate: "2022-08-01", warrantyExpiry: "2026-09-01", lastMaintenance: "2026-05-29", nextMaintenance: "2026-07-18", serviceInterval: "60 days" }, governance: { policy: "Operations Log Archive", classification: "Restricted", criticality: "Critical", dataSource: "PLC / Hydraulic Sensors", encryptionRequired: false }, monitoring: { healthScore: 54, oee: 62, risk: "High", sensorCount: 1, predictiveMaintenance: true, healthMonitoring: true, anomalyDetected: true } }),
  createAsset("AST-0022", "Conveyor System #2", "Conveyor Belt", detD3, { manufacturer: "Bosch", model: "CVB-800", network: { firmwareVersion: "3.1.0", ipAddress: "192.168.1.22", protocol: "EtherNet/IP" }, governance: { policy: "Standard Operational Policy", classification: "Internal", criticality: "Medium", dataSource: "PLC", encryptionRequired: false }, monitoring: { healthScore: 85, oee: 84, risk: "Low", sensorCount: 0, predictiveMaintenance: false, healthMonitoring: true, anomalyDetected: false } }),
  createAsset("AST-0031", "Assembly Station Alpha", "Assembly Robot", detE2, { manufacturer: "KUKA", model: "KR 210 R3100", network: { firmwareVersion: "5.0.2", ipAddress: "192.168.1.31", protocol: "OPC-UA" }, monitoring: { healthScore: 95, oee: 92, risk: "Low", sensorCount: 1, predictiveMaintenance: true, healthMonitoring: true, anomalyDetected: false } }),
  createAsset("AST-0032", "Paint Booth Controller", "Paint System", detF1, { manufacturer: "ABB", model: "IRB 5400", network: { firmwareVersion: "2.2.4", ipAddress: "192.168.1.32", protocol: "Modbus TCP" }, lifecycle: { status: "Maintenance", installationDate: "2023-06-01", warrantyExpiry: "2027-06-01", lastMaintenance: "2026-07-12", nextMaintenance: "2026-10-10", serviceInterval: "90 days" }, governance: { policy: "Operations Log Archive", classification: "Confidential", criticality: "High", dataSource: "Paint Controller", encryptionRequired: false }, monitoring: { healthScore: 62, oee: 65, risk: "Medium", sensorCount: 0, predictiveMaintenance: true, healthMonitoring: true, anomalyDetected: true } }),
  createAsset("AST-0041", "Stamping Press Mk-II", "Stamping Press", stu11, { manufacturer: "Schuler", model: "TRP 1600", network: { firmwareVersion: "3.4.1", ipAddress: "192.168.2.11", protocol: "OPC-UA" }, governance: { policy: "Sensor Telemetry Retention", classification: "Restricted", criticality: "Critical", dataSource: "PLC / Pressure Sensors", encryptionRequired: true }, monitoring: { healthScore: 82, oee: 84, risk: "Low", sensorCount: 1, predictiveMaintenance: true, healthMonitoring: true, anomalyDetected: false } }),
  createAsset("AST-0042", "Laser Cutter LX-900", "Laser Cutter", stu22, { manufacturer: "Trumpf", model: "TruLaser 5030", network: { firmwareVersion: "6.1.0", ipAddress: "192.168.2.12", protocol: "EtherNet/IP" }, governance: { policy: "Standard Operational Policy", classification: "Confidential", criticality: "High", dataSource: "Machine Gateway", encryptionRequired: true }, monitoring: { healthScore: 93, oee: 91, risk: "Low", sensorCount: 0, predictiveMaintenance: true, healthMonitoring: true, anomalyDetected: false } }),
  createAsset("AST-0051", "CNC Lathe #4", "CNC Lathe", osaA1, { manufacturer: "Mazak", model: "QT-250", network: { firmwareVersion: "4.0.0", ipAddress: "192.168.3.11", protocol: "Modbus TCP" }, lifecycle: { status: "Offline", installationDate: "2021-06-01", warrantyExpiry: "2025-12-01", lastMaintenance: "2026-04-14", nextMaintenance: "2026-07-14", serviceInterval: "90 days" }, governance: { policy: "Operations Log Archive", classification: "Internal", criticality: "Medium", dataSource: "Machine Controller", encryptionRequired: false }, monitoring: { healthScore: 28, oee: 31, risk: "Critical", sensorCount: 0, predictiveMaintenance: true, healthMonitoring: false, anomalyDetected: true } }),
  createAsset("AST-0052", "Vision Inspection System", "Inspection System", osaB3, { manufacturer: "Cognex", model: "In-Sight 9000", network: { firmwareVersion: "1.9.2", ipAddress: "192.168.3.12", protocol: "EtherNet/IP" }, lifecycle: { status: "Warning", installationDate: "2023-09-01", warrantyExpiry: "2027-09-01", lastMaintenance: "2026-06-13", nextMaintenance: "2026-07-28", serviceInterval: "45 days" }, monitoring: { healthScore: 67, oee: 73, risk: "Medium", sensorCount: 2, predictiveMaintenance: true, healthMonitoring: true, anomalyDetected: true } }),
  createAsset("AST-0061", "Packaging Unit #2", "Packaging Machine", stu34, { manufacturer: "Bosch Packaging", model: "SVE 2520", network: { firmwareVersion: "2.5.1", ipAddress: "192.168.2.31", protocol: "Modbus TCP" }, governance: { policy: "Standard Operational Policy", classification: "Internal", criticality: "Medium", dataSource: "Packaging PLC", encryptionRequired: true }, monitoring: { healthScore: 79, oee: 81, risk: "Low", sensorCount: 2, predictiveMaintenance: false, healthMonitoring: true, anomalyDetected: false } }),
  createAsset("AST-0062", "Decommissioned Press #1", "Hydraulic Press", detA1, { manufacturer: "Legacy Co", model: "LP-100", network: { firmwareVersion: "1.0.0", ipAddress: "—", protocol: "—" }, lifecycle: { status: "Decommissioned", installationDate: "2018-01-01", warrantyExpiry: "2022-01-01", lastMaintenance: "2025-06-09", nextMaintenance: "", serviceInterval: "N/A" }, governance: { policy: "Operations Log Archive", classification: "Internal", criticality: "Low", dataSource: "Archived PLC Logs", encryptionRequired: false }, monitoring: { healthScore: 0, oee: 0, risk: "Low", sensorCount: 0, predictiveMaintenance: false, healthMonitoring: false, anomalyDetected: false } }),
];

export const governancePolicies = ["Sensor Telemetry Retention", "Operations Log Archive", "Standard Operational Policy", "API Access Audit Trail"];
export const machineTypes = ["CNC Mill", "Welding Robot", "Hydraulic Press", "Conveyor Belt", "Assembly Robot", "Paint System", "Stamping Press", "Laser Cutter", "CNC Lathe", "Inspection System", "Packaging Machine"];
export const communicationProtocols = ["OPC-UA", "MQTT", "Modbus TCP", "EtherNet/IP", "PROFINET"];

const standardMaintenance: Record<string, Pick<AssetMaintenanceRecord, "title" | "notes" | "technician" | "durationHours" | "parts">> = {
  "CNC Mill": { title: "Quarterly spindle lubrication and calibration", notes: "All checks passed. Calibration remains within approved tolerance.", technician: "Carlos Rivera", durationHours: 2.5, parts: ["Spindle grease kit", "Filter set"] },
  "Welding Robot": { title: "Torch inspection and weld calibration", notes: "Torch assembly inspected and weld quality verified on test pieces.", technician: "Mike Davis", durationHours: 1.5, parts: ["Torch tip set"] },
  "Hydraulic Press": { title: "Hydraulic pressure and seal inspection", notes: "Pressure circuit inspected and safety interlocks validated.", technician: "Sarah Johnson", durationHours: 3, parts: ["Hydraulic seal", "Filter set"] },
  "Inspection System": { title: "Optics cleaning and vision recalibration", notes: "Camera optics cleaned and detection accuracy recalibrated.", technician: "Hiro Tanaka", durationHours: 1, parts: ["Lens cleaning kit"] },
};

export const assetMaintenanceRecords: AssetMaintenanceRecord[] = initialAssets.flatMap((asset, index) => {
  const template = standardMaintenance[asset.machineType] ?? { title: `${asset.machineType} preventive service`, notes: "Preventive inspection completed and operating controls validated.", technician: index % 2 ? "Mike Davis" : "Sarah Johnson", durationHours: 2, parts: ["Service kit"] };
  const primary: AssetMaintenanceRecord = { id: `${asset.id}-maintenance-1`, assetId: asset.id, type: asset.lifecycle.status === "Offline" ? "Emergency" : "Scheduled", outcome: asset.lifecycle.status === "Offline" ? "Failed" : asset.lifecycle.status === "Maintenance" ? "Partial" : "Completed", date: asset.lifecycle.lastMaintenance, ...template };
  if (asset.assetId !== "AST-0011") return [primary];
  return [primary, { id: `${asset.id}-maintenance-2`, assetId: asset.id, type: "Unscheduled", outcome: "Completed", title: "Coolant leak repair", notes: "Leak traced to the rear seal. Seal replaced and system pressure tested.", technician: "Mike Davis", date: "2026-05-29", durationHours: 1.5, parts: ["O-ring set", "Coolant seal"] }, { id: `${asset.id}-maintenance-3`, assetId: asset.id, type: "Scheduled", outcome: "Completed", title: "Annual overhaul and firmware update", notes: "Firmware upgraded and safety configuration verified.", technician: "Sarah Johnson", date: "2026-01-14", durationHours: 8, parts: ["Belt kit", "Bearing set", "Filter set"] }];
});

const sensorTemplates = [
  { name: "Spindle Temperature", type: "Temperature", reading: "68.2", unit: "°F" },
  { name: "Coolant Flow", type: "Flow Rate", reading: "24.5", unit: "GPM" },
  { name: "Machine Vibration", type: "Vibration", reading: "6.8", unit: "mm/s" },
  { name: "Hydraulic Pressure", type: "Pressure", reading: "312", unit: "PSI" },
];

export const assetSensors: AssetSensor[] = initialAssets.flatMap((asset) => Array.from({ length: asset.monitoring.sensorCount }, (_, index) => {
  const template = sensorTemplates[index % sensorTemplates.length];
  const warning = asset.monitoring.anomalyDetected && index === asset.monitoring.sensorCount - 1;
  return { id: `${asset.id}-sensor-${index + 1}`, assetId: asset.id, name: `${template.name} ${index + 1}`, type: template.type, status: warning ? "Warning" : "Active", reading: template.reading, unit: template.unit, battery: Math.max(35, 91 - index * 13), updated: index === 0 ? "2 min ago" : `${index * 2 + 2} min ago` };
}));
