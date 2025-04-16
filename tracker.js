(function () {
  const API_ENDPOINT = "https://your-api-endpoint.com/webhook"; // Replace with your actual endpoint
  let sessionStartTime = Date.now();

  // === Utility Functions ===
  function getUserId() {
    let uid = localStorage.getItem("userId");
    if (!uid) {
      uid = "SW-" + Math.floor(100 + Math.random() * 900);
      localStorage.setItem("userId", uid);
    }
    return uid;
  }

  function getUserEmail() {
    return localStorage.getItem("userEmail") || "guest@example.com";
  }

  function getUserRole() {
    return localStorage.getItem("userRole") || "Guest";
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
      ...extraData,
    };

    fetch(API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(trackingData),
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

  // === TRACKING EVENTS ===

  // Page View
  window.addEventListener("load", () => sendTrackingData("page_view"));

  // Exit Page
  window.addEventListener("beforeunload", () => {
    sendTrackingData("exit_page", {
      sessionDuration: Math.floor((Date.now() - sessionStartTime) / 1000) + "s",
    });
  });

  // Scroll Depth
  window.addEventListener("scroll", () => {
    const scrollDepth = Math.round(
      (window.scrollY /
        (document.documentElement.scrollHeight - window.innerHeight)) *
        100
    );
    if (scrollDepth > 0) {
      sendTrackingData("scroll", { scroll_depth: `${scrollDepth}%` });
    }
  });

  // Mouse Movement
  document.addEventListener("mousemove", (e) => {
    sendTrackingData("mouse_move", { x: e.clientX, y: e.clientY });
  });

  // Hover Tracking
  document.addEventListener("mouseover", (e) => {
    if (e.target.closest("button, a, img, .card")) {
      sendTrackingData("hover", {
        tag: e.target.tagName,
        text: e.target.innerText || "",
        class: e.target.className,
      });
    }
  });

  // Input
  document.addEventListener("input", (e) => {
    if (e.target.tagName === "INPUT") {
      sendTrackingData("input_typing", {
        name: e.target.name,
        value: e.target.value,
      });
    }
  });

  // Search
  document.addEventListener("input", (e) => {
    if (e.target.type === "search") {
      sendTrackingData("search", { query: e.target.value });
    }
  });

  // Copy & Paste
  document.addEventListener("copy", () => sendTrackingData("copy"));
  document.addEventListener("paste", () => sendTrackingData("paste"));

  // Form Error (basic validation example)
  document.addEventListener("submit", (e) => {
    const form = e.target;
    const inputs = form.querySelectorAll("input[required]");
    let hasError = false;
    inputs.forEach((input) => {
      if (!input.value) {
        hasError = true;
        sendTrackingData("form_error", {
          field: input.name,
          reason: "Required field missing",
        });
      }
    });
  });

  // Tab Visibility
  document.addEventListener("visibilitychange", () => {
    sendTrackingData("tab_visibility", {
      visibilityState: document.visibilityState,
    });
  });

  // Video Interaction
  document.querySelectorAll("video").forEach((video) => {
    video.addEventListener("play", () => sendTrackingData("video_play"));
    video.addEventListener("pause", () => sendTrackingData("video_pause"));
    video.addEventListener("ended", () => sendTrackingData("video_ended"));
  });

  // Network Info
  if (navigator.connection) {
    const { downlink, effectiveType, rtt } = navigator.connection;
    sendTrackingData("connection_info", { downlink, effectiveType, rtt });
  }

  // Battery Info
  if (navigator.getBattery) {
    navigator.getBattery().then((battery) => {
      sendTrackingData("battery_status", {
        level: battery.level * 100 + "%",
        charging: battery.charging,
      });
    });
  }

  // Global JS Error
  window.addEventListener("error", (e) => {
    sendTrackingData("js_error", {
      message: e.message,
      source: e.filename,
      lineno: e.lineno,
      colno: e.colno,
    });
  });

  // Custom Payment Tracking (Optional for reuse)
  window.trackPaymentEvent = function ({
    userId,
    cardType,
    amount,
    ip,
    location,
    deviceId,
  }) {
    sendTrackingData("payment_attempt", {
      user_id: userId,
      card_type: cardType,
      amount,
      ip_address: ip,
      location,
      device_id: deviceId,
      timestamp: new Date().toISOString(),
    });
  };
})();
