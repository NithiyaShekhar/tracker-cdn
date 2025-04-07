(function () {
    const API_ENDPOINT = "https://1582-27-4-42-141.ngrok-free.app/webhook";
    let sessionStartTime = Date.now();
  
    function getUserId() {
      return localStorage.getItem("userId") || "SW-" + Math.floor(100 + Math.random() * 900);
    }
  
    function getUserEmail() {
      return localStorage.getItem("userEmail") || "guest@example.com";
    }
  
    function getUserRole() {
      return localStorage.getItem("userRole") || "Guest";
    }
  
    function getUserDetailsFromPage(callback) {
      function extractDetails() {
        let emailElements = document.querySelectorAll(".email");
        let roleElement = document.querySelector(".con_foo_title");
  
        let email = null;
        emailElements.forEach(el => {
          if (el.innerText.includes("@") && !email) {
            email = el.innerText.trim();
          }
        });
  
        let role = roleElement ? roleElement.innerText.trim() : null;
  
        if (email && role) {
          localStorage.setItem("userEmail", email);
          localStorage.setItem("userRole", role);
          callback(email, role);
        } else {
          setTimeout(extractDetails, 1000);
        }
      }
  
      extractDetails();
    }
  
    function getUTM(param) {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(param) || null;
    }
  
    function sendTrackingData(eventType, extraData = {}) {
      const trackingData = {
        event_id: crypto.randomUUID(),
        event_type: eventType,
        event_timestamp: new Date().toISOString(),
        session_id: localStorage.getItem("sessionId") || crypto.randomUUID(),
        user_id: getUserId(),
        email: getUserEmail(),
        role: getUserRole(),
        platform: navigator.platform,
        userAgent: navigator.userAgent,
        browser: getBrowserInfo(),
        os: getOSInfo(),
        deviceType: getDeviceType(),
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        viewportSize: `${window.innerWidth}x${window.innerHeight}`,
        pageURL: window.location.href,
        pageTitle: document.title,
        referrer: document.referrer || "Direct",
        language: navigator.language,
        sessionDuration: Math.floor((Date.now() - sessionStartTime) / 1000) + "s",
        utm_source: getUTM("utm_source"),
        utm_medium: getUTM("utm_medium"),
        utm_campaign: getUTM("utm_campaign"),
        utm_term: getUTM("utm_term"),
        utm_content: getUTM("utm_content"),
        ...extraData
      };
  
      fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trackingData),
        mode: "cors"
      }).catch((err) => console.error("Tracking error", err));
    }
  
    function getBrowserInfo() {
      const ua = navigator.userAgent;
      if (ua.includes("Chrome")) return "Chrome";
      if (ua.includes("Firefox")) return "Firefox";
      if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
      if (ua.includes("Edge")) return "Edge";
      return "Unknown";
    }
  
    function getOSInfo() {
      const ua = navigator.userAgent;
      if (ua.includes("Windows")) return "Windows";
      if (ua.includes("Mac OS")) return "Mac OS";
      if (ua.includes("Linux")) return "Linux";
      if (ua.includes("Android")) return "Android";
      if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
      return "Unknown";
    }
  
    function getDeviceType() {
      const width = window.innerWidth;
      if (width <= 768) return "Mobile";
      if (width <= 1024) return "Tablet";
      return "Desktop";
    }
  
    // ✅ Page View
    window.addEventListener("load", () => {
      getUserDetailsFromPage(() => sendTrackingData("page_view"));
    });
  
    // ✅ Exit Page
    window.addEventListener("beforeunload", () => {
      sendTrackingData("exit_page", {
        sessionDuration: Math.floor((Date.now() - sessionStartTime) / 1000) + "s"
      });
    });
  
    // ✅ Scroll Depth
    window.addEventListener("scroll", () => {
      const scrollDepth = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      if (scrollDepth > 0) {
        sendTrackingData("scroll", { scroll_depth: `${scrollDepth}%` });
      }
    });
  
    // ✅ Mouse Movement
    document.addEventListener("mousemove", (e) => {
      sendTrackingData("mouse_move", { x: e.clientX, y: e.clientY });
    });
  
    // ✅ Hover Tracking
    document.addEventListener("mouseover", (e) => {
      if (e.target.closest("button, a, img, .card")) {
        sendTrackingData("hover", {
          tag: e.target.tagName,
          text: e.target.innerText || "",
          class: e.target.className
        });
      }
    });
  
    // ✅ Clicks
    document.addEventListener("click", (e) => {
      const target = e.target;
      if (target.matches("button, a, img")) {
        sendTrackingData("click", {
          tag: target.tagName,
          content: target.innerText || target.src || "no-text"
        });
      }
  
      const card = target.closest(".card, .card-body");
      if (card) {
        sendTrackingData("card_click", {
          cardTitle: card.querySelector(".card-title")?.innerText || "Unknown",
          cardID: card.dataset.id || "no-id"
        });
      }
    });
  
    // ✅ Input/Select Events
    document.addEventListener("change", (e) => {
      const target = e.target;
      if (target.tagName === "SELECT") {
        sendTrackingData("dropdown_change", {
          name: target.name,
          value: target.value
        });
      }
  
      if (target.tagName === "INPUT" && target.type !== "checkbox") {
        sendTrackingData("input_change", {
          name: target.name,
          value: target.value
        });
      }
    });
  
    // ✅ Focus/Blur
    document.addEventListener("focus", (e) => {
      if (e.target.matches("input, textarea")) {
        sendTrackingData("focus", { name: e.target.name });
      }
    }, true);
  
    document.addEventListener("blur", (e) => {
      if (e.target.matches("input, textarea")) {
        sendTrackingData("blur", { name: e.target.name });
      }
    }, true);
  
    // ✅ Form Submissions
    document.addEventListener("submit", (e) => {
      const form = e.target;
      const formData = {};
      new FormData(form).forEach((value, key) => formData[key] = value);
      sendTrackingData("form_submit", { formData });
    });
  })();
  