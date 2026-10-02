// =============================================================
// Toast notifications.
// Call window.showToast("message", "success" | "error") from
// anywhere. Creates its own container on first use — no HTML
// changes needed on any page, just add this script tag.
// Slides in from the right, stays a few seconds, slides back out.
// =============================================================

window.showToast = function (message, kind) {
  kind = kind || "success";

  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = "toast toast-" + kind;
  toast.textContent = message;
  container.appendChild(toast);

  // Let the browser paint it first, then animate in
  requestAnimationFrame(function () {
    toast.classList.add("toast-show");
  });

  // Stay visible 3.5s (enough time to read), then slide out and remove
  setTimeout(function () {
    toast.classList.remove("toast-show");
    toast.classList.add("toast-hide");
    setTimeout(function () { toast.remove(); }, 400);
  }, 3500);
};

// Demo utility: Shift + Alt + R wipes localStorage and reloads.
// Useful during a live demo to reset to the seed data.
document.addEventListener("keydown", function (e) {
  if (e.shiftKey && e.altKey && (e.key === "R" || e.key === "r")) {
    if (typeof window.resetReferralData === "function") {
      window.resetReferralData();
    } else {
      localStorage.removeItem("hudumalink_referrals");
      location.reload();
    }
  }
});