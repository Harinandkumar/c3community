// API Configuration
const API_BASE_URL = 'https://backend-glo6.onrender.com';

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    initMobileNav();
    initAuthModal();
    initChatbot();
    initUploadButton();
    initSmoothScroll();
    fetchEvents();
    fetchNotices();
    loadDynamicNavItems();  // ✅ NEW: Load dynamic nav items
    initLoadingScreen();
    initMatrixBackground();
    initCodeBackground();
});

// Loading Screen
function initLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        setTimeout(() => {
            loadingScreen.classList.add('fade-out');
            setTimeout(() => { loadingScreen.style.display = 'none'; }, 500);
        }, 1000);
    }
}

// Theme Switcher
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        icon.className = savedTheme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
        themeToggle.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            const newTheme = current === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            icon.className = newTheme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
        });
    }
}

// Mobile Navigation - Fixed
// Mobile Navigation - Hamburger with scrollable menu
function initMobileNav() {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            navLinks.classList.toggle('active');
            const icon = hamburger.querySelector('i');
            if (icon) {
                icon.className = navLinks.classList.contains('active') ? 'fas fa-times' : 'fas fa-bars';
            }
            if (navLinks.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = 'auto';
            }
        });
        
        // Close menu when clicking on a link
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                const icon = hamburger.querySelector('i');
                if (icon) icon.className = 'fas fa-bars';
                document.body.style.overflow = 'auto';
            });
        });
        
        // Close menu when clicking outside (optional)
        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('active') && 
                !navLinks.contains(e.target) && 
                !hamburger.contains(e.target)) {
                navLinks.classList.remove('active');
                const icon = hamburger.querySelector('i');
                if (icon) icon.className = 'fas fa-bars';
                document.body.style.overflow = 'auto';
            }
        });
    }
}

// ========== DYNAMIC NAV ITEMS (NEW FEATURE) ==========
async function loadDynamicNavItems() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/public/nav-items`);
        if (!response.ok) throw new Error('Failed to fetch nav items');
        const items = await response.json();
        displayDynamicNavItems(items);
    } catch (error) {
        console.error('Error loading nav items:', error);
    }
}

function displayDynamicNavItems(items) {
    const container = document.getElementById('dynamicNavItems');
    if (!container) return;
    
    if (!items || items.length === 0) {
        container.innerHTML = '';
        return;
    }
    
    container.innerHTML = items.map(item => {
        let badgeHtml = '';
        if (item.badge === 'live') badgeHtml = '<span class="badge-live">🔴 LIVE</span>';
        else if (item.badge === 'new') badgeHtml = '<span class="badge-new">🟢 NEW</span>';
        else if (item.badge === 'upcoming') badgeHtml = '<span class="badge-upcoming">🟡 UPCOMING</span>';
        
        const target = item.target === '_blank' ? 'target="_blank" rel="noopener noreferrer"' : '';
        
        return `
            <li>
                <a href="${escapeHtml(item.link)}" ${target} class="nav-link">
                    <i class="fas ${item.icon}"></i> ${escapeHtml(item.name)} ${badgeHtml}
                </a>
            </li>
        `;
    }).join('');
}

// Auth Modal with Scrollable Form
function initAuthModal() {
    const authBtn = document.getElementById('authBtn');
    const authModal = document.getElementById('authModal');
    const closeAuthModal = document.getElementById('closeAuthModal');
    const authTabs = document.querySelectorAll('.auth-tab');
    const authPanels = document.querySelectorAll('.auth-panel');
    
    const token = localStorage.getItem('jwtToken');
    if (token && authBtn) {
        authBtn.innerHTML = '<i class="fas fa-tachometer-alt"></i> Dashboard';
        authBtn.onclick = (e) => {
            e.preventDefault();
            window.location.href = './user-dashboard.html';
        };
    } else if (authBtn) {
        authBtn.onclick = (e) => {
            e.preventDefault();
            authModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        };
    }
    
    if (closeAuthModal) {
        closeAuthModal.addEventListener('click', () => {
            authModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    }
    authModal?.addEventListener('click', (e) => {
        if (e.target === authModal) {
            authModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
    
    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.dataset.tab;
            authTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            authPanels.forEach(panel => panel.classList.remove('active'));
            document.getElementById(`${tabId}Panel`).classList.add('active');
        });
    });
    
    // Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            if (!email || !password) { alert('Please fill all fields'); return; }
            try {
                const response = await fetch(`${API_BASE_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || 'Login failed');
                localStorage.setItem('jwtToken', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                alert('Login successful!');
                authModal.classList.remove('active');
                document.body.style.overflow = 'auto';
                window.location.reload();
            } catch (error) { alert(error.message); }
        });
    }
    
    // Register Form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const password = document.getElementById('regPassword').value;
            const confirmPassword = document.getElementById('regConfirmPassword').value;
            if (password !== confirmPassword) { alert('Passwords do not match!'); return; }
            const formData = {
                name: document.getElementById('regName').value,
                email: document.getElementById('regEmail').value,
                password: password,
                branch: document.getElementById('regBranch').value,
                batch: document.getElementById('regBatch').value,
                regno: document.getElementById('regRegno').value,
                mobileno: document.getElementById('regMobileno').value
            };
            for (let key in formData) { if (!formData[key]) { alert('Please fill all fields'); return; } }
            try {
                const response = await fetch(`${API_BASE_URL}/signup`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || 'Registration failed');
                document.getElementById('signupPopup').style.display = 'flex';
                document.querySelector('.auth-tab[data-tab="login"]').click();
                document.getElementById('loginEmail').value = formData.email;
                registerForm.reset();
            } catch (error) { alert(error.message); }
        });
    }
}

