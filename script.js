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
const trackBtn = document.querySelector('.track-btn');
const resultDiv = document.querySelector('.result');

// Function to validate IP address format
function isValidIP(ip) {
    const ipPattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipPattern.test(ip);
}

// Function to check for private IPs
function isPrivateIP(ip) {
    const privateRanges = [
        /^10\./,                                      // 10.0.0.0 - 10.255.255.255
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./,            // 172.16.0.0 - 172.31.255.255
        /^192\.168\./,                                // 192.168.0.0 - 192.168.255.255
        /^127\./,                                     // 127.0.0.0 - 127.255.255.255 (localhost)
        /^169\.254\./                                 // 169.254.0.0 - 169.254.255.255 (link-local)
    ];
    
    return privateRanges.some(range => range.test(ip));
}

// Function to display error messages
function showError(message) {
    resultDiv.innerHTML = `<div style="color: #ff6b6b; text-align: center; padding: 20px; background: rgba(255,107,107,0.1); border-radius: 8px; border-left: 4px solid #ff6b6b;">${message}</div>`;
}

// Most accurate IP geolocation with multiple API fallbacks
async function trackIPAddress(ip) {
    const APIs = [
        {
            name: 'ipapi.co',
            url: `https://ipapi.co/${ip}/json/`,
            parser: (data) => ({
                ip: data.ip,
                country: data.country_name,
                regionName: data.region,
                city: data.city,
                isp: data.org,
                timezone: data.timezone,
                lat: data.latitude,
                lon: data.longitude,
                accuracy: 'IP Database'
            })
        },
        {
            name: 'ip-api.com',
            url: `https://ip-api.com/json/${ip}?fields=status,message,country,regionName,city,isp,timezone,lat,lon,query`,
            parser: (data) => ({
                ip: data.query,
                country: data.country,
                regionName: data.regionName,
                city: data.city,
                isp: data.isp,
                timezone: data.timezone,
                lat: data.lat,
                lon: data.lon,
                accuracy: 'IP Database'
            })
        },
        {
            name: 'ipwhois',
            url: `https://ipwho.is/${ip}`,
            parser: (data) => ({
                ip: data.ip,
                country: data.country,
                regionName: data.region,
                city: data.city,
                isp: data.connection?.isp,
                timezone: data.timezone?.id,
                lat: data.latitude,
                lon: data.longitude,
                accuracy: 'IP Database'
            })
        }
    ];

    let results = [];
    let lastError = '';

    // Try all APIs and collect results
    for (const api of APIs) {
        try {
            const response = await fetch(api.url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            
            // Validate data based on API
            let isValid = false;
            if (api.name === 'ip-api.com' && data.status === 'success') isValid = true;
            if (api.name === 'ipwhois' && data.success) isValid = true;
            if (api.name === 'ipapi.co' && data.ip) isValid = true;
            
            if (isValid) {
                const parsedData = api.parser(data);
                results.push({
                    data: parsedData,
                    source: api.name,
                    confidence: calculateConfidence(parsedData)
                });
            }
            
        } catch (error) {
            lastError = `${api.name} failed: ${error.message}`;
            console.warn(lastError);
        }
    }
    
    // Return the most confident result
    if (results.length > 0) {
        results.sort((a, b) => b.confidence - a.confidence);
        return { 
            success: true, 
            data: results[0].data, 
            source: results[0].source,
            allResults: results,
            confidence: results[0].confidence
        };
    }
    
    return { success: false, error: `All geolocation APIs failed. ${lastError}` };
}

// Calculate confidence score for results
function calculateConfidence(data) {
    let confidence = 0;
    
    if (data.city && data.city !== '') confidence += 30;
    if (data.regionName && data.regionName !== '') confidence += 25;
    if (data.country && data.country !== '') confidence += 20;
    if (data.isp && data.isp !== '') confidence += 15;
    if (data.lat && data.lon) confidence += 10;
    
    return confidence;
}

// Get user's public IP
async function getPublicIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error('Failed to get public IP:', error);
        return null;
    }
}

