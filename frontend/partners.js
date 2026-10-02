// =============================================================
// Partners / NGOs page logic.
// Reads from window.MOCK_ORGANIZATIONS (SRS §26 GET /api/v1/organizations).
// - Renders a card grid of every organization
// - Search filters by name / full name / staff name
// - Clicking a card opens a right-side panel with the staff list
// Later: replace getOrgs() with a real fetch() call.
// =============================================================

(function () {
  const $grid = document.getElementById("partners-grid");
  const $empty = document.getElementById("partners-empty");
  const $summary = document.getElementById("partners-summary");
  const $search = document.getElementById("partner-search");

  const $backdrop = document.getElementById("partner-panel-backdrop");
  const $panel = document.getElementById("partner-panel");
  const $panelClose = document.getElementById("panel-close");
  const $panelOrgName = document.getElementById("panel-org-name");
  const $panelOrgFullName = document.getElementById("panel-org-fullname");
  const $panelStaff = document.getElementById("panel-staff");
  const $panelOrgId = document.getElementById("panel-org-id");
  const $panelOrgCode = document.getElementById("panel-org-code");
  const $panelStaffCount = document.getElementById("panel-staff-count");

  let searchTerm = "";

  // -------------------------------------------------------------
  // Data access — the single seam for the future real backend.
  // -------------------------------------------------------------
  function getOrgs() {
    return window.MOCK_ORGANIZATIONS.data;
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text == null ? "" : text;
    return div.innerHTML;
  }

  function initials(name) {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(function (w) { return w[0].toUpperCase(); })
      .join("");
  }

  // Short "code" for an org — first 3 letters of name, uppercase.
  // Real backend will supply a proper code; this is display-only.
  function orgCode(org) {
    return org.name.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase();
  }

  // -------------------------------------------------------------
  // Filtering
  // -------------------------------------------------------------
  function filterOrgs(list) {
    if (!searchTerm) return list;
    const q = searchTerm.toLowerCase();
    return list.filter(function (o) {
      if (o.name.toLowerCase().includes(q)) return true;
      if ((o.fullName || "").toLowerCase().includes(q)) return true;
      // match if any staff name contains the query
      return (o.staff || []).some(function (s) {
        return s.name.toLowerCase().includes(q);
      });
    });
  }

  // -------------------------------------------------------------
  // Render card grid
  // -------------------------------------------------------------
  function render() {
    const all = getOrgs();
    const list = filterOrgs(all);

    $summary.textContent =
      list.length + " of " + all.length + " organizations";

    $grid.innerHTML = "";

    if (list.length === 0) {
      $empty.hidden = false;
      return;
    }
    $empty.hidden = true;

    list.forEach(function (o) {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "partner-card";
      card.dataset.orgId = o.id;

      const staffCount = (o.staff || []).length;
      const staffPreview = (o.staff || [])
        .slice(0, 3)
        .map(function (s) {
          return '<span class="partner-card-staff-pill">' + escapeHtml(s.name) + "</span>";
        })
        .join("");

      card.innerHTML =
        '<div class="partner-card-head">' +
          '<span class="partner-card-avatar">' + escapeHtml(initials(o.name)) + "</span>" +
          '<div class="partner-card-titles">' +
            '<p class="partner-card-name">' + escapeHtml(o.name) + "</p>" +
            '<p class="partner-card-fullname">' + escapeHtml(o.fullName) + "</p>" +
          "</div>" +
        "</div>" +
        '<div class="partner-card-meta">' +
          '<span class="partner-card-count">' +
            staffCount + (staffCount === 1 ? " staff member" : " staff members") +
          "</span>" +
          '<span class="dashboard-status resolved">Active</span>' +
        "</div>" +
        '<div class="partner-card-staff">' + staffPreview + "</div>";

      card.addEventListener("click", function () {
        openPanel(o.id);
      });

      $grid.appendChild(card);
    });
  }

  // -------------------------------------------------------------
  // Side panel
  // -------------------------------------------------------------
  function openPanel(orgId) {
    const org = getOrgs().find(function (o) { return o.id === orgId; });
    if (!org) return;

    $panelOrgName.textContent = org.name;
    $panelOrgFullName.textContent = org.fullName;
    $panelOrgId.textContent = org.id;
    $panelOrgCode.textContent = orgCode(org);
    $panelStaffCount.textContent = (org.staff || []).length;

    $panelStaff.innerHTML = "";
    (org.staff || []).forEach(function (s) {
      const li = document.createElement("li");
      li.className = "partner-staff-item";
      li.innerHTML =
        '<span class="partner-staff-avatar">' + escapeHtml(initials(s.name)) + "</span>" +
        '<div class="partner-staff-info">' +
          '<p class="partner-staff-name">' + escapeHtml(s.name) + "</p>" +
          '<p class="partner-staff-id">Staff ID: ' + escapeHtml(String(s.id)) + "</p>" +
        "</div>";
      $panelStaff.appendChild(li);
    });

    $backdrop.hidden = false;
    // give the browser a frame to paint the backdrop before sliding
    requestAnimationFrame(function () {
      $panel.classList.add("partner-panel-open");
      $backdrop.classList.add("partner-panel-backdrop-show");
    });
    $panel.setAttribute("aria-hidden", "false");
  }

  function closePanel() {
    $panel.classList.remove("partner-panel-open");
    $backdrop.classList.remove("partner-panel-backdrop-show");
    $panel.setAttribute("aria-hidden", "true");
    // after the animation completes, hide the backdrop
    setTimeout(function () {
      $backdrop.hidden = true;
    }, 250);
  }

  $panelClose.addEventListener("click", closePanel);
  $backdrop.addEventListener("click", closePanel);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && $panel.classList.contains("partner-panel-open")) {
      closePanel();
    }
  });

  // -------------------------------------------------------------
  // Search
  // -------------------------------------------------------------
  $search.addEventListener("input", function (e) {
    searchTerm = e.target.value.trim();
    render();
  });

  // -------------------------------------------------------------
  // Init
  // -------------------------------------------------------------
  render();
})();