// =============================================================
// Login page — checks against MOCK_USERS (demo accounts only).
// On success, saves the logged-in user to localStorage so every
// other page can show "who you are" correctly, then goes to the
// dashboard.
// Replace with a real fetch('/api/v1/auth/login') once Matson's
// backend exists — MOCK_USERS gets deleted then.
//
// DEFENSIVE BY DESIGN: if mock-users.js or toast.js failed to load
// (wrong path, 404, typo in the <script> tag, browser cache serving
// an old login.html, etc.) this file no longer dies silently with
// an uncaught error that blocks the redirect. It falls back to a
// plain alert() and logs a clear message to the browser Console
// (F12 → Console tab) telling you exactly what's missing.
// =============================================================

(function () {
  // --- Safe toast helper: use the real one if it loaded, else alert() ---
  function notify(text, kind) {
    if (typeof window.showToast === "function") {
      window.showToast(text, kind || "success");
    } else {
      console.error(
        "[HudumaLink] toast.js did not load — add <script src=\"toast.js\"></script> " +
        "before login.js in login.html, and make sure toast.js sits in the same folder."
      );
      window.alert(text);
    }
  }

  // --- Guard: MOCK_USERS must exist before we can check anything ---
  if (!Array.isArray(window.MOCK_USERS)) {
    console.error(
      "[HudumaLink] window.MOCK_USERS is missing — mock-users.js did not load. " +
      "Check that mock-users.js is in the same folder as login.html and that " +
      "<script src=\"mock-users.js\"></script> appears BEFORE <script src=\"login.js\"></script>."
    );
    notify("Login is not set up correctly (missing mock-users.js). Check the browser Console (F12) for details.", "error");
    return;
  }

  const $form = document.getElementById("login-form");
  const $password = document.getElementById("password");
  const $toggle = document.getElementById("password-toggle");

  // --- Show/Hide password (eye toggle) ---
  if ($toggle && $password) {
    $toggle.addEventListener("click", function () {
      const isHidden = $password.type === "password";
      $password.type = isHidden ? "text" : "password";
      $toggle.setAttribute("aria-pressed", String(isHidden));
      $toggle.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
      $toggle.textContent = isHidden ? "🙈" : "👁";
    });
  }

  $form.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      notify("Please enter your email and password.", "error");
      return;
    }

    const match = window.MOCK_USERS.find(function (u) {
      return u.email.toLowerCase() === email && u.password === password;
    });

    if (!match) {
      notify("Incorrect email or password.", "error");
      return;
    }

    localStorage.setItem("hudumalink_logged_in_user", JSON.stringify(match));
    notify("Welcome, " + match.name + "!", "success");
    setTimeout(function () {
      window.location.href = "dashboard.html";
    }, 600);
  });
})();