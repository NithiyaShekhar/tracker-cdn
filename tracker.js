(function () {
    const API_ENDPOINT = "https://24f6-60-243-64-58.ngrok-free.app/webhook";
    let sessionStartTime = Date.now();
  
    // Function to Get or Generate User ID
    function getUserId() {
      return localStorage.getItem("userId") || null; // Fetch the actual user ID
  }
  
  
  
    function getUserEmail() {
      return localStorage.getItem("userEmail") || "guest@example.com"; // email retrieval logic
  }
  
  function getUserRole() {
      return localStorage.getItem("userRole") || "guest"; // role retrieval logic
  }
  
    // Get Referrer Source
    function getReferrerSource() {
        const referrer = document.referrer;
        if (!referrer) return "Direct";
        if (referrer.includes("facebook.com")) return "Facebook";
        if (referrer.includes("instagram.com")) return "Instagram";
        if (referrer.includes("youtube.com")) return "YouTube";
        if (referrer.includes("twitter.com") || referrer.includes("x.com")) return "Twitter/X";
        if (referrer.includes("linkedin.com")) return "LinkedIn";
        if (referrer.includes("google.com")) return "Google Search";
        if (referrer.includes("bing.com")) return "Bing Search";
        if (referrer.includes("tiktok.com")) return "TikTok";
        return referrer;
    }
  
    // Send Tracking Data
    function sendTrackingData(eventType, extraData = {}) {
        const userId = getUserId();
        const email = getUserEmail();
        const role = getUserRole();
        const userAgent = navigator.userAgent;
        const platform = `${navigator.platform} - ${navigator.appVersion}`;
        const pageURL = window.location.href;
        const timestamp = new Date().toISOString();
  
        const trackingData = {
            userId,
            email,
            role,
            eventType,
            timestamp,
            platform,
            pageURL,
            referrer: getReferrerSource(),
            sessionDuration: Math.floor((Date.now() - sessionStartTime) / 1000) + "s",
            ...extraData
        };
  
        // Store in LocalStorage
        localStorage.setItem("userTrackingData", JSON.stringify(trackingData));
  
        // Send to API
        fetch(API_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(trackingData),
             mode: "cors"
        })
            .then((response) => response.json())
          //   .then((data) => console.log("✅ Data sent:", data))
            .catch((error) => console.error("❌ API Error:", error));
    }
  
    // Track Events
    document.addEventListener("click", function (event) {
        if (event.target.tagName === "BUTTON") {
            sendTrackingData("Button Click", { buttonName: event.target.innerText });
        }
        if (event.target.tagName === "IMG") {
            sendTrackingData("Image Click", { imageSrc: event.target.src });
        }
        if (event.target.tagName === "A") {
            sendTrackingData("Navigation Click", { link: event.target.href });
        }
    });
  
    document.addEventListener("submit", function (event) {
        if (event.target.tagName === "FORM") {
            event.preventDefault();
            const formData = {};
            new FormData(event.target).forEach((value, key) => {
                formData[key] = value;
            });
  
            sendTrackingData("Form Submission", { formData });
            event.target.submit();
        }
    });
  
    document.addEventListener("change", function (event) {
        if (event.target.tagName === "SELECT") {
            sendTrackingData("Dropdown Selection", { field: event.target.name, selectedValue: event.target.value });
        }
        if (event.target.type === "radio") {
            sendTrackingData("Radio Button Click", { field: event.target.name, selectedValue: event.target.value });
        }
        if (event.target.type === "checkbox") {
            sendTrackingData("Checkbox Click", { field: event.target.name, checked: event.target.checked });
        }
    });
  
    window.addEventListener("scroll", function () {
        const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        sendTrackingData("Scroll Tracking", { scrollPercentage: scrollPercentage.toFixed(2) + "%" });
    });
  
    window.addEventListener("beforeunload", function () {
        sendTrackingData("Session End", { sessionDuration: Math.floor((Date.now() - sessionStartTime) / 1000) + "s" });
    });
  
    window.addEventListener("load", function () {
        sendTrackingData("Page Load", { referrer: getReferrerSource() });
    });
  
  })();