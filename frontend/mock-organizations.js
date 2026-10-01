// =============================================================
// MOCK DATA — Organizations & their staff
// Shape matches future API: GET /api/v1/organizations
// Replace with real API when backend is ready.
// =============================================================

window.MOCK_ORGANIZATIONS = {
  success: true,
  message: "Organizations retrieved successfully",
  data: [
    {
      id: 1,
      name: "OPM",
      fullName: "Office of the Prime Minister",
      staff: [
        { id: 101, name: "Grace A." },
        { id: 102, name: "Peter K." },
        { id: 103, name: "Sarah N." }
      ]
    },
    {
      id: 2,
      name: "AVSI",
      fullName: "AVSI Foundation",
      staff: [
        { id: 201, name: "Jean M." },
        { id: 202, name: "Claudine U." }
      ]
    },
    {
      id: 3,
      name: "NRC",
      fullName: "Norwegian Refugee Council",
      staff: [
        { id: 301, name: "Ahmed S." },
        { id: 302, name: "Fatima H." },
        { id: 303, name: "Daniel O." }
      ]
    },
    {
      id: 4,
      name: "UNHCR",
      fullName: "UN Refugee Agency",
      staff: [
        { id: 401, name: "Marie L." },
        { id: 402, name: "Joseph B." }
      ]
    },
    {
      id: 5,
      name: "CRS",
      fullName: "Catholic Relief Services",
      staff: [
        { id: 501, name: "Patrick W." },
        { id: 502, name: "Agnes T." }
      ]
    },
    {
      id: 6,
      name: "TPO",
      fullName: "Transcultural Psychosocial Organization",
      staff: [
        { id: 601, name: "Dr. Ruth K." },
        { id: 602, name: "Moses A." }
      ]
    },
    {
      id: 7,
      name: "RedCross",
      fullName: "Uganda Red Cross Society",
      staff: [
        { id: 701, name: "Irene M." },
        { id: 702, name: "Samuel K." }
      ]
    },
    {
      id: 8,
      name: "CIYOTA",
      fullName: "Coburwas International Youth Organization",
      staff: [
        { id: 801, name: "David N." },
        { id: 802, name: "Peace A." }
      ]
    },
    {
      id: 9,
      name: "P4T",
      fullName: "Partners for Transformation",
      staff: [
        { id: 901, name: "Rebecca S." }
      ]
    },
    {
      id: 10,
      name: "CARITAS",
      fullName: "Caritas Uganda",
      staff: [
        { id: 1001, name: "Fr. John O." },
        { id: 1002, name: "Catherine M." }
      ]
    },
    {
      id: 11,
      name: "LWF",
      fullName: "Lutheran World Federation",
      staff: [
        { id: 1101, name: "Emmanuel T." },
        { id: 1102, name: "Esther K." }
      ]
    },
    {
      id: 12,
      name: "Hunger Fighters",
      fullName: "Hunger Fighters Uganda",
      staff: [
        { id: 1201, name: "Robert M." },
        { id: 1202, name: "Joan A." }
      ]
    }
  ]
};