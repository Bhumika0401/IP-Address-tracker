// ====== LOGIN.JS ======

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("container");
  const loginForm = document.getElementById("loginForm");
  const form = loginForm.querySelector("form");

  // When login form is submitted
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const username = form.querySelector('input[type="text"]').value.trim();
    const password = form.querySelector('input[type="password"]').value.trim();

    // Check if fields are empty
    if (username === "" || password === "") {
      alert("⚠️ Please fill in both Username and Password!");
      return;
    }

    // ✅ Successful login
    alert(`✅ Welcome, ${username}! Redirecting to homepage...`);

    container.style.transform = "scale(0.95)";

    setTimeout(() => {
      window.location.href = "indexhome.html"; // change this if your homepage has another name
    }, 500);
  });

  // Register button animation (optional)
  const registerBtn = document.getElementById("registerBtn");
  if (registerBtn) {
    registerBtn.addEventListener("click", (e) => {
      e.preventDefault();
      container.style.transform = "scale(0.95)";
      setTimeout(() => {
        window.location.href = "register.html";
      }, 400);
    });
  }
});
