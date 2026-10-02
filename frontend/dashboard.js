// =============================================================
// Dashboard page logic
// Live stat counts + recent referrals from MOCK_REFERRALS.
// Topbar search & filter act as shortcuts into the referrals list.
// Later: fetch('/api/v1/dashboard/summary') + fetch('/api/v1/referrals?page=0&size=5')
// =============================================================

(function () {
  const STATUS_LABELS = {
    DRAFT: "Draft", SUBMITTED: "Submitted", RECEIVED: "Received",
    ACCEPTED: "Accepted", REJECTED: "Rejected", IN_PROGRESS: "In Progress",
    ONWARD_REFERRED: "Onward Referred", RESOLVED: "Resolved",
    CLOSED: "Closed", CANCELLED: "Cancelled"
  };

  const STATUS_CLASS = {
    DRAFT: "draft", SUBMITTED: "submitted", RECEIVED: "received",
    ACCEPTED: "accepted", REJECTED: "rejected", IN_PROGRESS: "inprogress",
    ONWARD_REFERRED: "onward", RESOLVED: "resolved", CLOSED: "closed",
    CANCELLED: "cancelled"
  };

  function fmtDate(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return dd + "/" + mm;
  }

  function render() {
    const list = window.MOCK_REFERRALS.data;

    // --- Stat cards ---
    const total = list.length;
    const pending = list.filter(function (r) {
      return r.status === "DRAFT" || r.status === "SUBMITTED" || r.status === "RECEIVED";
    }).length;
    const inProgress = list.filter(function (r) { return r.status === "IN_PROGRESS"; }).length;
    const closed = list.filter(function (r) { return r.status === "CLOSED"; }).length;

    document.getElementById("stat-total").textContent = total;
    document.getElementById("stat-pending").textContent = pending;
    document.getElementById("stat-inprogress").textContent = inProgress;
    document.getElementById("stat-closed").textContent = closed;

    // --- Recent referrals: last 5 by createdAt desc ---
    const recent = list.slice().sort(function (a, b) {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }).slice(0, 5);

    const $recent = document.getElementById("dashboard-recent");
    $recent.innerHTML = "";

    if (recent.length === 0) {
      $recent.innerHTML = '<p class="ref-empty">No referrals yet.</p>';
      return;
    }

    recent.forEach(function (r) {
      const card = document.createElement("a");
      card.className = "dashboard-case-card";
      card.href = "referral-detail.html?id=" + r.id;

      const statusClass = STATUS_CLASS[r.status] || "draft";
      const statusLabel = STATUS_LABELS[r.status] || r.status;

      card.innerHTML =
        '<span class="dashboard-case-id">' + r.referralNumber + '</span>' +
        '<span class="dashboard-status ' + statusClass + '">' + statusLabel + '</span>' +
        '<span class="dashboard-case-date">' + fmtDate(r.createdAt) + '</span>' +
        '<span class="dashboard-case-org">' + r.receivingOrganization + '</span>';

      $recent.appendChild(card);
    });
  }

  // --- Search box: press Enter → jump to referrals list pre-filtered ---
  const $dashSearch = document.getElementById("dash-search");
  if ($dashSearch) {
    $dashSearch.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        const q = $dashSearch.value.trim();
        window.location.href = "referrals.html" + (q ? "?search=" + encodeURIComponent(q) : "");
      }
    });
  }

  // --- Filter select: choose → jump to referrals list pre-filtered ---
  const $dashFilter = document.getElementById("dash-filter");
  if ($dashFilter) {
    $dashFilter.addEventListener("change", function () {
      const v = $dashFilter.value;
      window.location.href = "referrals.html" + (v ? "?" + v : "");
    });
  }

  render();
})();