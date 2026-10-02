// =============================================================
// Referral Details page logic (SRS §39).
// Reads the referral whose id is in the URL (?id=...), shows it,
// and implements the 5 actions from §39: Update Status, Add Note,
// Assign, Onward Refer, Close.
//
// IMPORTANT PATTERN — read this before editing further:
// window.MOCK_REFERRALS.data is a GETTER that re-parses JSON from
// localStorage every time it's accessed, returning a brand-new
// array of brand-new objects each call. This means: inside any
// single action, call getList() exactly ONCE, keep that array in
// a variable, mutate the referral found inside THAT array, then
// persist(THAT SAME array). Never call getList() a second time
// mid-action — a second call returns a different, unmodified copy
// and your change gets silently lost.
//
// NOTE — one judgment call made here, not literal SRS text:
// VALID_TRANSITIONS encodes the §8 status chain plus the
// REJECTED/CANCELLED/ONWARD_REFERRED branches implied elsewhere.
// SRS §40 says the backend is the real authority — CONFIRM this
// table matches Matson's backend once it exists.
//
// Later: replace getList()/persist() with real fetch() calls to
// GET/POST /api/v1/referrals/{id}, /status, /notes, /assign,
// /onward, /close.
// =============================================================

(function () {

  const STATUS_LABELS = {
    DRAFT: "Draft",
    SUBMITTED: "Submitted",
    RECEIVED: "Received",
    ACCEPTED: "Accepted",
    REJECTED: "Rejected",
    IN_PROGRESS: "In Progress",
    ONWARD_REFERRED: "Onward Referred",
    RESOLVED: "Resolved",
    CLOSED: "Closed",
    CANCELLED: "Cancelled"
  };

  const STATUS_CLASS = {
    DRAFT: "draft",
    SUBMITTED: "submitted",
    RECEIVED: "received",
    ACCEPTED: "accepted",
    REJECTED: "rejected",
    IN_PROGRESS: "inprogress",
    ONWARD_REFERRED: "onward",
    RESOLVED: "resolved",
    CLOSED: "closed",
    CANCELLED: "cancelled"
  };

  const ACTION_LABELS = Object.assign({
    CREATED: "Created",
    NOTE_ADDED: "Note added",
    ASSIGNED: "Assigned"
  }, STATUS_LABELS);

  const VALID_TRANSITIONS = {
    DRAFT: ["SUBMITTED", "CANCELLED"],
    SUBMITTED: ["RECEIVED", "CANCELLED"],
    RECEIVED: ["ACCEPTED", "REJECTED"],
    ACCEPTED: ["IN_PROGRESS"],
    IN_PROGRESS: ["RESOLVED", "ONWARD_REFERRED"],
    RESOLVED: ["CLOSED"],
    REJECTED: [],
    ONWARD_REFERRED: [],
    CLOSED: [],
    CANCELLED: []
  };

  const user = window.CURRENT_USER;
  const orgs = window.MOCK_ORGANIZATIONS.data;

  const params = new URLSearchParams(window.location.search);
  const refId = parseInt(params.get("id"), 10);

  const $notFound = document.getElementById("detail-notfound");
  const $content = document.getElementById("detail-content");

  function showMessage(text, kind) {
    window.showToast(text, kind || "success");
  }

  function formatDateTime(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return d.getDate() + " " + months[d.getMonth()] + " " + d.getFullYear() + " " + hh + ":" + mm;
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // --- Data access (the "seam" for a future real backend) ---

  // Call this ONCE per action/render. Returns a fresh array straight
  // from localStorage (via the getter in mock-referrals.js).
  function getList() {
    return window.MOCK_REFERRALS.data;
  }

  // Finds the referral INSIDE a specific list you already fetched.
  // Always pass the same "list" variable you intend to persist later.
  function findReferralIn(list) {
    return list.find(function (r) { return r.id === refId; });
  }

  function persist(list) {
    window.saveReferrals(list);
  }

  function ensureHistory(referral) {
    if (!referral.history) {
      referral.history = [{
        action: "CREATED",
        performedBy: referral.referringStaff || referral.assignedTo || "—",
        timestamp: referral.createdAt
      }];
    }
    return referral.history;
  }

  function addHistory(referral, action, performedBy, comment) {
    ensureHistory(referral);
    referral.history.push({
      action: action,
      performedBy: performedBy || user.name,
      timestamp: new Date().toISOString(),
      comment: comment || undefined
    });
  }

  function field(label, value) {
    return '<div class="detail-field">' +
      '<p class="detail-field-label">' + label + '</p>' +
      '<p class="detail-field-value">' + escapeHtml(value || "—") + '</p>' +
    '</div>';
  }

  // =============================================================
  // RENDER — reads fresh data and redraws the whole page.
  // Safe to call getList() here since render() doesn't persist
  // anything — it only reads.
  // =============================================================
  function render() {
    const list = getList();
    const referral = findReferralIn(list);

    if (!referral) {
      $notFound.hidden = false;
      $content.hidden = true;
      return;
    }
    $notFound.hidden = true;
    $content.hidden = false;

    document.getElementById("detail-refnumber").textContent = referral.referralNumber;

    const $status = document.getElementById("detail-status");
    $status.textContent = STATUS_LABELS[referral.status] || referral.status;
    $status.className = "dashboard-status " + (STATUS_CLASS[referral.status] || "draft");

    const $priority = document.getElementById("detail-priority");
    $priority.textContent = referral.priority;
    $priority.className = "ref-priority " + (referral.priority || "").toLowerCase();

    document.getElementById("detail-beneficiary").innerHTML =
      field("Reference", referral.beneficiaryReference) +
      field("Age group", referral.ageGroup) +
      field("Gender", referral.gender) +
      field("Zone", referral.zone) +
      field("Block", referral.block);

    document.getElementById("detail-referral-info").innerHTML =
      field("From", referral.referringOrganization) +
      field("Referring staff", referral.referringStaff) +
      field("To", referral.receivingOrganization) +
      field("Receiving staff", referral.receivingStaff) +
      field("Category", referral.category) +
      field("Consent status", referral.consentStatus) +
      field("Preferred communication", referral.preferredCommunication) +
      field("Assigned to", referral.assignedTo) +
      field("Created", formatDateTime(referral.createdAt));

    document.getElementById("detail-reason").textContent = referral.reason || "—";
    document.getElementById("detail-description").textContent = referral.description || "—";

    const notes = referral.notes || [];
    document.getElementById("detail-notes").innerHTML = notes.length
      ? notes.map(function (n) {
          return '<div class="detail-note">' +
            '<p class="detail-note-text">' + escapeHtml(n.text) + '</p>' +
            '<p class="detail-note-meta">' + escapeHtml(n.author) + ' · ' + formatDateTime(n.timestamp) + '</p>' +
          '</div>';
        }).join("")
      : '<p class="detail-text">No notes yet.</p>';

    const allowed = VALID_TRANSITIONS[referral.status] || [];
    document.getElementById("btn-update-status").disabled = allowed.length === 0;
    document.getElementById("btn-onward").disabled = referral.status !== "IN_PROGRESS";
    document.getElementById("btn-close").disabled = referral.status !== "RESOLVED";
    document.getElementById("btn-assign").disabled = !referral.receivingOrganizationId;

    document.getElementById("new-status").innerHTML = allowed.map(function (s) {
      return '<option value="' + s + '">' + (STATUS_LABELS[s] || s) + '</option>';
    }).join("");

    const receivingOrgObj = orgs.find(function (o) { return o.id === referral.receivingOrganizationId; });
    document.getElementById("assign-staff").innerHTML = receivingOrgObj
      ? receivingOrgObj.staff.map(function (s) {
          return '<option value="' + s.id + '">' + s.name + '</option>';
        }).join("")
      : '<option value="">— No receiving organization —</option>';

    document.getElementById("onward-org").innerHTML = orgs
      .filter(function (o) {
        return o.id !== referral.referringOrganizationId && o.id !== referral.receivingOrganizationId;
      })
      .map(function (o) {
        return '<option value="' + o.id + '">' + o.name + ' — ' + o.fullName + '</option>';
      }).join("");

    const history = ensureHistory(referral);
    document.getElementById("detail-history").innerHTML = history.map(function (h) {
      return '<li class="detail-timeline-item">' +
        '<p class="detail-timeline-action">' + (ACTION_LABELS[h.action] || h.action) + '</p>' +
        '<p class="detail-timeline-meta">' + escapeHtml(h.performedBy) + ' · ' + formatDateTime(h.timestamp) + '</p>' +
        (h.comment ? '<p class="detail-timeline-comment">' + escapeHtml(h.comment) + '</p>' : '') +
      '</li>';
    }).join("");
  }

  // =============================================================
  // PANELS
  // =============================================================
  const panelIds = ["panel-update-status", "panel-add-note", "panel-assign", "panel-onward", "panel-close"];

  function openPanel(id) {
    panelIds.forEach(function (p) {
      document.getElementById(p).hidden = (p !== id);
    });
  }
  function closeAllPanels() {
    panelIds.forEach(function (p) { document.getElementById(p).hidden = true; });
  }

  document.getElementById("btn-update-status").addEventListener("click", function () { openPanel("panel-update-status"); });
  document.getElementById("btn-add-note").addEventListener("click", function () { openPanel("panel-add-note"); });
  document.getElementById("btn-assign").addEventListener("click", function () { openPanel("panel-assign"); });
  document.getElementById("btn-onward").addEventListener("click", function () { openPanel("panel-onward"); });
  document.getElementById("btn-close").addEventListener("click", function () { openPanel("panel-close"); });

  document.querySelectorAll("[data-cancel-panel]").forEach(function (btn) {
    btn.addEventListener("click", closeAllPanels);
  });

  // =============================================================
  // ACTION HANDLERS
  // Each one: getList() ONCE → find referral in THAT list → mutate
  // → persist THAT SAME list. This is the fix.
  // =============================================================

  document.getElementById("confirm-update-status").addEventListener("click", function () {
    const list = getList();
    const referral = findReferralIn(list);
    const newStatus = document.getElementById("new-status").value;
    const comment = document.getElementById("status-comment").value.trim();

    const allowed = VALID_TRANSITIONS[referral.status] || [];
    if (allowed.indexOf(newStatus) === -1) {
      showMessage("Referral cannot move from " + referral.status + " to " + newStatus + ".", "error");
      return;
    }

    referral.status = newStatus;
    addHistory(referral, newStatus, user.name, comment);
    persist(list);
    closeAllPanels();
    document.getElementById("status-comment").value = "";
    showMessage("Status updated to " + (STATUS_LABELS[newStatus] || newStatus) + ".", "success");
    render();
  });

  document.getElementById("confirm-add-note").addEventListener("click", function () {
    const list = getList();
    const referral = findReferralIn(list);
    const text = document.getElementById("note-text").value.trim();

    if (!text) {
      showMessage("Please write a note before saving.", "error");
      return;
    }

    referral.notes = referral.notes || [];
    referral.notes.push({ text: text, author: user.name, timestamp: new Date().toISOString() });
    addHistory(referral, "NOTE_ADDED", user.name, text.slice(0, 60));
    persist(list);
    closeAllPanels();
    document.getElementById("note-text").value = "";
    showMessage("Note added.", "success");
    render();
  });

  document.getElementById("confirm-assign").addEventListener("click", function () {
    const list = getList();
    const referral = findReferralIn(list);
    const staffId = parseInt(document.getElementById("assign-staff").value, 10);
    const receivingOrgObj = orgs.find(function (o) { return o.id === referral.receivingOrganizationId; });
    const staff = receivingOrgObj && receivingOrgObj.staff.find(function (s) { return s.id === staffId; });

    if (!staff) {
      showMessage("Please select a staff member to assign.", "error");
      return;
    }

    referral.assignedTo = staff.name;
    referral.receivingStaffId = staff.id;
    addHistory(referral, "ASSIGNED", user.name, "Assigned to " + staff.name);
    persist(list);
    closeAllPanels();
    showMessage("Referral assigned to " + staff.name + ".", "success");
    render();
  });

  document.getElementById("confirm-onward").addEventListener("click", function () {
    const list = getList();
    const referral = findReferralIn(list);

    if (referral.status !== "IN_PROGRESS") {
      showMessage("Only a referral that is In Progress can be referred onward.", "error");
      return;
    }

    const targetOrgId = parseInt(document.getElementById("onward-org").value, 10);
    const targetOrg = orgs.find(function (o) { return o.id === targetOrgId; });
    const reason = document.getElementById("onward-reason").value.trim();

    if (!targetOrg || !reason) {
      showMessage("Please select an organization and give a reason.", "error");
      return;
    }

    const nextNum = list.length + 1;

    const newReferral = Object.assign({}, referral, {
      id: list.length + 1,
      referralNumber: "REF-2026-" + String(nextNum).padStart(6, "0"),
      status: "SUBMITTED",
      referringOrganizationId: referral.receivingOrganizationId,
      referringOrganization: referral.receivingOrganization,
      referringStaff: user.name,
      receivingOrganizationId: targetOrg.id,
      receivingOrganization: targetOrg.name,
      receivingStaff: "—",
      receivingStaffId: null,
      assignedTo: "—",
      reason: reason,
      createdAt: new Date().toISOString(),
      notes: [],
      history: [{
        action: "CREATED",
        performedBy: user.name,
        timestamp: new Date().toISOString(),
        comment: "Created via onward referral from " + referral.referralNumber
      }]
    });

    referral.status = "ONWARD_REFERRED";
    addHistory(referral, "ONWARD_REFERRED", user.name,
      "Referred onward to " + targetOrg.name + " (" + newReferral.referralNumber + ")");

    list.push(newReferral);
    persist(list);
    showMessage("Onward referral created: " + newReferral.referralNumber + " → " + targetOrg.name, "success");
    setTimeout(function () {
      window.location.href = "referral-detail.html?id=" + newReferral.id;
    }, 1200);
  });

  document.getElementById("confirm-close").addEventListener("click", function () {
    const list = getList();
    const referral = findReferralIn(list);

    if (referral.status !== "RESOLVED") {
      showMessage("Referral cannot be closed because it is still " + STATUS_LABELS[referral.status] + ".", "error");
      return;
    }

    const reason = document.getElementById("close-reason").value.trim();
    if (!reason) {
      showMessage("Please give a reason for closing.", "error");
      return;
    }

    referral.status = "CLOSED";
    addHistory(referral, "CLOSED", user.name, reason);
    persist(list);
    closeAllPanels();
    showMessage("Referral closed.", "success");
    render();
  });

  render();
})();