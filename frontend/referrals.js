// =============================================================
// Referrals list page logic.
// Reads from window.MOCK_REFERRALS / window.CURRENT_USER.
// Reads ?search=, ?status=, ?priority=, ?category= from the URL
// (set by the dashboard's search / filter shortcuts).
// Later: replace getReferrals() with a real fetch() call.
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

  const state = {
    tab: "all",
    status: "",
    priority: "",
    category: "",
    search: ""
  };

  const $body = document.getElementById("ref-table-body");
  const $empty = document.getElementById("ref-empty");
  const $search = document.getElementById("ref-search");
  const $filterStatus = document.getElementById("filter-status");
  const $filterPriority = document.getElementById("filter-priority");
  const $filterCategory = document.getElementById("filter-category");
  const $tabs = document.getElementById("ref-tabs");

  // -------------------------------------------------------------
  // Read query params from the URL (set by the dashboard's shortcuts)
  // and pre-fill the state + the matching controls.
  // -------------------------------------------------------------
  const urlParams = new URLSearchParams(window.location.search);

  if (urlParams.get("search")) {
    state.search = urlParams.get("search");
    if ($search) $search.value = state.search;
  }
  if (urlParams.get("status")) {
    state.status = urlParams.get("status");
    if ($filterStatus) $filterStatus.value = state.status;
  }
  if (urlParams.get("priority")) {
    state.priority = urlParams.get("priority");
    if ($filterPriority) $filterPriority.value = state.priority;
  }
  if (urlParams.get("category")) {
    state.category = urlParams.get("category");
    if ($filterCategory) $filterCategory.value = state.category;
  }
  if (urlParams.get("tab")) {
    state.tab = urlParams.get("tab");
    if ($tabs) {
      Array.prototype.forEach.call($tabs.children, function (b) {
        b.classList.toggle("active", b.dataset.tab === state.tab);
      });
    }
  }

  function formatDate(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return dd + "/" + mm;
  }

  function getReferrals() {
    // Future: replace with fetch('/api/v1/referrals') and return json.data
    return window.MOCK_REFERRALS.data;
  }

  function applyFilters(list) {
    const myOrg = window.CURRENT_USER.organizationId;

    return list.filter(function (r) {
      // --- TAB LOGIC ---
      if (state.tab === "incoming" && r.receivingOrganizationId !== myOrg) return false;
      if (state.tab === "outgoing" && r.referringOrganizationId !== myOrg) return false;
      if (state.tab === "closed" && r.status !== "CLOSED") return false;

      // --- FILTER LOGIC ---
      if (state.status && r.status !== state.status) return false;
      if (state.priority && r.priority !== state.priority) return false;
      if (state.category && r.category !== state.category) return false;

      if (state.search) {
        const q = state.search.toLowerCase();
        const num = (r.referralNumber || "").toLowerCase();
        const ben = (r.beneficiaryReference || "").toLowerCase();
        if (!num.includes(q) && !ben.includes(q)) return false;
      }
      return true;
    });
  }

  function render() {
    const all = getReferrals();
    const list = applyFilters(all);

    $body.innerHTML = "";

    if (list.length === 0) {
      $empty.hidden = false;
      return;
    }
    $empty.hidden = true;

    list.forEach(function (r) {
      const row = document.createElement("a");
      row.className = "ref-row";
      row.href = "referral-detail.html?id=" + r.id;

      const statusClass = STATUS_CLASS[r.status] || "draft";
      const statusLabel = STATUS_LABELS[r.status] || r.status;
      const priorityClass = (r.priority || "").toLowerCase();

      row.innerHTML =
        '<span class="ref-id">' + r.referralNumber + "</span>" +
        '<span class="dashboard-status ' + statusClass + '">' + statusLabel + "</span>" +
        '<span class="ref-priority ' + priorityClass + '">' + r.priority + "</span>" +
        '<span class="ref-category">' + r.category + "</span>" +
        '<span class="ref-org">' + r.receivingOrganization + "</span>" +
        '<span class="ref-assigned">' + r.assignedTo + "</span>" +
        '<span class="ref-date">' + formatDate(r.createdAt) + "</span>";

      $body.appendChild(row);
    });
  }

  // --- EVENTS ---
  $search.addEventListener("input", function (e) {
    state.search = e.target.value.trim();
    render();
  });

  $filterStatus.addEventListener("change", function (e) {
    state.status = e.target.value;
    render();
  });

  $filterPriority.addEventListener("change", function (e) {
    state.priority = e.target.value;
    render();
  });

  $filterCategory.addEventListener("change", function (e) {
    state.category = e.target.value;
    render();
  });

  $tabs.addEventListener("click", function (e) {
    const btn = e.target.closest(".ref-tab");
    if (!btn) return;
    state.tab = btn.dataset.tab;
    Array.prototype.forEach.call($tabs.children, function (b) {
      b.classList.remove("active");
    });
    btn.classList.add("active");
    render();
  });

  // --- INIT ---
  render();
})();