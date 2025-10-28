document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const container = document.querySelector(".container");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Get user input
    const username = form.querySelector('input[type="text"]').value.trim();
    const email = form.querySelector('input[type="email"]').value.trim();
    const password = form.querySelector('input[type="password"]').value.trim();

    // Validation
    if (username === "" || email === "" || password === "") {
      alert("⚠️ Please fill in all the details before signing up!");
      return;
    }

    // ✅ Store user data in localStorage
    localStorage.setItem("userData", JSON.stringify({
      username,
      email,
      password
    }));

    alert(`✅ Account created successfully for ${username}! Redirecting to login page...`);
    container.style.transform = "scale(0.95)";

    setTimeout(() => {
      window.location.href = "login.html";
    }, 600);
  });
});
