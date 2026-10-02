// =============================================================
// Settings page logic.
// - Profile: reads CURRENT_USER + MOCK_ORGANIZATIONS
// - Change Password: client-side validation only (backend validates for real)
// - Users Management: lists ALL staff across all orgs, with role + status
// - Organization info: current user's org
// Later: replace with fetch('/api/v1/users') and PUT endpoints.
// =============================================================

(function () {
  const user = window.CURRENT_USER;
  const orgs = window.MOCK_ORGANIZATIONS.data;

  // -------------------------------------------------------------
  // Build a fake users list from the orgs' staff arrays.
  // Each user gets a role derived deterministically + an active flag.
  // Stable across reloads because it's derived from the fixed mock.
  // -------------------------------------------------------------
  function buildUsers() {
    const users = [];
    let id = 1;

    orgs.forEach(function (org) {
      (org.staff || []).forEach(function (s, idx) {
        // First staff member of each org is the Org Admin.
        // Second is a Supervisor. The rest are Case Workers.
        let role = "CASE_WORKER";
        if (idx === 0) role = "ORG_ADMIN";
        else if (idx === 1) role = "SUPERVISOR";

        // Generate a plausible email from the org code + staff name.
        const code = org.name.replace(/[^A-Za-z]/g, "").toLowerCase();
        const slug = s.name
          .toLowerCase()
          .replace(/[^a-z]+/g, ".")
          .replace(/^\.|\.$/g, "");
        const email = slug + "@" + code + ".org";

        users.push({
          id: id++,
          name: s.name,
          email: email,
          role: role,
          organizationId: org.id,
          organization: org.name,
          status: "ACTIVE"
        });
      });
    });

    return users;
  }

  // The users list is kept in memory for the session. Any toggle
  // is persisted to localStorage so it survives navigation, like
  // the referrals list.
  const USERS_KEY = "hudumalink_users";

  function getUsers() {
    const raw = localStorage.getItem(USERS_KEY);
    if (raw) return JSON.parse(raw);
    const built = buildUsers();
    localStorage.setItem(USERS_KEY, JSON.stringify(built));
    return built;
  }

  function saveUsers(list) {
    localStorage.setItem(USERS_KEY, JSON.stringify(list));
  }

  // -------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------
  const ROLE_LABELS = {
    CASE_WORKER: "Case Worker",
    SUPERVISOR: "Supervisor",
    ORG_ADMIN: "Org Admin"
  };

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

  // -------------------------------------------------------------
  // PROFILE
  // -------------------------------------------------------------
  function renderProfile() {
    const myOrg = orgs.find(function (o) { return o.id === user.organizationId; });

    document.getElementById("profile-avatar").textContent = initials(user.name);
    document.getElementById("profile-name").textContent = user.name;
    document.getElementById("profile-email").textContent =
      user.name.toLowerCase().replace(/\s+/g, ".") + "@opm.gov.ug";
    document.getElementById("profile-role").textContent =
      ROLE_LABELS[user.role] || user.role;
    document.getElementById("profile-org").textContent = user.organizationName;
    document.getElementById("profile-org-id").textContent = user.organizationId;
    document.getElementById("profile-id").textContent = user.id;

    // Organization section
    document.getElementById("org-name").textContent = user.organizationName;
    document.getElementById("org-fullname").textContent = myOrg ? myOrg.fullName : "—";
    document.getElementById("org-staff-count").textContent =
      (myOrg && myOrg.staff ? myOrg.staff.length : 0) +
      ((myOrg && myOrg.staff && myOrg.staff.length === 1) ? " staff member" : " staff members");
  }

  // -------------------------------------------------------------
  // PASSWORD
  // -------------------------------------------------------------
  const $pwForm = document.getElementById("password-form");
  const $pwCurrent = document.getElementById("current-password");
  const $pwNew = document.getElementById("new-password");
  const $pwConfirm = document.getElementById("confirm-password");

  document.getElementById("password-cancel").addEventListener("click", function () {
    $pwForm.reset();
  });

  $pwForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const current = $pwCurrent.value;
    const next = $pwNew.value;
    const confirm = $pwConfirm.value;

    if (!current) {
      window.showToast("Enter your current password.", "error");
      $pwCurrent.focus();
      return;
    }
    if (next.length < 8) {
      window.showToast("New password must be at least 8 characters.", "error");
      $pwNew.focus();
      return;
    }
    if (!/\d/.test(next)) {
      window.showToast("New password must contain at least one number.", "error");
      $pwNew.focus();
      return;
    }
    if (next !== confirm) {
      window.showToast("New password and confirmation do not match.", "error");
      $pwConfirm.focus();
      return;
    }
    if (next === current) {
      window.showToast("New password must be different from the current one.", "error");
      $pwNew.focus();
      return;
    }

    // Simulated success. Real backend would POST to /api/v1/auth/change-password
    window.showToast("Password changed successfully.", "success");
    $pwForm.reset();
  });

  // -------------------------------------------------------------
  // USERS MANAGEMENT
  // -------------------------------------------------------------
  const $userBody = document.getElementById("user-table-body");
  const $userEmpty = document.getElementById("user-empty");
  const $userSearch = document.getElementById("user-search");
  const $userRoleFilter = document.getElementById("user-role-filter");
  const $userOrgFilter = document.getElementById("user-org-filter");
  const $userCount = document.getElementById("user-count");

  // Populate org filter dropdown
  orgs.forEach(function (o) {
    const opt = document.createElement("option");
    opt.value = o.id;
    opt.textContent = o.name;
    $userOrgFilter.appendChild(opt);
  });

  const userFilters = {
    search: "",
    role: "",
    org: ""
  };

  function applyUserFilters(list) {
    return list.filter(function (u) {
      if (userFilters.role && u.role !== userFilters.role) return false;
      if (userFilters.org && String(u.organizationId) !== userFilters.org) return false;
      if (userFilters.search) {
        const q = userFilters.search.toLowerCase();
        if (!u.name.toLowerCase().includes(q) &&
            !u.email.toLowerCase().includes(q) &&
            !u.organization.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }

  function renderUsers() {
    const all = getUsers();
    const list = applyUserFilters(all);

    $userCount.textContent =
      list.length + " of " + all.length + " users";

    $userBody.innerHTML = "";

    if (list.length === 0) {
      $userEmpty.hidden = false;
      return;
    }
    $userEmpty.hidden = true;

    list.forEach(function (u) {
      const row = document.createElement("div");
      row.className = "settings-user-row";

      const statusClass = u.status === "ACTIVE" ? "resolved" : "cancelled";
      const actionLabel = u.status === "ACTIVE" ? "Deactivate" : "Activate";

      row.innerHTML =
        '<span class="settings-user-name">' + escapeHtml(u.name) + '</span>' +
        '<span class="settings-user-email">' + escapeHtml(u.email) + '</span>' +
        '<span class="settings-user-role">' + escapeHtml(ROLE_LABELS[u.role] || u.role) + '</span>' +
        '<span class="settings-user-org">' + escapeHtml(u.organization) + '</span>' +
        '<span class="dashboard-status ' + statusClass + '">' + u.status + '</span>' +
        '<button type="button" class="btn btn-ghost settings-user-action" data-user-id="' + u.id + '">' +
          actionLabel +
        '</button>';

      $userBody.appendChild(row);
    });

    // Wire up the action buttons
    $userBody.querySelectorAll(".settings-user-action").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const uid = parseInt(btn.dataset.userId, 10);
        toggleUserStatus(uid);
      });
    });
  }

  function toggleUserStatus(userId) {
    const list = getUsers();
    const u = list.find(function (x) { return x.id === userId; });
    if (!u) return;

    u.status = u.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    saveUsers(list);

    window.showToast(
      u.name + " is now " + (u.status === "ACTIVE" ? "active" : "inactive") + ".",
      "success"
    );
    renderUsers();
  }

  $userSearch.addEventListener("input", function (e) {
    userFilters.search = e.target.value.trim();
    renderUsers();
  });

  $userRoleFilter.addEventListener("change", function (e) {
    userFilters.role = e.target.value;
    renderUsers();
  });

  $userOrgFilter.addEventListener("change", function (e) {
    userFilters.org = e.target.value;
    renderUsers();
  });

  // -------------------------------------------------------------
  // INIT
  // -------------------------------------------------------------
  renderProfile();
  renderUsers();
})();