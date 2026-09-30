// =============================================================
// New Referral form logic
// - Auto-fills referring org/staff from CURRENT_USER
// - Populates receiving org dropdown
// - Cascades staff dropdown when org changes
// - Validates required fields client-side (backend is the real guard)
// - "Save as Draft" → adds a DRAFT referral to the mock
// - "Submit Referral" → adds a SUBMITTED referral to the mock
// =============================================================

(function () {
  const user = window.CURRENT_USER;
  const orgs = window.MOCK_ORGANIZATIONS.data;

  // --- Element refs ---
  const $form = document.getElementById("referral-form");
  const $message = document.getElementById("form-message");
  const $referringOrg = document.getElementById("referringOrg");
  const $referringStaff = document.getElementById("referringStaff");
  const $receivingOrg = document.getElementById("receivingOrg");
  const $receivingStaff = document.getElementById("receivingStaff");
  const $btnDraft = document.getElementById("btn-draft");

  // --- 1. Auto-fill referring info ---
  $referringOrg.value = user.organizationName;
  $referringStaff.value = user.name;

  // --- 2. Populate receiving org dropdown (exclude own org) ---
  orgs
    .filter(function (o) { return o.id !== user.organizationId; })
    .forEach(function (o) {
      const opt = document.createElement("option");
      opt.value = o.id;
      opt.textContent = o.name + " — " + o.fullName;
      $receivingOrg.appendChild(opt);
    });

  // --- 3. Cascade receiving staff when org changes ---
  $receivingOrg.addEventListener("change", function () {
    const orgId = parseInt($receivingOrg.value, 10);
    $receivingStaff.innerHTML = "";

    if (!orgId) {
      $receivingStaff.disabled = true;
      const opt = document.createElement("option");
      opt.value = "";
      opt.textContent = "— Select organization first —";
      $receivingStaff.appendChild(opt);
      return;
    }

    const org = orgs.find(function (o) { return o.id === orgId; });
    if (!org) return;

    $receivingStaff.disabled = false;

    const none = document.createElement("option");
    none.value = "";
    none.textContent = "— None (assign to organization queue) —";
    $receivingStaff.appendChild(none);

    org.staff.forEach(function (s) {
      const opt = document.createElement("option");
      opt.value = s.id;
      opt.textContent = s.name;
      $receivingStaff.appendChild(opt);
    });
  });

  // --- 4. Collect form values into a referral object ---
  function collectReferral(status) {
    const receivingOrgId = parseInt($receivingOrg.value, 10);
    const receivingOrgObj = orgs.find(function (o) { return o.id === receivingOrgId; });
    const receivingStaffId = $receivingStaff.value
      ? parseInt($receivingStaff.value, 10)
      : null;

    // Generate next referral number (mock, sequential)
    const existing = window.MOCK_REFERRALS.data;
    const nextNum = existing.length + 1;
    const refNumber = "REF-2026-" + String(nextNum).padStart(6, "0");

    // Resolve receiving staff name (or null)
    let receivingStaffName = null;
    if (receivingOrgObj && receivingStaffId) {
      const staff = receivingOrgObj.staff.find(function (s) { return s.id === receivingStaffId; });
      if (staff) receivingStaffName = staff.name;
    }

    return {
      id: existing.length + 1,
      referralNumber: refNumber,
      status: status,
      priority: document.getElementById("priority").value,
      category: document.getElementById("category").value,
      referringOrganizationId: user.organizationId,
      referringOrganization: user.organizationName,
      receivingOrganizationId: receivingOrgId,
      receivingOrganization: receivingOrgObj ? receivingOrgObj.name : "—",
      receivingStaffId: receivingStaffId,
      receivingStaff: receivingStaffName || "—",
      assignedTo: "—",
      beneficiaryReference: document.getElementById("beneficiaryRef").value.trim(),
      ageGroup: document.getElementById("ageGroup").value,
      gender: document.getElementById("gender").value,
      zone: document.getElementById("zone").value.trim(),
      block: document.getElementById("block").value.trim(),
      reason: document.getElementById("reason").value.trim(),
      description: document.getElementById("description").value.trim(),
      consentStatus: document.getElementById("consentStatus").value,
      preferredCommunication: document.getElementById("preferredCommunication").value,
      createdAt: new Date().toISOString()
    };
  }

  // --- 5. Validate required fields ---
  function validate() {
    const required = [
      "receivingOrg", "category", "priority", "reason",
      "description", "consentStatus", "beneficiaryRef",
      "gender", "zone", "block"
    ];

    for (let i = 0; i < required.length; i++) {
      const el = document.getElementById(required[i]);
      if (!el.value.trim()) {
        showMessage("Please fill in: " + required[i], "error");
        el.focus();
        return false;
      }
    }
    return true;
  }

  // --- 6. Message helper ---
  function showMessage(text, kind) {
    $message.textContent = text;
    $message.className = "form-message " + (kind || "success");
    $message.hidden = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // --- 7. Persist referral (mock — push into MOCK_REFERRALS) ---
  function saveReferral(status) {
  const referral = collectReferral(status);

  // Read the CURRENT list from localStorage, add the new one, save back.
  const list = window.MOCK_REFERRALS.data;   // getter → live from localStorage
  list.push(referral);
  window.saveReferrals(list);                 // write back

  return referral;
}

  // --- 8. Handlers ---

  // Save as Draft
  $btnDraft.addEventListener("click", function () {
    if (!validate()) return;
    const r = saveReferral("DRAFT");
    showMessage("Draft saved: " + r.referralNumber + " (not yet submitted)", "success");
    setTimeout(function () { window.location.href = "referrals.html"; }, 1200);
  });

  // Submit Referral
  $form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validate()) return;
    const r = saveReferral("SUBMITTED");
    showMessage("Referral submitted: " + r.referralNumber + " → " + r.receivingOrganization, "success");
    setTimeout(function () { window.location.href = "referrals.html"; }, 1200);
  });

})();