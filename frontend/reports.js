// =============================================================
// Reports page logic.
// Computes statistics live from MOCK_REFERRALS.
//
// Four charts, four distinct visual treatments — on purpose, so
// no two sections of this page look like the same component in a
// different color:
//   1. Status      → ranked horizontal bar list (many categories,
//                     needs full width for 10 labels)
//   2. Priority     → donut with a center total (few categories,
//                     part-of-whole)
//   3. Category     → horizontal lollipop chart, one color per
//                     category (compact, mid-count categories)
//   4. Receiving org → vertical column chart with a baseline grid
//                     (comparison across named orgs)
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

  const CATEGORY_LABELS = {
    PROTECTION: "Protection", HEALTH: "Health", EDUCATION: "Education",
    LIVELIHOOD: "Livelihood", SHELTER: "Shelter", OTHER: "Other"
  };

  // Donut slice colors — semantic, matches the priority pill colors
  // used elsewhere in the app (ref-priority.*) so the legend reads
  // consistently across pages.
  const PRIORITY_COLORS = {
    LOW: "#1a7f37",
    MEDIUM: "#9c6100",
    HIGH: "#b8451c",
    URGENT: "#c82828"
  };

  // One distinct color per category, so the lollipop chart carries
  // its own identity instead of reusing the blue used for Status
  // or the purple used for Organization.
  const CATEGORY_COLORS = {
    PROTECTION: "#c82828",
    HEALTH: "#1a7f37",
    EDUCATION: "#1e5fa5",
    LIVELIHOOD: "#9c6100",
    SHELTER: "#6a3fc0",
    OTHER: "#6e7680"
  };

  const $summary = document.getElementById("report-summary");
  const $chartStatus = document.getElementById("chart-status");
  const $chartPriority = document.getElementById("chart-priority");
  const $chartCategory = document.getElementById("chart-category");
  const $chartOrg = document.getElementById("chart-org");
  const $activity = document.getElementById("report-activity");

  function getReferrals() { return window.MOCK_REFERRALS.data; }

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

  function countBy(list, key, orderedKeys, labelMap) {
    const counts = {};
    orderedKeys.forEach(function (k) { counts[k] = 0; });
    list.forEach(function (r) {
      const v = r[key];
      if (v == null) return;
      if (!(v in counts)) counts[v] = 0;
      counts[v] += 1;
    });
    const labels = labelMap || STATUS_LABELS;
    return Object.keys(counts).map(function (k) {
      return { key: k, label: labels[k] || k, count: counts[k] };
    });
  }

  // -------------------------------------------------------------
  // 1. Summary Cards
  // -------------------------------------------------------------
  function renderSummary(list) {
    const total = list.length;
    const resolved = list.filter(r => r.status === "RESOLVED").length;
    const closed = list.filter(r => r.status === "CLOSED").length;
    const rejected = list.filter(r => r.status === "REJECTED").length;
    const inProgress = list.filter(r => r.status === "IN_PROGRESS").length;

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
  // 2. Chart — Status: ranked horizontal bar list
  // -------------------------------------------------------------
  function renderHorizontalBar($container, rows) {
    const max = Math.max.apply(null, rows.map(r => r.count).concat([1]));
    const total = rows.reduce((s, r) => s + r.count, 0);

    if (total === 0) { $container.innerHTML = '<p class="ref-empty">No data yet.</p>'; return; }

    // Sort tallest first so the list reads as a ranking, not just
    // the fixed SRS status-chain order.
    const sorted = rows.slice().sort((a, b) => b.count - a.count);

    $container.innerHTML = sorted.map(function (r) {
      const pct = max === 0 ? 0 : Math.round((r.count / max) * 100);
      const share = total === 0 ? 0 : Math.round((r.count / total) * 100);
      return '<div class="report-bar-row" title="' + escapeHtml(r.label) + ': ' + r.count + ' (' + share + '%)">' +
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
  // 3. Chart — Priority: donut with a center total
  // -------------------------------------------------------------
  function renderDonut($container, rows) {
    const total = rows.reduce((s, r) => s + r.count, 0);
    if (total === 0) { $container.innerHTML = '<p class="ref-empty">No data yet.</p>'; return; }

    const GAP_DEG = 2.5; // thin white seam between slices for separation
    const visible = rows.filter(r => r.count > 0);

    let currentDeg = 0;
    const gradientParts = [];
    let legendHtml = "";

    visible.forEach(function (r) {
      const deg = (r.count / total) * 360;
      const sliceEnd = currentDeg + deg;
      const gapEnd = visible.length > 1 ? Math.max(currentDeg, sliceEnd - GAP_DEG) : sliceEnd;
      const color = PRIORITY_COLORS[r.key] || "#1e5fa5";

      gradientParts.push(color + " " + currentDeg + "deg " + gapEnd + "deg");
      if (gapEnd < sliceEnd) {
        gradientParts.push("#ffffff " + gapEnd + "deg " + sliceEnd + "deg");
      }

      const share = Math.round((r.count / total) * 100);
      legendHtml +=
        '<div class="donut-legend-item">' +
          '<span class="donut-color-box" style="background:' + color + '"></span>' +
          '<span class="donut-legend-text">' + escapeHtml(r.label) + '</span>' +
          '<span class="donut-legend-value">' + r.count + '</span>' +
          '<span class="donut-legend-share">' + share + '%</span>' +
        '</div>';

      currentDeg = sliceEnd;
    });

    $container.innerHTML =
      '<div class="report-donut-container">' +
        '<div class="donut-wrap">' +
          '<div class="donut-chart" style="background: conic-gradient(' + gradientParts.join(", ") + ');"></div>' +
          '<div class="donut-center">' +
            '<span class="donut-center-value">' + total + '</span>' +
            '<span class="donut-center-label">Total</span>' +
          '</div>' +
        '</div>' +
        '<div class="donut-legend">' + legendHtml + '</div>' +
      '</div>';
  }

  // -------------------------------------------------------------
  // 4. Chart — Category: horizontal lollipop chart
  // -------------------------------------------------------------
  function renderLollipop($container, rows) {
    const max = Math.max.apply(null, rows.map(r => r.count).concat([1]));
    const total = rows.reduce((s, r) => s + r.count, 0);
    if (total === 0) { $container.innerHTML = '<p class="ref-empty">No data yet.</p>'; return; }

    $container.innerHTML = '<div class="lollipop-chart">' + rows.map(function (r) {
      const pct = max === 0 ? 0 : Math.max(4, Math.round((r.count / max) * 100));
      const color = CATEGORY_COLORS[r.key] || "#1e5fa5";
      return (
        '<div class="lollipop-row" title="' + escapeHtml(r.label) + ': ' + r.count + '">' +
          '<span class="lollipop-label">' + escapeHtml(r.label) + '</span>' +
          '<div class="lollipop-track">' +
            '<div class="lollipop-line" style="width:' + pct + '%; background:' + color + '"></div>' +
            '<div class="lollipop-dot" style="left:' + pct + '%; background:' + color + '; color:' + color + '"></div>' +
          '</div>' +
          '<span class="lollipop-value">' + r.count + '</span>' +
        '</div>'
      );
    }).join("") + '</div>';
  }

  // -------------------------------------------------------------
  // 5. Chart — Receiving organization: vertical columns + baseline grid
  // -------------------------------------------------------------
  function renderOrgChart($container, rows) {
    const max = Math.max.apply(null, rows.map(r => r.count).concat([1]));
    const total = rows.reduce((s, r) => s + r.count, 0);
    if (total === 0) { $container.innerHTML = '<p class="ref-empty">No data yet.</p>'; return; }

    // Gridlines at 25/50/75/100% of the tallest bar give the column
    // chart a real axis instead of floating bars on blank space.
    const html =
      '<div class="report-org-chart">' +
        '<div class="org-gridlines">' +
          '<span></span><span></span><span></span><span></span>' +
        '</div>' +
        rows.map(function (r) {
          const pct = max === 0 ? 0 : (r.count / max) * 100;
          return (
            '<div class="org-col" title="' + escapeHtml(r.label) + ': ' + r.count + '">' +
              '<span class="org-value">' + r.count + '</span>' +
              '<div class="org-fill" style="height:' + pct + '%"></div>' +
              '<span class="org-label">' + escapeHtml(r.label) + '</span>' +
            '</div>'
          );
        }).join("") +
      '</div>';
    $container.innerHTML = html;
  }

  // -------------------------------------------------------------
  // 6. Recent Activity
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

    events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const recent = events.slice(0, 10);

    if (recent.length === 0) { $activity.innerHTML = '<p class="ref-empty">No activity yet.</p>'; return; }

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
  // Render Everything
  // -------------------------------------------------------------
  function render() {
    const list = getReferrals();

    renderSummary(list);

    renderHorizontalBar($chartStatus, countBy(list, "status", STATUS_ORDER, STATUS_LABELS));
    renderDonut($chartPriority, countBy(list, "priority", PRIORITY_ORDER, STATUS_LABELS));
    renderLollipop($chartCategory, countBy(list, "category", CATEGORY_ORDER, CATEGORY_LABELS));
    renderOrgChart($chartOrg, countBy(list, "receivingOrganization",
      list.map(r => r.receivingOrganization).filter((v, i, arr) => v && arr.indexOf(v) === i),
      {} // no label remap needed — org names are already display-ready
    ));

    renderActivity(list);
  }

  render();
})();