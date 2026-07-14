export type Severity = "Critical" | "High" | "Medium" | "Low" | "Info";
export type SecurityStatus = "New" | "Escalated" | "Investigating" | "Acknowledged" | "Resolved";

export type SecurityEvent = {
  id: string; title: string; summary: string; user: string; role: string; ip: string;
  site: string; severity: Severity; status: SecurityStatus; time: string; timestamp: string;
  investigation?: string; audit?: string;
};

export type Investigation = {
  id: string; title: string; severity: Severity; status: SecurityStatus; assigned: string;
  events: number; tags: string[]; updated: string; resolution?: string;
};

export const metrics = [
  { label: "Failed Logins", value: 3, trend: "↓ 30%", time: "12m ago", tone: "warning" },
  { label: "Locked Accounts", value: 1, trend: "↑ 100%", time: "42m ago", tone: "warning" },
  { label: "Unauthorized API Requests", value: 2, trend: "↑ 50%", time: "14m ago", tone: "critical" },
  { label: "Permission Violations", value: 2, trend: "↓ 20%", time: "22m ago", tone: "warning" },
  { label: "Security Alerts", value: 5, trend: "", time: "5m ago", tone: "warning" },
  { label: "Open Investigations", value: 4, trend: "↑ 33%", time: "30m ago", tone: "warning" },
] as const;

export const securityEvents: SecurityEvent[] = [
  { id: "EV-001", title: "Failed Login", summary: "3rd consecutive failed login — account auto-locked after this attempt", user: "Sarah Johnson", role: "Viewer", ip: "192.168.1.88", site: "Osaka", severity: "High", status: "Investigating", time: "12m ago", timestamp: "Jul 13, 08:42 PM", investigation: "INC-2026-00022", audit: "e012" },
  { id: "EV-002", title: "Unauthorized API", summary: "1,840 unauthorized API requests — token revoked. External IP not whitelisted.", user: "[API] Security Scan Bot", role: "API Client", ip: "185.220.101.44", site: "Production", severity: "Critical", status: "Investigating", time: "14m ago", timestamp: "Jul 13, 08:36 PM", investigation: "INC-2026-00021", audit: "a11" },
  { id: "EV-003", title: "Permission Denied", summary: "Attempted to access Financial Dashboard — role lacks financial_view permission", user: "John Smith", role: "Viewer", ip: "172.16.0.22", site: "Detroit", severity: "Low", status: "Acknowledged", time: "22m ago", timestamp: "Jul 13, 08:28 PM", audit: "e007" },
  { id: "EV-004", title: "Role Escalation", summary: "Attempted to escalate Viewer role with admin-level permissions — rejected", user: "Marcus Lee", role: "Plant Manager", ip: "10.0.0.34", site: "Frankfurt", severity: "High", status: "Resolved", time: "35m ago", timestamp: "Jul 13, 08:15 PM", investigation: "INC-2026-00019", audit: "e004" },
  { id: "EV-005", title: "Account Lockout", summary: "Account locked after 3 failed password attempts", user: "Sarah Johnson", role: "Viewer", ip: "192.168.1.88", site: "Osaka", severity: "High", status: "Acknowledged", time: "42m ago", timestamp: "Jul 13, 08:08 PM", investigation: "INC-2026-00022", audit: "e013" },
  { id: "EV-006", title: "Suspicious Activity", summary: "Rapid sequential endpoint enumeration detected", user: "[API] Security Scan Bot", role: "API Client", ip: "185.220.101.44", site: "Production", severity: "Critical", status: "Resolved", time: "55m ago", timestamp: "Jul 13, 07:55 PM", investigation: "INC-2026-00021", audit: "a12" },
  { id: "EV-007", title: "External Brute Force", summary: "Credential stuffing detected from multiple unknown IP addresses", user: "External Actor", role: "Unknown", ip: "203.0.113.99", site: "External", severity: "Medium", status: "New", time: "1h ago", timestamp: "Jul 13, 07:42 PM", investigation: "INC-2026-00023", audit: "e018" },
  { id: "EV-008", title: "API Token Abuse", summary: "Compromised API token attempted access outside its approved scope", user: "Mobile App Operators", role: "API Client", ip: "198.51.100.7", site: "Detroit", severity: "High", status: "Escalated", time: "2h ago", timestamp: "Jul 13, 06:50 PM", investigation: "INC-2026-00021", audit: "a14" },
];

export const investigations: Investigation[] = [
  { id: "INC-2026-00023", title: "External Brute Force — Multiple Unknown IPs", severity: "Medium", status: "New", assigned: "Unassigned", events: 2, tags: ["Brute Force", "External Threat"], updated: "20m ago" },
  { id: "INC-2026-00021", title: "External API Token Abuse — Security Scan Bot", severity: "Critical", status: "Escalated", assigned: "Admin User", events: 2, tags: ["API Abuse", "External Threat", "Token Compromise"], updated: "36m ago" },
  { id: "INC-2026-00022", title: "Sarah Johnson Account — Multiple Failed Logins", severity: "High", status: "Investigating", assigned: "Admin User", events: 2, tags: ["Account Lockout", "Credential Issue"], updated: "14m ago" },
  { id: "INC-2026-00018", title: "Rania Al-Hassan — Geolocation Anomaly", severity: "Medium", status: "Acknowledged", assigned: "Admin User", events: 1, tags: ["Session Anomaly", "Geolocation"], updated: "4h ago" },
  { id: "INC-2026-00019", title: "Marcus Lee — Unauthorized Role Escalation Attempt", severity: "High", status: "Resolved", assigned: "James Okafor", events: 1, tags: ["Privilege Escalation", "RBAC", "User Error"], updated: "1d ago", resolution: "Resolved by James Okafor · User Error · 1d ago" },
];

export const notifications = [
  { severity: "Critical" as Severity, title: "Critical API Abuse", count: "1840×", message: "Security Scan Bot generated 1,840 unauthorized API requests. Token revoked. Investigation escalated.", time: "5d ago" },
  { severity: "High" as Severity, title: "Multiple Failed Logins", count: "3×", message: "Sarah Johnson: 3 consecutive failed logins from Osaka site. Account auto-locked.", time: "1d ago" },
  { severity: "High" as Severity, title: "External Brute Force", count: "12×", message: "Credential stuffing detected from 2 external IPs. No successful logins.", time: "12h ago" },
  { severity: "Medium" as Severity, title: "Session Geolocation", count: "1×", message: "Rania Al-Hassan logged in from UAE — previous sessions from Germany. Verify legitimacy.", time: "5h ago" },
  { severity: "Low" as Severity, title: "Permission Violations", count: "2×", message: "John Smith attempted to access 2 restricted resources in the last 24 hours.", time: "8h ago" },
];
