// =============================================================
// Reports page logic.
// Computes statistics live from MOCK_REFERRALS.
// - Summary numbers
// - Bar charts (status / priority / category / receiving org)
// - Recent activity feed (last 10 history entries across all referrals)
// Later: replace with fetch('/api/v1/reports/...').
// =============================================================

(function () {
  const STATUS_LABELS = {
    DRAFT: "Draft", SUBMITTED: "Submitted", RECEIVED: "Received",
    ACCEPTED: "Accepted", REJECTED: "Rejected", IN_PROGRESS: "In Progress",
    ONWARD_REFERRED: "Onward Referred", RESOLVED: "Resolved",
    CLOSED: "Closed", CANCELLED: "Cancelled"
  };

  const ACTION_LABELS = Object.assign({
    CREATED: "Created",
    NOTE_ADDED: "Note added",
    ASSIGNED: "Assigned",
    STATUS_CHANGED: "Status changed",
    ONWARD_REFERRED: "Onward referred"
  }, STATUS_LABELS);

  // Ordered lists for consistent chart ordering
  const STATUS_ORDER = [
    "DRAFT", "SUBMITTED", "RECEIVED", "ACCEPTED",
    "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED",
    "ONWARD_REFERRED", "CANCELLED"
  ];
  const PRIORITY_ORDER = ["LOW", "MEDIUM", "HIGH", "URGENT"];
  const CATEGORY_ORDER = [
    "PROTECTION", "HEALTH", "EDUCATION",
    "LIVELIHOOD", "SHELTER", "OTHER"
  ];

  const $summary = document.getElementById("report-summary");
  const $chartStatus = document.getElementById("chart-status");
  const $chartPriority = document.getElementById("chart-priority");
  const $chartCategory = document.getElementById("chart-category");
  const $chartOrg = document.getElementById("chart-org");
  const $activity = document.getElementById("report-activity");

  function getReferrals() {
    return window.MOCK_REFERRALS.data;
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text == null ? "" : text;
    return div.innerHTML;
  }

  function fmtDateTime(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    return dd + "/" + mm + " " + hh + ":" + mi;
  }

  // -------------------------------------------------------------
  // Counting helper
  // -------------------------------------------------------------
  function countBy(list, key, orderedKeys) {
    const counts = {};
    orderedKeys.forEach(function (k) { counts[k] = 0; });

    list.forEach(function (r) {
      const v = r[key];
      if (v == null) return;
      if (!(v in counts)) counts[v] = 0;
      counts[v] += 1;
    });

    // Return as array of { key, label, count }
    return Object.keys(counts).map(function (k) {
      return {
        key: k,
        label: STATUS_LABELS[k] || k,
        count: counts[k]
      };
    });
  }

  // -------------------------------------------------------------
  // Render summary
  // -------------------------------------------------------------
  function renderSummary(list) {
    const total = list.length;
    const resolved = list.filter(function (r) { return r.status === "RESOLVED"; }).length;
    const closed = list.filter(function (r) { return r.status === "CLOSED"; }).length;
    const rejected = list.filter(function (r) { return r.status === "REJECTED"; }).length;
    const inProgress = list.filter(function (r) { return r.status === "IN_PROGRESS"; }).length;

    // "Overdue" — for the demo, anything IN_PROGRESS older than 7 days
    const now = Date.now();
    const overdue = list.filter(function (r) {
      if (r.status !== "IN_PROGRESS") return false;
      const days = (now - new Date(r.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      return days > 7;
    }).length;

    const cards = [
      { label: "Total referrals", value: total,  cls: "total" },
      { label: "In progress",      value: inProgress, cls: "inprogress" },
      { label: "Resolved",         value: resolved, cls: "resolved" },
      { label: "Closed",           value: closed, cls: "closed" },
      { label: "Rejected",         value: rejected, cls: "rejected" },
      { label: "Overdue (>7d)",    value: overdue, cls: "overdue" }
    ];

    $summary.innerHTML = cards.map(function (c) {
      return '<div class="report-stat-card ' + c.cls + '">' +
        '<p class="report-stat-label">' + c.label + '</p>' +
        '<p class="report-stat-number">' + c.value + '</p>' +
      '</div>';
    }).join("");
  }

  // -------------------------------------------------------------
  // Render a bar chart
  // -------------------------------------------------------------
  function renderChart($container, rows) {
    const max = Math.max.apply(null, rows.map(function (r) { return r.count; }).concat([1]));
    const total = rows.reduce(function (s, r) { return s + r.count; }, 0);

    if (total === 0) {
      $container.innerHTML = '<p class="ref-empty">No data yet.</p>';
      return;
    }

    $container.innerHTML = rows.map(function (r) {
      const pct = max === 0 ? 0 : Math.round((r.count / max) * 100);
      const share = total === 0 ? 0 : Math.round((r.count / total) * 100);
      return '<div class="report-bar-row">' +
        '<span class="report-bar-label">' + escapeHtml(r.label) + '</span>' +
        '<div class="report-bar-track">' +
          '<div class="report-bar-fill" style="width:' + pct + '%"></div>' +
        '</div>' +
        '<span class="report-bar-value">' + r.count + '</span>' +
        '<span class="report-bar-share">' + share + '%</span>' +
      '</div>';
    }).join("");
  }

  // -------------------------------------------------------------
  // Render recent activity (last 10 events across all referrals)
  // -------------------------------------------------------------
  function renderActivity(list) {
    const events = [];
    list.forEach(function (r) {
      (r.history || []).forEach(function (h) {
        events.push({
          refNumber: r.referralNumber,
          refId: r.id,
          action: h.action,
          performedBy: h.performedBy || "—",
          timestamp: h.timestamp || h.createdAt
        });
      });
    });

    events.sort(function (a, b) {
      return new Date(b.timestamp) - new Date(a.timestamp);
    });

    const recent = events.slice(0, 10);

    if (recent.length === 0) {
      $activity.innerHTML = '<p class="ref-empty">No activity yet.</p>';
      return;
    }

    $activity.innerHTML = recent.map(function (e) {
      return '<a class="report-activity-row" href="referral-detail.html?id=' + e.refId + '">' +
        '<span class="report-activity-ref">' + escapeHtml(e.refNumber) + '</span>' +
        '<span class="report-activity-action">' + escapeHtml(ACTION_LABELS[e.action] || e.action) + '</span>' +
        '<span class="report-activity-by">' + escapeHtml(e.performedBy) + '</span>' +
        '<span class="report-activity-when">' + fmtDateTime(e.timestamp) + '</span>' +
      '</a>';
    }).join("");
  }

  // -------------------------------------------------------------
  // Render everything
  // -------------------------------------------------------------
  function render() {
    const list = getReferrals();

    renderSummary(list);
    renderChart($chartStatus,   countBy(list, "status",   STATUS_ORDER));
    renderChart($chartPriority, countBy(list, "priority", PRIORITY_ORDER));
    renderChart($chartCategory, countBy(list, "category", CATEGORY_ORDER));
    renderChart($chartOrg,      countBy(list, "receivingOrganization",
                                  // unique receiving orgs in order of first appearance
                                  list.map(function (r) { return r.receivingOrganization; })
                                      .filter(function (v, i, arr) { return v && arr.indexOf(v) === i; })));
    renderActivity(list);
  }

  render();
})();