// Track user's public IP
async function trackPublicIP() {
    const publicIP = await getPublicIP();
    
    if (!publicIP) {
        showError('Failed to detect your public IP address');
        return;
    }
    
    // Auto-fill the input
    document.querySelector('.tracker-input').value = publicIP;
    
    // Show loading
    resultDiv.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <div style="color: #4ecdc4; margin-bottom: 10px;">
                <i class="fas fa-spinner fa-spin" style="font-size: 24px;"></i>
            </div>
            <p style="color: #4ecdc4;">Tracking Your Public IP: ${publicIP}</p>
            <p style="color: #a0a0a0; font-size: 14px;">Getting the most accurate location data...</p>
        </div>
    `;
    
    // Track the IP
    const result = await trackIPAddress(publicIP);
    
    if (result.success) {
        showIPResults(result.data, result.source, result.confidence);
        
        // Show accuracy comparison
        showAccuracyComparison();
    } else {
        showError(result.error);
    }
}

// Display IP-based results
function showIPResults(data, source, confidence) {
    const confidenceColor = confidence >= 70 ? '#28a745' : confidence >= 50 ? '#ffc107' : '#dc3545';
    const confidenceText = confidence >= 70 ? 'High' : confidence >= 50 ? 'Medium' : 'Low';
    
    resultDiv.innerHTML = `
        <div style="background: var(--card-bg); padding: 20px; border-radius: 8px; border-left: 4px solid var(--primary-blue); margin-bottom: 15px;">
            <h4 style="color: var(--primary-blue); margin-top: 0; display: flex; justify-content: space-between; align-items: center;">
                <span>🌐 IP-Based Location</span>
                <span style="font-size: 12px; background: ${confidenceColor}; color: white; padding: 2px 8px; border-radius: 10px;">
                    Confidence: ${confidenceText}
                </span>
            </h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div><strong>IP:</strong> ${data.ip || 'N/A'}</div>
                <div><strong>Country:</strong> ${data.country || 'N/A'}</div>
                <div><strong>Region:</strong> ${data.regionName || 'N/A'}</div>
                <div><strong>City:</strong> ${data.city || 'N/A'}</div>
                <div><strong>ISP:</strong> ${data.isp || 'N/A'}</div>
                <div><strong>Timezone:</strong> ${data.timezone || 'N/A'}</div>
            </div>
            <div style="margin-top: 10px; font-size: 12px; color: #888;">
                Source: ${source} | Coordinates: ${data.lat || 'N/A'}, ${data.lon || 'N/A'}
            </div>
        </div>
        <div id="accuracyComparison" style="text-align: center;">
            <p style="color: #a0a0a0; margin-bottom: 15px;">For maximum accuracy, use GPS location below</p>
        </div>
    `;
}

// Show accuracy comparison section
function showAccuracyComparison() {
    const comparisonDiv = document.getElementById('accuracyComparison');
    if (comparisonDiv) {
        comparisonDiv.innerHTML = `
            <div style="background: #fff3cd; color: #856404; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 15px 0;">
                <strong>💡 Accuracy Notice:</strong><br>
                IP geolocation shows where your ISP routes traffic, which may differ from your actual location.
            </div>
            <button onclick="getPreciseLocation()" style="background: #28a745; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: bold; cursor: pointer; transition: all 0.3s ease;">
                <i class="fas fa-map-marker-alt"></i> Get Precise GPS Location
            </button>
        `;
    }
}

// Most accurate GPS location
function getPreciseLocation() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser');
        return;
    }

    const originalContent = resultDiv.innerHTML;
    
    resultDiv.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <div style="color: #28a745; margin-bottom: 10px;">
                <i class="fas fa-spinner fa-spin" style="font-size: 24px;"></i>
            </div>
            <p style="color: #28a745; font-weight: bold;">Getting Precise GPS Location</p>
            <p style="color: #a0a0a0; font-size: 12px;">Please allow location access when prompted<br>This uses your device's GPS for maximum accuracy</p>
        </div>
    `;

    navigator.geolocation.getCurrentPosition(
        function(position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const accuracy = position.coords.accuracy;
            
            // Get address from coordinates (reverse geocoding)
            reverseGeocode(lat, lon, accuracy);
        },
        function(error) {
            let errorMessage = 'Unable to get precise location. ';
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = 'Location access was denied. Please allow location permissions and try again.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = 'Location information is unavailable. Please check your device settings.';
                    break;
                case error.TIMEOUT:
                    errorMessage = 'Location request timed out. Please try again.';
                    break;
                default:
                    errorMessage = 'An unknown error occurred while getting location.';
                    break;
            }
            
            resultDiv.innerHTML = originalContent + `
                <div style="background: rgba(255,107,107,0.1); color: #ff6b6b; padding: 15px; border-radius: 8px; border-left: 4px solid #ff6b6b; margin-top: 15px;">
                    <strong>⚠️ GPS Failed:</strong> ${errorMessage}
                </div>
            `;
        },
        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        }
    );
}