// Close Signup Popup
window.closeSignupPopup = function() {
    document.getElementById('signupPopup').style.display = 'none';
};

// Fetch Events
async function fetchEvents() {
    const grid = document.getElementById('eventsGrid');
    if (!grid) return;
    grid.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading events...</div>';
    try {
        const response = await fetch(`${API_BASE_URL}/allevents`);
        if (!response.ok) throw new Error('Failed to fetch');
        const events = await response.json();
        displayEvents(events);
    } catch (error) {
        grid.innerHTML = '<div class="error-message" style="text-align:center;padding:40px;">Failed to load events. <button onclick="fetchEvents()" style="margin-top:10px;padding:8px 20px;background:var(--primary);border:none;border-radius:8px;color:white;cursor:pointer;">Retry</button></div>';
    }
}

function displayEvents(events) {
    const grid = document.getElementById('eventsGrid');
    if (!events || events.length === 0) { grid.innerHTML = '<div style="text-align:center;padding:40px;">No events available.</div>'; return; }
    grid.innerHTML = events.map(event => `
        <div class="event-card">
            <div class="event-tag">${event.name.includes('TEAMUP') ? 'Team Event' : 'Event'}</div>
            <img src="${event.imagelink || 'assets/img/default-event.jpg'}" alt="${escapeHtml(event.name)}" onerror="this.src='assets/img/default-event.jpg'">
            <div class="event-content">
                <h3>${escapeHtml(event.name)}</h3>
                <p>${escapeHtml(event.description?.substring(0, 100) || 'No description')}${event.description?.length > 100 ? '...' : ''}</p>
                <div class="event-date"><i class="far fa-calendar-alt"></i> ${new Date(event.date).toLocaleDateString()}</div>
                <div class="event-location"><i class="fas fa-map-marker-alt"></i> ${escapeHtml(event.location || 'TBA')}</div>
                <div class="event-prize"><i class="fas fa-trophy"></i> Prize: ${escapeHtml(event.prize || 'TBA')}</div>
            </div>
        </div>
    `).join('');
}

// Fetch Notices with Read More
async function fetchNotices() {
    const container = document.getElementById('noticesContainer');
    if (!container) return;
    container.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading notices...</div>';
    try {
        const response = await fetch(`${API_BASE_URL}/api/notifications`);
        if (!response.ok) throw new Error('Failed to fetch');
        const notices = await response.json();
        displayNotices(notices);
    } catch (error) {
        container.innerHTML = '<div class="error-message" style="text-align:center;padding:40px;">Failed to load notices. <button onclick="fetchNotices()" style="margin-top:10px;padding:8px 20px;background:var(--primary);border:none;border-radius:8px;color:white;cursor:pointer;">Retry</button></div>';
    }
}

