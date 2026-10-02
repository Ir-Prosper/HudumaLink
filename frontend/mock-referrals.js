// =============================================================
// MOCK DATA — Referrals
// Seeds the initial data ONCE into localStorage.
// All reads/writes from now on go through localStorage so data
// survives page navigation.
// Org names/IDs here match mock-organizations.js exactly:
//   1=OPM  2=AVSI  3=NRC  4=UNHCR  (others per mock-organizations.js)
//
// These 8 seed referrals are fully filled in (not just status/dates)
// because they are used as the live demo set for the NGO partner
// presentation — every field a real referral would have is present,
// so the details page never shows "—" for them.
//
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
    referringStaff: "Grace A.",
    receivingOrganizationId: 2,
    receivingOrganization: "AVSI",
    receivingStaffId: 201,
    receivingStaff: "Jean M.",
    assignedTo: "Jean M.",
    beneficiaryReference: "BEN-000101",
    ageGroup: "CHILD",
    gender: "FEMALE",
    zone: "Zone 2",
    block: "Block C",
    reason: "Unaccompanied minor identified during registration",
    description: "Child arrived without a guardian; needs protection case management and family tracing support.",
    consentStatus: "OBTAINED",
    preferredCommunication: "IN_PERSON",
    createdAt: "2026-09-28T09:10:00Z",
    notes: [
      { text: "Initial assessment completed, case opened with AVSI protection team.", author: "Jean M.", timestamp: "2026-09-28T13:00:00Z" }
    ],
    history: [
      { action: "CREATED", performedBy: "Grace A.", timestamp: "2026-09-28T09:10:00Z" },
      { action: "SUBMITTED", performedBy: "Grace A.", timestamp: "2026-09-28T09:15:00Z" },
      { action: "RECEIVED", performedBy: "Jean M.", timestamp: "2026-09-28T09:42:00Z" },
      { action: "ACCEPTED", performedBy: "Jean M.", timestamp: "2026-09-28T10:10:00Z" },
      { action: "ASSIGNED", performedBy: "Grace A.", timestamp: "2026-09-28T10:12:00Z", comment: "Assigned to Jean M." },
      { action: "IN_PROGRESS", performedBy: "Jean M.", timestamp: "2026-09-28T11:30:00Z", comment: "Case assessment started." }
    ]
  },
  {
    id: 2,
    referralNumber: "REF-2026-000002",
    status: "RECEIVED",
    priority: "MEDIUM",
    category: "HEALTH",
    referringOrganizationId: 3,
    referringOrganization: "NRC",
    referringStaff: "Ahmed S.",
    receivingOrganizationId: 1,
    receivingOrganization: "OPM",
    receivingStaffId: 102,
    receivingStaff: "Peter K.",
    assignedTo: "Peter K.",
    beneficiaryReference: "BEN-000102",
    ageGroup: "ADULT",
    gender: "MALE",
    zone: "Zone 5",
    block: "Block A",
    reason: "Referral for chronic illness follow-up",
    description: "Beneficiary requires ongoing medication access and a referral to the settlement health centre.",
    consentStatus: "OBTAINED",
    preferredCommunication: "PHONE",
    createdAt: "2026-09-28T09:40:00Z",
    notes: [],
    history: [
      { action: "CREATED", performedBy: "Ahmed S.", timestamp: "2026-09-28T09:40:00Z" },
      { action: "SUBMITTED", performedBy: "Ahmed S.", timestamp: "2026-09-28T09:45:00Z" },
      { action: "RECEIVED", performedBy: "Peter K.", timestamp: "2026-09-28T12:40:00Z" }
    ]
  },
  {
    id: 3,
    referralNumber: "REF-2026-000003",
    status: "SUBMITTED",
    priority: "URGENT",
    category: "SHELTER",
    referringOrganizationId: 1,
    referringOrganization: "OPM",
    referringStaff: "Grace A.",
    receivingOrganizationId: 4,
    receivingOrganization: "UNHCR",
    receivingStaffId: null,
    receivingStaff: "—",
    assignedTo: "—",
    beneficiaryReference: "BEN-000103",
    ageGroup: "ADULT",
    gender: "FEMALE",
    zone: "Zone 1",
    block: "Block D",
    reason: "Household shelter damaged in recent storm",
    description: "Family of 5 displaced after roof collapse; urgent need for emergency shelter materials.",
    consentStatus: "OBTAINED",
    preferredCommunication: "IN_PERSON",
    createdAt: "2026-09-28T11:20:00Z",
    notes: [],
    history: [
      { action: "CREATED", performedBy: "Grace A.", timestamp: "2026-09-28T11:20:00Z" },
      { action: "SUBMITTED", performedBy: "Grace A.", timestamp: "2026-09-28T11:22:00Z" }
    ]
  },
  {
    id: 4,
    referralNumber: "REF-2026-000004",
    status: "ACCEPTED",
    priority: "LOW",
    category: "EDUCATION",
    referringOrganizationId: 1,
    referringOrganization: "OPM",
    referringStaff: "Sarah N.",
    receivingOrganizationId: 2,
    receivingOrganization: "AVSI",
    receivingStaffId: 202,
    receivingStaff: "Claudine U.",
    assignedTo: "Claudine U.",
    beneficiaryReference: "BEN-000104",
    ageGroup: "CHILD",
    gender: "MALE",
    zone: "Zone 3",
    block: "Block B",
    reason: "Out-of-school child needs enrollment support",
    description: "Child aged 9, not yet enrolled this term; requires placement support and school materials.",
    consentStatus: "OBTAINED",
    preferredCommunication: "EMAIL",
    createdAt: "2026-09-27T14:05:00Z",
    notes: [
      { text: "Enrollment slot confirmed at Kyangwali Primary, start date pending.", author: "Claudine U.", timestamp: "2026-09-27T16:30:00Z" }
    ],
    history: [
      { action: "CREATED", performedBy: "Sarah N.", timestamp: "2026-09-27T14:05:00Z" },
      { action: "SUBMITTED", performedBy: "Sarah N.", timestamp: "2026-09-27T14:10:00Z" },
      { action: "RECEIVED", performedBy: "Claudine U.", timestamp: "2026-09-27T15:00:00Z" },
      { action: "ACCEPTED", performedBy: "Claudine U.", timestamp: "2026-09-27T15:20:00Z" },
      { action: "ASSIGNED", performedBy: "Sarah N.", timestamp: "2026-09-27T15:25:00Z", comment: "Assigned to Claudine U." }
    ]
  },
  {
    id: 5,
    referralNumber: "REF-2026-000005",
    status: "CLOSED",
    priority: "MEDIUM",
    category: "LIVELIHOOD",
    referringOrganizationId: 1,
    referringOrganization: "OPM",
    referringStaff: "Grace A.",
    receivingOrganizationId: 3,
    receivingOrganization: "NRC",
    receivingStaffId: 301,
    receivingStaff: "Ahmed S.",
    assignedTo: "Ahmed S.",
    beneficiaryReference: "BEN-000105",
    ageGroup: "ADULT",
    gender: "FEMALE",
    zone: "Zone 4",
    block: "Block E",
    reason: "Requesting livelihood/skills training support",
    description: "Beneficiary seeking vocational training placement to support household income.",
    consentStatus: "OBTAINED",
    preferredCommunication: "PHONE",
    createdAt: "2026-09-26T08:15:00Z",
    notes: [
      { text: "Enrolled in tailoring skills programme, cohort starting next month.", author: "Ahmed S.", timestamp: "2026-09-26T10:00:00Z" },
      { text: "Required service successfully provided.", author: "Ahmed S.", timestamp: "2026-09-30T15:30:00Z" }
    ],
    history: [
      { action: "CREATED", performedBy: "Grace A.", timestamp: "2026-09-26T08:15:00Z" },
      { action: "SUBMITTED", performedBy: "Grace A.", timestamp: "2026-09-26T08:20:00Z" },
      { action: "RECEIVED", performedBy: "Ahmed S.", timestamp: "2026-09-26T09:00:00Z" },
      { action: "ACCEPTED", performedBy: "Ahmed S.", timestamp: "2026-09-26T09:30:00Z" },
      { action: "ASSIGNED", performedBy: "Grace A.", timestamp: "2026-09-26T09:32:00Z", comment: "Assigned to Ahmed S." },
      { action: "IN_PROGRESS", performedBy: "Ahmed S.", timestamp: "2026-09-26T10:05:00Z" },
      { action: "RESOLVED", performedBy: "Ahmed S.", timestamp: "2026-09-30T15:30:00Z" },
      { action: "CLOSED", performedBy: "Ahmed S.", timestamp: "2026-09-30T16:00:00Z", comment: "Required service successfully provided." }
    ]
  },
  {
    id: 6,
    referralNumber: "REF-2026-000006",
    status: "DRAFT",
    priority: "HIGH",
    category: "PROTECTION",
    referringOrganizationId: 1,
    referringOrganization: "OPM",
    referringStaff: "Grace A.",
    receivingOrganizationId: null,
    receivingOrganization: "—",
    receivingStaffId: null,
    receivingStaff: "—",
    assignedTo: "—",
    beneficiaryReference: "BEN-000106",
    ageGroup: "ELDERLY",
    gender: "FEMALE",
    zone: "Zone 2",
    block: "Block A",
    reason: "Elderly woman at risk, living alone without support",
    description: "Draft referral being prepared — receiving organization not yet decided.",
    consentStatus: "NOT_OBTAINED",
    preferredCommunication: "",
    createdAt: "2026-09-25T16:30:00Z",
    notes: [],
    history: [
      { action: "CREATED", performedBy: "Grace A.", timestamp: "2026-09-25T16:30:00Z" }
    ]
  },
  {
    id: 7,
    referralNumber: "REF-2026-000007",
    status: "REJECTED",
    priority: "MEDIUM",
    category: "HEALTH",
    referringOrganizationId: 1,
    referringOrganization: "OPM",
    referringStaff: "Peter K.",
    receivingOrganizationId: 4,
    receivingOrganization: "UNHCR",
    receivingStaffId: null,
    receivingStaff: "—",
    assignedTo: "—",
    beneficiaryReference: "BEN-000107",
    ageGroup: "ADULT",
    gender: "MALE",
    zone: "Zone 6",
    block: "Block B",
    reason: "Requested specialist medical referral outside mandate",
    description: "Beneficiary requires a service not covered by the receiving organization's mandate.",
    consentStatus: "OBTAINED",
    preferredCommunication: "EMAIL",
    createdAt: "2026-09-25T10:00:00Z",
    notes: [],
    history: [
      { action: "CREATED", performedBy: "Peter K.", timestamp: "2026-09-25T10:00:00Z" },
      { action: "SUBMITTED", performedBy: "Peter K.", timestamp: "2026-09-25T10:05:00Z" },
      { action: "RECEIVED", performedBy: "Marie L.", timestamp: "2026-09-25T11:00:00Z" },
      { action: "REJECTED", performedBy: "Marie L.", timestamp: "2026-09-25T11:30:00Z", comment: "Service not available within our mandate." }
    ]
  },
  {
    id: 8,
    referralNumber: "REF-2026-000008",
    status: "ONWARD_REFERRED",
    priority: "HIGH",
    category: "PROTECTION",
    referringOrganizationId: 2,
    referringOrganization: "AVSI",
    referringStaff: "Jean M.",
    receivingOrganizationId: 1,
    receivingOrganization: "OPM",
    receivingStaffId: 101,
    receivingStaff: "Grace A.",
    assignedTo: "Grace A.",
    beneficiaryReference: "BEN-000108",
    ageGroup: "CHILD",
    gender: "FEMALE",
    zone: "Zone 3",
    block: "Block C",
    reason: "Protection concern requiring specialized case management",
    description: "Case assessed and found to require a specialized protection service better handled by UNHCR's Child Protection Unit.",
    consentStatus: "OBTAINED",
    preferredCommunication: "IN_PERSON",
    createdAt: "2026-09-24T09:00:00Z",
    notes: [
      { text: "Reviewed case, recommending onward referral to specialized unit.", author: "Grace A.", timestamp: "2026-09-24T13:00:00Z" }
    ],
    history: [
      { action: "CREATED", performedBy: "Jean M.", timestamp: "2026-09-24T09:00:00Z" },
      { action: "SUBMITTED", performedBy: "Jean M.", timestamp: "2026-09-24T09:05:00Z" },
      { action: "RECEIVED", performedBy: "Grace A.", timestamp: "2026-09-24T09:30:00Z" },
      { action: "ACCEPTED", performedBy: "Grace A.", timestamp: "2026-09-24T10:00:00Z" },
      { action: "ASSIGNED", performedBy: "Jean M.", timestamp: "2026-09-24T10:05:00Z", comment: "Assigned to Grace A." },
      { action: "IN_PROGRESS", performedBy: "Grace A.", timestamp: "2026-09-24T10:30:00Z" },
      { action: "ONWARD_REFERRED", performedBy: "Grace A.", timestamp: "2026-09-24T13:30:00Z", comment: "Referred onward to UNHCR Child Protection Unit." }
    ]
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
    // First visit → seed with the full demo dataset
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_REFERRALS));
    return SEED_REFERRALS;
  }
};

// Helper the app can use to save the current list
window.saveReferrals = function (list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
};

// Dev utility: open DevTools console and call resetReferralData()
// to wipe anything YOU added/edited and restore this file's 8
// fully-detailed demo referrals exactly as written above.
window.resetReferralData = function () {
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
};