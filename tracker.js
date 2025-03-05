(function () {
    const API_ENDPOINT = "https://012c-60-243-64-58.ngrok-free.app/webhook";
    let sessionStartTime = Date.now();
  
    // Function to Get or Generate User ID
    function getUserId() {
        return sessionStorage.getItem("username") || localStorage.getItem("username") || null;
    }

    function getUserEmail(retryCount = 0) {
        let email =
            sessionStorage.getItem("userEmail") || // Old key
            sessionStorage.getItem("username") || // New key
            localStorage.getItem("userEmail") ||
            localStorage.getItem("username");
    
        if (!email) {
            const emailElement = document.querySelector(".user-email"); // Adjust selector if needed
            if (emailElement) {
                email = emailElement.innerText.trim();
                sessionStorage.setItem("userEmail", email);
                localStorage.setItem("userEmail", email);
            }
        }
    
        if (!email && retryCount < 10) {
            console.warn(`No email found, retrying in ${retryCount + 1}s...`);
            setTimeout(() => getUserEmail(retryCount + 1), 1000);
        }
    
        return email || null;
    }
    

    function getUserRole() {
        return sessionStorage.getItem("userRole") || localStorage.getItem("userRole") || null;
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
     // Function to Set User Details on Login (Without User ID Initially)
     function trackLogin(email, role) {
        console.log("trackLogin called with:", email, role); // Debugging
    
        if (!email || !role) {
            console.error(" Login details missing:", { email, role });
            return;
        }
    
        sessionStorage.setItem("email", email);
        sessionStorage.setItem("userRole", role);
    
        localStorage.setItem("email", email);
        localStorage.setItem("userRole", role);
    
        console.log("✅ User logged in:", { email, role }); // Debugging
    
        sendTrackingData("User Login");
    }
    
    // Function to Update User ID When Available (On Profile Page)
    function updateUserId(username) {
        if (!username) return;

        sessionStorage.setItem("username", username);
        localStorage.setItem("username", username);

        console.log("User ID updated:", username);
    }

    // Function to Track Logout
    function trackLogout() {
        sendTrackingData("User Logout");

        sessionStorage.clear();
        localStorage.clear();

        console.log("User logged out");
    }
    //page load
    function trackPageLoad(attempt = 0) {
        const email = getUserEmail();
        
        if (!email) {
            if (attempt < 5) {
                console.warn(`No email found, retrying in ${attempt + 1}s...`);
                setTimeout(() => trackPageLoad(attempt + 1), 1000);
            } else {
                console.error("Email not found after multiple attempts, skipping tracking.");
            }
            return;
        }
    
        sendTrackingData("Page Load");
    }
    
   

  
    // Send Tracking Data
    function sendTrackingData(eventType, extraData = {}) {
        const username = getUserId();
        const email = getUserEmail();
        const role = getUserRole();
        if (!email) {
            console.warn("No email found, skipping tracking:", eventType);
            return; // Skip tracking if email is not available
        }
        // const userAgent = navigator.userAgent;
        const platform = `${navigator.platform} - ${navigator.appVersion}`;
        const pageURL = window.location.href;
        const timestamp = new Date().toISOString();
  
        const trackingData = {
            username,
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
            body: JSON.stringify(trackingData)
        })
            .then((response) => response.json())
          .then(user => {
            if (user.email && user.role) {
                trackLogin(user.email, user.role);
            } else {
                console.error(" No email/role found in user data:", user);
            }
        })
            .catch((error) => console.error(" API Error:", error));
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
  
    // window.addEventListener("load", function () {
    //     setTimeout(() => {
    //         if (!getUserEmail()) {
    //             console.warn("No email found, retrying in 1s...");
    //             return;
    //         }
    //         sendTrackingData("Page Load");
    //     }, 1000); 
    //     sendTrackingData("Page Load", { referrer: getReferrerSource() });
    // });
     // Run on page load
     window.addEventListener("load", function () {
        trackPageLoad();
    });
    

     // Expose Login, Logout, and User ID Update Functions
     window.trackLogin = trackLogin;
     window.trackLogout = trackLogout;
     window.updateUserId = updateUserId;
  
  })();