function displayNotices(notices) {
    const container = document.getElementById('noticesContainer');
    if (!container) return;
    
    if (!notices || notices.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:40px;">No notices available.</div>';
        return;
    }
    
    // Separate priority notices from normal notices
    const priorityNotices = notices.filter(n => n.isPriority === true);
    const normalNotices = notices.filter(n => n.isPriority !== true);
    
    let allNoticesHTML = '';
    
    // Display priority notices first (with special styling)
    if (priorityNotices.length > 0) {
        allNoticesHTML += priorityNotices.map(notice => {
            let badgeHtml = '';
            if (notice.badge === 'live') badgeHtml = '<span class="recruitment-badge">🔴 LIVE</span>';
            else if (notice.badge === 'new') badgeHtml = '<span class="badge-new">🟢 NEW</span>';
            else if (notice.badge === 'upcoming') badgeHtml = '<span class="badge-upcoming">🟡 UPCOMING</span>';
            else badgeHtml = '<span class="recruitment-badge">⭐ PRIORITY</span>';
            
            return `
                <div class="recruitment-notice">
                    <div class="recruitment-notice-header">
                        ${badgeHtml}
                        <span class="recruitment-date">📅 ${new Date(notice.date).toLocaleDateString()}</span>
                    </div>
                    <h3 class="recruitment-title">${escapeHtml(notice.title)}</h3>
                    <p class="recruitment-desc">${escapeHtml(notice.message)}</p>
                </div>
            `;
        }).join('');
    }
    
    // Display normal notices
    if (normalNotices.length > 0) {
        allNoticesHTML += normalNotices.map((notice, index) => {
            const noticeDate = new Date(notice.date).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
            });
            const shortMessage = notice.message.length > 120 ? notice.message.substring(0, 120) + '...' : notice.message;
            const needReadMore = notice.message.length > 120;
            
            return `
                <div class="notice-item" data-idx="${index}">
                    <div class="notice-date"><i class="far fa-calendar-alt"></i> ${noticeDate}</div>
                    <div class="notice-title">${escapeHtml(notice.title)}</div>
                    <div class="notice-excerpt">${escapeHtml(shortMessage)}</div>
                    ${needReadMore ? `<button class="read-more-btn" data-title="${escapeHtml(notice.title)}" data-date="${noticeDate}" data-message="${escapeHtml(notice.message)}">Read More</button>` : ''}
                </div>
            `;
        }).join('');
    }
    
    container.innerHTML = allNoticesHTML;
    
    // Re-attach read more event listeners
    document.querySelectorAll('.read-more-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const title = btn.dataset.title;
            const date = btn.dataset.date;
            const message = btn.dataset.message;
            showNoticeModal(title, date, message);
        });
    });
}