// Reverse geocode coordinates to get address
async function reverseGeocode(lat, lon, accuracy) {
    try {
        const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
        const data = await response.json();
        
        showGPSResults(lat, lon, accuracy, data);
    } catch (error) {
        // Fallback: Show coordinates without address
        showGPSResults(lat, lon, accuracy, null);
    }
}

// Display GPS results
function showGPSResults(lat, lon, accuracy, addressData) {
    const accuracyLevel = accuracy <= 50 ? 'High' : accuracy <= 100 ? 'Good' : accuracy <= 500 ? 'Moderate' : 'Low';
    const accuracyColor = accuracy <= 50 ? '#28a745' : accuracy <= 100 ? '#ffc107' : '#dc3545';
    
    let addressHtml = '';
    if (addressData) {
        addressHtml = `
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid var(--border-color);">
                <strong>📍 Address:</strong><br>
                ${addressData.locality || addressData.city || 'N/A'}, 
                ${addressData.principalSubdivision || 'N/A'}, 
                ${addressData.countryName || 'N/A'}
            </div>
        `;
    }
    
    resultDiv.innerHTML += `
        <div style="background: var(--card-bg); padding: 20px; border-radius: 8px; border-left: 4px solid #28a745; margin-top: 15px;">
            <h4 style="color: #28a745; margin-top: 0; display: flex; justify-content: space-between; align-items: center;">
                <span>📱 Precise GPS Location</span>
                <span style="font-size: 12px; background: ${accuracyColor}; color: white; padding: 2px 8px; border-radius: 10px;">
                    Accuracy: ${accuracyLevel} (${Math.round(accuracy)}m)
                </span>
            </h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div><strong>Latitude:</strong> ${lat.toFixed(6)}</div>
                <div><strong>Longitude:</strong> ${lon.toFixed(6)}</div>
                <div><strong>Accuracy:</strong> ${Math.round(accuracy)} meters</div>
                <div><strong>Source:</strong> Device GPS</div>
            </div>
            ${addressHtml}
            <div style="text-align: center; margin-top: 15px;">
                <a href="https://maps.google.com/?q=${lat},${lon}" target="_blank" style="background: #dc3545; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; display: inline-block; font-size: 14px;">
                    <i class="fas fa-external-link-alt"></i> Open in Google Maps
                </a>
            </div>
        </div>
    `;
}

