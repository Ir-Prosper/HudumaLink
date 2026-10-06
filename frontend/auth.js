// =============================================================
// Auth guard + sidebar user display + logout.
//
// Include this as the FIRST <script> on every page inside the
// app shell: dashboard.html, referrals.html, referral-new.html,
// referral-detail.html, partners.html, reports.html, settings.html.
// Do NOT include it on login.html.
//
// What it does:
// 1. If nobody is logged in (no entry in localStorage), redirects
//    straight to login.html — so opening any inner page directly
//    always asks for a login first.
// 2. Fills in the sidebar avatar/name/role and the topbar avatar
//    initial from whoever actually logged in (no more hardcoded
//    "Grace A. / OPM" on every page).
// 3. Wires the sidebar Logout button (#btn-logout) to clear the
//    session and send the user back to login.html.
//
// Later: once Matson's backend exists, swap the localStorage read
// below for a real session check (e.g. a token validity check).
// =============================================================

(function () {
  const ROLE_LABELS = {
    CASE_WORKER: "Case worker",
    SUPERVISOR: "Supervisor",
    ORG_ADMIN: "Org admin"
  };

  const raw = localStorage.getItem("hudumalink_logged_in_user");
  const user = raw ? JSON.parse(raw) : null;

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  function paint() {
    const initial = (user.name || "?").trim().charAt(0).toUpperCase();
    const roleLabel = ROLE_LABELS[user.role] || user.role;

    const $sideAvatar = document.getElementById("sidebar-user-avatar");
    const $sideName = document.getElementById("sidebar-user-name");
    const $sideRole = document.getElementById("sidebar-user-role");
    const $topAvatar = document.getElementById("topbar-user-avatar");
    const $logout = document.getElementById("btn-logout");

    if ($sideAvatar) $sideAvatar.textContent = initial;
    if ($sideName) $sideName.textContent = user.name;
    if ($sideRole) $sideRole.textContent = user.organizationName + " · " + roleLabel;
    if ($topAvatar) $topAvatar.textContent = initial;

    if ($logout) {
      $logout.addEventListener("click", function () {
        localStorage.removeItem("hudumalink_logged_in_user");
        window.location.href = "login.html";
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", paint);
  } else {
    paint();
  }
})();