// Show Notice Modal with full content
function showNoticeModal(title, date, message) {
    const modal = document.getElementById('noticeModal');
    const modalTitle = document.getElementById('noticeModalTitle');
    const modalDate = document.getElementById('noticeModalDate');
    const modalMessage = document.getElementById('noticeModalMessage');
    
    modalTitle.innerHTML = title;
    modalDate.innerHTML = `<i class="far fa-calendar-alt"></i> ${date}`;
    modalMessage.innerHTML = message.replace(/\n/g, '<br>');
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close Notice Modal
const noticeModal = document.getElementById('noticeModal');
const noticeModalClose = document.getElementById('noticeModalClose');
if (noticeModalClose) {
    noticeModalClose.addEventListener('click', () => {
        noticeModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    });
}
if (noticeModal) {
    noticeModal.addEventListener('click', (e) => {
        if (e.target === noticeModal) {
            noticeModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
}

// Helper Functions
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Chatbot
function initChatbot() {
    const chatbotToggle = document.getElementById('chatbotToggle');
    const chatbotWindow = document.getElementById('chatbotWindow');
    const chatbotMinimize = document.getElementById('chatbotMinimize');
    const chatbotSend = document.getElementById('chatbotSend');
    const chatbotInput = document.getElementById('chatbotInput');
    const chatbotMessages = document.getElementById('chatbotMessages');
    
    if (chatbotToggle && chatbotWindow) {
        chatbotToggle.addEventListener('click', () => { chatbotWindow.classList.toggle('active'); });
        if (chatbotMinimize) chatbotMinimize.addEventListener('click', () => { chatbotWindow.classList.remove('active'); });
    }
    
    function sendMessage() {
        if (!chatbotInput || !chatbotMessages) return;
        const message = chatbotInput.value.trim();
        if (!message) return;
        addMessage(message, 'user');
        chatbotInput.value = '';
        setTimeout(() => {
            const reply = getBotReply(message);
            addMessage(reply, 'bot');
        }, 500);
    }
    
    function addMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}`;
        msgDiv.innerHTML = `<div class="message-avatar">${sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>'}</div><div class="message-bubble">${escapeHtml(text)}</div>`;
        chatbotMessages.appendChild(msgDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }
    
    function getBotReply(message) {
        const msg = message.toLowerCase();
        if (msg.includes('c3') || msg.includes('what is')) return 'C3 is a student-led coding club at GEC Samastipur focused on building and learning together! 🚀';
        if (msg.includes('join') || msg.includes('register')) return 'To join C3, click the Login button and create an account!';
        if (msg.includes('event')) return 'Check our Events section for hackathons, workshops, and competitions!';
        if (msg.includes('contact')) return 'Email: creativecodingcodingcommunity@gmail.com | Instagram: @creativecoding_community';
        return 'Hello! I\'m the C3 assistant. Ask me about events, joining, or contact info! 😊';
    }
    
    if (chatbotSend) chatbotSend.addEventListener('click', sendMessage);
    if (chatbotInput) chatbotInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });
}

// Upload Button
function initUploadButton() {
    const uploadBtn = document.getElementById('uploadBtn');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', () => {
            window.open('https://fileupload-1r1c.onrender.com/', '_blank');
        });
    }
}

// Smooth Scroll
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target && !this.classList.contains('external-link')) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// Active Nav Link on Scroll
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('.section');
    const scrollPos = window.scrollY + 100;
    sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute('id');
        if (scrollPos >= top && scrollPos < top + height) {
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${id}`) link.classList.add('active');
            });
        }
    });
});

// Matrix Background
function initMatrixBackground() {
    const canvas = document.getElementById('matrixCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    const fontSize = 14;
    let columns = Math.floor(width / fontSize);
    let drops = new Array(columns).fill(1);
    
    function draw() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#00f0ff';
        ctx.font = `${fontSize}px monospace`;
        for (let i = 0; i < drops.length; i++) {
            const text = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            if (drops[i] * fontSize > height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        }
        requestAnimationFrame(draw);
    }
    draw();
    window.addEventListener('resize', () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        columns = Math.floor(width / fontSize);
        drops = new Array(columns).fill(1);
    });
}

// Code Background Animation
function initCodeBackground() {
    const codeElement = document.getElementById('codeAnimation');
    if (!codeElement) return;
    const codeLines = [
        "function createMagic() {",
        "  const creativity = new Inspiration();",
        "  const code = new Innovation();",
        "  while (!success) { try {",
        "    const result = creativity.meets(code);",
        "    if (result) return 'Awesome!';",
        "  } catch(error) { debug(error); } }",
        "}",
        "const community = new CreativeCoding();",
        "community.start();"
    ];
    let line = 0;
    function typeCode() {
        if (line < codeLines.length) {
            codeElement.innerHTML += codeLines[line] + "<br>";
            line++;
            setTimeout(typeCode, Math.random() * 300 + 100);
        } else { line = 0; codeElement.innerHTML = ""; setTimeout(typeCode, 2000); }
    }
    typeCode();
}

// Make functions global for retry buttons
window.fetchEvents = fetchEvents;
window.fetchNotices = fetchNotices;
window.loadDynamicNavItems = loadDynamicNavItems;