// Main tracking function
trackBtn.addEventListener('click', async () => {
    const ipInput = document.querySelector('.tracker-input').value.trim();

    // Validate input
    if (!ipInput) {
        showError('Please enter an IP address or click "Track My Public IP"');
        return;
    }

    // Check if it's a private IP
    if (isPrivateIP(ipInput)) {
        resultDiv.innerHTML = `
            <div style="background: #fff3cd; color: #856404; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
                <h4 style="margin-top: 0; color: #856404;">⚠️ Private IP Address Detected</h4>
                <p><strong>You entered:</strong> ${ipInput}</p>
                <p>This is a <strong>private IP address</strong> that only works within your local network.</p>
                <p>IP tracking services can only track <strong>public IP addresses</strong>.</p>
                <div style="text-align: center; margin-top: 15px;">
                    <button onclick="trackPublicIP()" style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 14px;">
                        Track My Public IP Instead
                    </button>
                </div>
            </div>
        `;
        return;
    }

    // Validate IP format
    if (!isValidIP(ipInput)) {
        showError('Please enter a valid IP address format (e.g., 8.8.8.8 or 192.168.1.1)');
        return;
    }

    // Show loading state
    resultDiv.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <div style="color: #4ecdc4; margin-bottom: 10px;">
                <i class="fas fa-spinner fa-spin" style="font-size: 24px;"></i>
            </div>
            <p style="color: #4ecdc4;">Tracking IP: ${ipInput}</p>
            <p style="color: #a0a0a0; font-size: 14px;">Getting the most accurate location data...</p>
        </div>
    `;

    try {
        const result = await trackIPAddress(ipInput);
        
        if (result.success) {
            showIPResults(result.data, result.source, result.confidence);
            showAccuracyComparison();
        } else {
            showError(result.error);
        }
    } catch (error) {
        console.error('Tracking error:', error);
        showError('Network error. Please check your internet connection and try again.');
    }
});

// Add Enter key support
document.querySelector('.tracker-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        trackBtn.click();
    }
});

// Input validation styling
document.querySelector('.tracker-input').addEventListener('input', function(e) {
    const ip = e.target.value.trim();
    if (ip && !isValidIP(ip)) {
        e.target.style.borderColor = '#ff6b6b';
    } else {
        e.target.style.borderColor = '#ccc';
    }
});

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Add Track My IP button
    const trackMyIPBtn = document.createElement('button');
    trackMyIPBtn.textContent = 'Track My Public IP';
    trackMyIPBtn.className = 'track-my-ip-btn';
    trackMyIPBtn.style.cssText = `
        background: #4ecdc4;
        color: white;
        padding: 12px 24px;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        margin-left: 10px;
        transition: all 0.3s ease;
    `;
    
    trackMyIPBtn.addEventListener('mouseenter', function() {
        this.style.background = '#3bb4ac';
        this.style.transform = 'translateY(-2px)';
    });
    
    trackMyIPBtn.addEventListener('mouseleave', function() {
        this.style.background = '#4ecdc4';
        this.style.transform = 'translateY(0)';
    });
    
    trackMyIPBtn.addEventListener('click', trackPublicIP);
    trackBtn.parentNode.insertBefore(trackMyIPBtn, trackBtn.nextSibling);

    // Add GPS button
    const gpsBtn = document.createElement('button');
    gpsBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i> GPS Location';
    gpsBtn.className = 'gps-btn';
    gpsBtn.style.cssText = `
        background: #28a745;
        color: white;
        padding: 12px 24px;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        margin-left: 10px;
        transition: all 0.3s ease;
    `;
    
    gpsBtn.addEventListener('mouseenter', function() {
        this.style.background = '#218838';
        this.style.transform = 'translateY(-2px)';
    });
    
    gpsBtn.addEventListener('mouseleave', function() {
        this.style.background = '#28a745';
        this.style.transform = 'translateY(0)';
    });
    
    gpsBtn.addEventListener('click', getPreciseLocation);
    trackBtn.parentNode.insertBefore(gpsBtn, trackMyIPBtn.nextSibling);
});

// ===== VIDEO SLIDER FUNCTIONALITY =====
const videos = document.querySelectorAll('.hero-video');
let currentVideo = 0;
const changeInterval = 7000; // 7 seconds per video

// Only run if there are multiple videos
if (videos.length > 1) {
    setInterval(() => {
        videos[currentVideo].classList.remove('active');
        currentVideo = (currentVideo + 1) % videos.length;
        videos[currentVideo].classList.add('active');
    }, changeInterval);
}