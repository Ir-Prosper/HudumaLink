// =============================================================
// MOCK DATA — Demo login accounts.
// These are NOT real accounts — made-up credentials for the MVP
// demo only, one per organization, so you can show the system
// "as" different partners. Never put real staff passwords here.
// When backend is ready, this file is deleted and real
// authentication (POST /api/v1/auth/login) takes over.
// =============================================================

window.MOCK_USERS = [
  { email: "grace@opm.gov.ug",          password: "demo1234", name: "Grace A.",  role: "CASE_WORKER", organizationId: 1,  organizationName: "OPM" },
  { email: "jean@avsi.org",             password: "demo1234", name: "Jean M.",   role: "CASE_WORKER", organizationId: 2,  organizationName: "AVSI" },
  { email: "ahmed@nrc.org",             password: "demo1234", name: "Ahmed S.",  role: "CASE_WORKER", organizationId: 3,  organizationName: "NRC" },
  { email: "marie@unhcr.org",           password: "demo1234", name: "Marie L.",  role: "SUPERVISOR",  organizationId: 4,  organizationName: "UNHCR" },
  { email: "david@ciyota.org",          password: "demo1234", name: "David N.",  role: "CASE_WORKER", organizationId: 8,  organizationName: "CIYOTA" },
  { email: "robert@hungerfighters.org", password: "demo1234", name: "Robert M.", role: "CASE_WORKER", organizationId: 12, organizationName: "Hunger Fighters" }
];