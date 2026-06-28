/* ==========================================================================
   INTERACTIVE PORTFOLIO LOGIC
   Samarth Boraganve - Portfolio Card
   ========================================================================= */

document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const projectCountEl = document.getElementById("project-count");
    const leetcodeCountEl = document.getElementById("leetcode-count");
    const certsStatBox = document.getElementById("certs-stat-box");
    const contactBtn = document.getElementById("contact-btn");
    
    const certsModal = document.getElementById("certs-modal");
    const certsClose = document.getElementById("certs-modal-close");
    
    const contactModal = document.getElementById("contact-modal");
    const contactClose = document.getElementById("contact-modal-close");
    const copyPhoneBtn = document.getElementById("copy-phone-btn");

    // Dynamic Data Fallbacks
    const FALLBACK_PROJECTS = 14;
    const FALLBACK_LEETCODE = 125; // Default solved problem count
    const PHONE_NUMBER = "9980834800";

    // ── 1. Value Counter Animation Utility ──
    function animateCount(element, targetValue, duration = 1500) {
        if (!element) return;
        
        let startValue = 0;
        let startTimestamp = null;
        
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            
            // Easing function (easeOutQuad)
            const easeProgress = progress * (2 - progress);
            const currentValue = Math.floor(easeProgress * targetValue);
            
            element.textContent = currentValue;
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                element.textContent = targetValue;
            }
        };
        
        window.requestAnimationFrame(step);
    }

    // ── 2. GitHub API Integration ──
    async function fetchGitHubStats() {
        try {
            const response = await fetch("https://api.github.com/users/samarthboraganve");
            if (!response.ok) throw new Error("GitHub user not found");
            const data = await response.json();
            
            const repoCount = data.public_repos || FALLBACK_PROJECTS;
            animateCount(projectCountEl, repoCount, 1200);
            
            // Optionally, we can also load the avatar URL from GitHub if the local photo isn't available
            // but since the user provided their custom photo, we prefer 'profile.jpg'.
        } catch (error) {
            console.warn("GitHub API error, using fallback count:", error);
            animateCount(projectCountEl, FALLBACK_PROJECTS, 1000);
        }
    }

    // ── 3. LeetCode Stats Integration ──
    async function fetchLeetCodeStats() {
        // Try multiple public LeetCode API endpoints
        const endpoints = [
            "https://leetcode-api-faisalshohag.vercel.app/samarthboraganve",
            "https://alfa-leetcode-api.onrender.com/samarthboraganve/solved"
        ];

        let solvedCount = null;

        for (const url of endpoints) {
            try {
                const response = await fetch(url);
                if (!response.ok) continue;
                const data = await response.json();
                
                // Parse totalSolved depending on the API schema
                if (data.totalSolved !== undefined) {
                    solvedCount = data.totalSolved;
                } else if (data.solvedProblem !== undefined) {
                    solvedCount = data.solvedProblem;
                } else if (data.matchedUser && data.matchedUser.submitStats && data.matchedUser.submitStats.acSubmissionNum) {
                    // GraphQL-like schema structures
                    const solvedObj = data.matchedUser.submitStats.acSubmissionNum.find(x => x.difficulty === "All");
                    if (solvedObj) solvedCount = solvedObj.count;
                }
                
                if (solvedCount !== null && solvedCount > 0) {
                    break; // Successfully got count
                }
            } catch (err) {
                console.warn(`Error fetching LeetCode from ${url}:`, err);
            }
        }

        if (solvedCount !== null && solvedCount > 0) {
            animateCount(leetcodeCountEl, solvedCount, 1500);
        } else {
            console.warn("Could not fetch LeetCode solved count, using baseline fallback.");
            animateCount(leetcodeCountEl, FALLBACK_LEETCODE, 1200);
        }
    }

    // Initialize API calls
    fetchGitHubStats();
    fetchLeetCodeStats();

    // ── 4. Modal Overlays Handlers ──
    
    // Open Modal function
    function openModal(modal) {
        modal.classList.add("active");
        document.body.style.overflow = "hidden"; // Prevent background scroll
    }

    // Close Modal function
    function closeModal(modal) {
        modal.classList.remove("active");
        document.body.style.overflow = ""; // Restore scroll
    }

    // Event Listeners for Certificates
    certsStatBox.addEventListener("click", () => openModal(certsModal));
    certsClose.addEventListener("click", () => closeModal(certsModal));
    certsModal.addEventListener("click", (e) => {
        if (e.target === certsModal) closeModal(certsModal);
    });

    // Event Listeners for Contact
    contactBtn.addEventListener("click", () => openModal(contactModal));
    contactClose.addEventListener("click", () => closeModal(contactModal));
    contactModal.addEventListener("click", (e) => {
        if (e.target === contactModal) closeModal(contactModal);
    });

    // Copy Phone Number to Clipboard
    copyPhoneBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(PHONE_NUMBER).then(() => {
            const originalContent = copyPhoneBtn.innerHTML;
            copyPhoneBtn.innerHTML = `<i class="fa-solid fa-check"></i> <span>Copied!</span>`;
            copyPhoneBtn.style.background = "rgba(74, 222, 128, 0.2)";
            copyPhoneBtn.style.borderColor = "rgba(74, 222, 128, 0.4)";
            
            setTimeout(() => {
                copyPhoneBtn.innerHTML = originalContent;
                copyPhoneBtn.style.background = "";
                copyPhoneBtn.style.borderColor = "";
            }, 2000);
        }).catch(err => {
            console.error("Failed to copy phone number:", err);
            alert(`Phone Number: ${PHONE_NUMBER}`);
        });
    });

    // Press Escape to close active modal
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeModal(certsModal);
            closeModal(contactModal);
        }
    });
});
