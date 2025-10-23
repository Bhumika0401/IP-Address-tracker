// ====== LOGIN.JS ======
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const container = document.querySelector(".container");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Get input values
    const username = form.querySelector('input[type="text"]').value.trim();
    const password = form.querySelector('input[type="password"]').value.trim();

    // Basic validation
    if (username === "" || password === "") {
      alert("⚠️ Please fill in both Username and Password!");
      return;
    }

    // Retrieve user data from localStorage
    const storedData = JSON.parse(localStorage.getItem("userData"));

    // Check if user exists
    if (!storedData) {
      alert("❌ No account found! Please sign up first.");
      return;
    }

    // Check credentials
    if (username === storedData.username && password === storedData.password) {
      alert(`✅ Welcome back, ${username}! Redirecting to homepage...`);

      // ✅ Store username for homepage display
      localStorage.setItem("loggedInUser", username);

      container.style.transform = "scale(0.95)";
      setTimeout(() => {
        window.location.href = "indexhome.html"; // Homepage
      }, 600);
    } else {
      alert("❌ Invalid username or password. Please try again!");
    }
  });
});
