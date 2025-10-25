// ===== MOBILE NAVBAR TOGGLE =====
const navToggle = document.querySelector('.nav-toggle');
const navList = document.querySelector('.nav-list');

navToggle.addEventListener('click', () => {
  navList.classList.toggle('active');
});

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    document.querySelector(this.getAttribute('href')).scrollIntoView({
      behavior: 'smooth'
    });
  });
});

// ===== IP TRACKER FUNCTIONALITY =====
const trackBtn = document.querySelector('.tracker button');
const resultDiv = document.querySelector('.result');

trackBtn.addEventListener('click', async () => {
  const ipInput = document.querySelector('.tracker input').value.trim();

  if (!ipInput) {
    resultDiv.innerHTML = "<p>Please enter a valid IP address.</p>";
    return;
  }

  try {
    resultDiv.innerHTML = "<p>Loading...</p>";

    const res = await fetch(`https://ipapi.co/${ipInput}/json/`);
    const data = await res.json();

    if (data.error) {
      resultDiv.innerHTML = `<p>${data.reason}</p>`;
    } else {
      resultDiv.innerHTML = `
        <strong>IP:</strong> ${data.ip}<br>
        <strong>Country:</strong> ${data.country_name}<br>
        <strong>Region:</strong> ${data.region}<br>
        <strong>City:</strong> ${data.city}<br>
        <strong>ISP:</strong> ${data.org}<br>
        <strong>Timezone:</strong> ${data.timezone}
      `;
    }
  } catch (err) {
    resultDiv.innerHTML = "<p>Unable to fetch data. Please try again later.</p>";
  }
});
     const videos = document.querySelectorAll('.hero-video');
    let currentVideo = 0;
    const changeInterval = 7000; // 8 seconds per video

    setInterval(() => {
        videos[currentVideo].classList.remove('active');
        currentVideo = (currentVideo + 1) % videos.length;
        videos[currentVideo].classList.add('active');
    }, changeInterval);


