(function () {
    const API_ENDPOINT = "https://aeef-60-243-64-58.ngrok-free.app/webhook";
    let sessionStartTime = Date.now();

      // Extract User Details from the Page
      function getUserDetailsFromPage() {
        setTimeout(() => {
            let emailElements = document.querySelectorAll(".email");
            let roleElement = document.querySelector(".con_foo_title");
    
            let role = roleElement ? roleElement.innerText.trim() : null;
            let email = null;
    
            emailElements.forEach(el => {
                if (el.innerText.includes("@") && !email) {
                    email = el.innerText.trim(); // Pick first valid email
                }
            });
    
            console.log("✅ Extracted Role:", role);
            console.log("✅ Extracted Email:", email);
    
            if (email && role) {
                localStorage.setItem("userEmail", email);
                localStorage.setItem("userRole", role);
                console.log("✅ Stored Email:", localStorage.getItem("userEmail"));
                console.log("✅ Stored Role:", localStorage.getItem("userRole"));
            } else {
                console.warn("❌ User details not found!");
            }
        }, 3000);
    }
    
    
    
    
    // Ensure function runs after the page is fully loaded
    window.addEventListener("load", getUserDetailsFromPage);
    
  
    // Function to Get or Generate User ID
    function getUserId() {
        return localStorage.getItem("userId") || "123";
    }
    
    function getUserEmail() {
        return localStorage.getItem("userEmail") || "random@example.com";
    }
    
  
  function getUserRole() {
      return localStorage.getItem("userRole") || "guest"; 
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
        const userId = localStorage.getItem("userId") || "SW-110";
        const email = localStorage.getItem("userEmail");
        const role = localStorage.getItem("userRole"); 
        const platform = `${navigator.platform} - ${navigator.appVersion}`;
        const pageURL = window.location.href;
        const timestamp = new Date().toISOString();

        email = email && email !== "null" ? email : "unknown@example.com";
        role = role && role !== "null" ? role : "guest";
  
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
        console.log("📤 Sending Tracking Data:", trackingData);
        // Store in LocalStorage
        localStorage.setItem("userTrackingData", JSON.stringify(trackingData));
  
        // Send to API
        fetch(API_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(trackingData),
             mode: "cors"
        })
        .then(response => response.json())
        .then(user => {
            console.log("✅ Response from API:", user);
        })
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
  
    window.addEventListener("load", async () => {
        getUserDetailsFromPage();
    
        // Wait until localStorage has valid user details
        setTimeout(() => {
            let email = localStorage.getItem("userEmail");
            let role = localStorage.getItem("userRole");
    
            console.log("🚀 Fetching User Details Before Sending Data");
            console.log("📌 LocalStorage Debugging:", { userEmail: email, userRole: role });
    
            // Only send tracking data if user details exist
            if (email && role && email !== "null" && role !== "null") {
                sendTrackingData("Page Load");
            } else {
                console.warn("⏳ Waiting for user details...");
                setTimeout(() => sendTrackingData("Page Load"), 2000);
            }
        }, 4000); // Increase delay to ensure details are stored
    });
    
    
    
    
  
  })();  