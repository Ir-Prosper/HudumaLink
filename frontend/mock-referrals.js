// =============================================================
// MOCK DATA — Referrals
// Seeds the initial data ONCE into localStorage.
// All reads/writes from now on go through localStorage so data
// survives page navigation.
// When Matson's backend is ready, delete this file and use fetch().
// =============================================================

window.CURRENT_USER = {
  id: 1,
  name: "Grace A.",
  role: "CASE_WORKER",
  organizationId: 1,
  organizationName: "OPM"
};

// ---- Seed data (used only if localStorage is empty) ----
const SEED_REFERRALS = [
  {
    id: 1,
    referralNumber: "REF-2026-000001",
    status: "IN_PROGRESS",
    priority: "HIGH",
    category: "PROTECTION",
    referringOrganizationId: 1,
    referringOrganization: "OPM",
    receivingOrganizationId: 2,
    receivingOrganization: "Organization B",
    assignedTo: "Grace A.",
    createdAt: "2026-09-28T09:10:00Z"
  },
  {
    id: 2,
    referralNumber: "REF-2026-000002",
    status: "RECEIVED",
    priority: "MEDIUM",
    category: "HEALTH",
    referringOrganizationId: 3,
    referringOrganization: "Organization C",
    receivingOrganizationId: 1,
    receivingOrganization: "OPM",
    assignedTo: "—",
    createdAt: "2026-09-28T09:40:00Z"
  },
  {
    id: 3,
    referralNumber: "REF-2026-000003",
    status: "SUBMITTED",
    priority: "URGENT",
    category: "SHELTER",
    referringOrganizationId: 1,
    referringOrganization: "OPM",
    receivingOrganizationId: 4,
    receivingOrganization: "Organization D",
    assignedTo: "—",
    createdAt: "2026-09-28T11:20:00Z"
  },
  {
    id: 4,
    referralNumber: "REF-2026-000004",
    status: "ACCEPTED",
    priority: "LOW",
    category: "EDUCATION",
    referringOrganizationId: 1,
    referringOrganization: "OPM",
    receivingOrganizationId: 2,
    receivingOrganization: "Organization B",
    assignedTo: "John D.",
    createdAt: "2026-09-27T14:05:00Z"
  },
  {
    id: 5,
    referralNumber: "REF-2026-000005",
    status: "CLOSED",
    priority: "MEDIUM",
    category: "LIVELIHOOD",
    referringOrganizationId: 1,
    referringOrganization: "OPM",
    receivingOrganizationId: 3,
    receivingOrganization: "Organization C",
    assignedTo: "Jane S.",
    createdAt: "2026-09-26T08:15:00Z"
  },
  {
    id: 6,
    referralNumber: "REF-2026-000006",
    status: "DRAFT",
    priority: "HIGH",
    category: "PROTECTION",
    referringOrganizationId: 1,
    referringOrganization: "OPM",
    receivingOrganizationId: null,
    receivingOrganization: "—",
    assignedTo: "—",
    createdAt: "2026-09-25T16:30:00Z"
  },
  {
    id: 7,
    referralNumber: "REF-2026-000007",
    status: "REJECTED",
    priority: "MEDIUM",
    category: "HEALTH",
    referringOrganizationId: 1,
    referringOrganization: "OPM",
    receivingOrganizationId: 4,
    receivingOrganization: "Organization D",
    assignedTo: "—",
    createdAt: "2026-09-25T10:00:00Z"
  },
  {
    id: 8,
    referralNumber: "REF-2026-000008",
    status: "ONWARD_REFERRED",
    priority: "HIGH",
    category: "PROTECTION",
    referringOrganizationId: 2,
    referringOrganization: "Organization B",
    receivingOrganizationId: 1,
    receivingOrganization: "OPM",
    assignedTo: "Grace A.",
    createdAt: "2026-09-24T09:00:00Z"
  }
];

// ---- Storage helpers ----
const STORAGE_KEY = "hudumalink_referrals";

// Always expose a live view backed by localStorage.
window.MOCK_REFERRALS = {
  success: true,
  message: "Referrals retrieved successfully",
  get data() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    // First visit → seed with defaults
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_REFERRALS));
    return SEED_REFERRALS;
  }
};

// Helper the app can use to save the current list
window.saveReferrals = function (list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
};

// Utility for dev: open DevTools console and call resetReferralData()
// to wipe localStorage and restore the seed data.
window.resetReferralData = function () {
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
};