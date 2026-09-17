// API Configuration
// const API_BASE_URL = 'https://backend-glo6.onrender.com';
const API_BASE_URL = 'https://backend-glo6.onrender.com';


// https://backend-glo6.onrender.com

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
    loadDynamicNavItems();
    initLoadingScreen();
    initMatrixBackground();
    initCodeBackground();
    initGalleryCarousel();  // ✅ Gallery Carousel
    initCustomSections();   // ✅ Custom Sections from Admin Panel
    initLatestVideos();     // ✅ NEW: Latest Videos (Reels)
    
    // Read More button event listener for priority notices
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('read-more-notice-btn')) {
            const noticeId = e.target.dataset.id;
            const fullMessage = e.target.dataset.fullmsg;
            const descDiv = document.getElementById(`${noticeId}-desc`);
            
            if (!descDiv) return;
            
            const isExpanded = e.target.textContent.includes('Less');
            
            if (isExpanded) {
                const shortMessage = fullMessage.length > 220 ? fullMessage.substring(0, 220) + '...' : fullMessage;
                descDiv.innerHTML = shortMessage.replace(/\n/g, '<br>');
                e.target.innerHTML = 'Read More ↓';
            } else {
                descDiv.innerHTML = fullMessage.replace(/\n/g, '<br>');
                e.target.innerHTML = 'Read Less ↑';
            }
        }
    });
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

// Mobile Navigation
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
        
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                const icon = hamburger.querySelector('i');
                if (icon) icon.className = 'fas fa-bars';
                document.body.style.overflow = 'auto';
            });
        });
        
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

// Dynamic Nav Items
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

// Auth Modal
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

// Fetch Notices
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

// Display Notices with Read More for Priority Notices
function displayNotices(notices) {
    const container = document.getElementById('noticesContainer');
    if (!container) return;
    
    if (!notices || notices.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:40px;">No notices available.</div>';
        return;
    }
    
    const priorityNotices = notices.filter(n => n.isPriority === true);
    const normalNotices = notices.filter(n => n.isPriority !== true);
    
    let allNoticesHTML = '';
    
    // Priority notices
    if (priorityNotices.length > 0) {
        allNoticesHTML += priorityNotices.map((notice, idx) => {
            let badgeHtml = '';
            if (notice.badge === 'live') badgeHtml = '<span class="recruitment-badge">🔴 LIVE</span>';
            else if (notice.badge === 'new') badgeHtml = '<span class="badge-new">🟢 NEW</span>';
            else if (notice.badge === 'upcoming') badgeHtml = '<span class="badge-upcoming">🟡 UPCOMING</span>';
            
            const isLongMessage = notice.message.length > 220;
            const shortMessage = isLongMessage ? notice.message.substring(0, 220) + '...' : notice.message;
            const uniqueId = `notice-${Date.now()}-${idx}`;
            const fullMessageClean = notice.message.replace(/'/g, "\\'").replace(/"/g, '&quot;');
            
            let buttonsHtml = '';
            if (notice.button1Text && notice.button1Link) {
                buttonsHtml += `<a href="${notice.button1Link}" target="_blank" class="recruitment-btn primary" style="margin-right:10px;"><i class="fas fa-paper-plane"></i> ${escapeHtml(notice.button1Text)}</a>`;
            }
            if (notice.button2Text && notice.button2Link) {
                buttonsHtml += `<a href="${notice.button2Link}" target="_blank" class="recruitment-btn secondary">${escapeHtml(notice.button2Text)}</a>`;
            }
            
            return `
                <div class="recruitment-notice" id="${uniqueId}">
                    <div class="recruitment-notice-header">
                        ${badgeHtml}
                        <span class="recruitment-date">📅 ${new Date(notice.date).toLocaleDateString()}</span>
                    </div>
                    <h3 class="recruitment-title">${escapeHtml(notice.title)}</h3>
                    <div class="recruitment-desc" id="${uniqueId}-desc">
                        ${escapeHtml(shortMessage).replace(/\n/g, '<br>')}
                    </div>
                    ${isLongMessage ? `<button class="read-more-notice-btn" data-id="${uniqueId}" data-fullmsg="${escapeHtml(fullMessageClean)}">Read More ↓</button>` : ''}
                    ${buttonsHtml ? `<div class="recruitment-buttons" style="margin-top:15px;">${buttonsHtml}</div>` : ''}
                </div>
            `;
        }).join('');
    }
    
    // Normal notices
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
    
    // Normal notices read more
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

// Show Notice Modal
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

    // ✅ Generate/Load visitor ID
    let visitorId = localStorage.getItem('chatVisitorId');
    if (!visitorId) {
        visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('chatVisitorId', visitorId);
    }

    // ✅ User info
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const userName = userData.name || 'Guest';
    const userEmail = userData.email || '';
    const userId = userData.id || null;

    // ✅ Socket connection
    let socket = null;
    let isChatOpen = false;

    function connectSocket() {
        if (socket && socket.connected) return;
        
        socket = io(API_BASE_URL, {
            transports: ['websocket', 'polling']
        });

        socket.on('connect', () => {
            console.log('✅ Chat connected');
            socket.emit('join-chat', {
                visitorId,
                userName,
                userEmail,
                userId
            });
        });

        // ✅ Admin reply receive
        socket.on('admin-message', (data) => {
            addMessage(data.message, 'admin', data.senderName || 'Admin');
            // Play sound
            playNotificationSound();
        });

        // ✅ Bot reply
        socket.on('bot-message', (data) => {
            addMessage(data.message, 'bot', 'C3 Assistant');
        });

        socket.on('disconnect', () => {
            console.log('❌ Chat disconnected');
        });
    }

    if (chatbotToggle && chatbotWindow) {
        chatbotToggle.addEventListener('click', () => {
            isChatOpen = !isChatOpen;
            chatbotWindow.classList.toggle('active');
            if (isChatOpen) connectSocket();
        });
        
        if (chatbotMinimize) {
            chatbotMinimize.addEventListener('click', () => {
                chatbotWindow.classList.remove('active');
                isChatOpen = false;
            });
        }
    }

    function sendMessage() {
        if (!chatbotInput || !chatbotMessages) return;
        const message = chatbotInput.value.trim();
        if (!message) return;

        addMessage(message, 'user');
        chatbotInput.value = '';

        // ✅ Send to backend
        if (socket && socket.connected) {
            socket.emit('send-message', {
                visitorId,
                message,
                sender: 'user',
                userName,
                userEmail,
                userId
            });
        }

        // ✅ Bot reply (local)
        setTimeout(() => {
            const reply = getBotReply(message);
            if (reply) {
                addMessage(reply, 'bot', 'C3 Assistant');
                
                // Save bot message to backend
                if (socket && socket.connected) {
                    socket.emit('send-message', {
                        visitorId,
                        message: reply,
                        sender: 'bot',
                        userName: 'C3 Assistant'
                    });
                }
            }
        }, 500);
    }

    function addMessage(text, sender, senderName) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}`;
        
        let avatar = 'C3';
        if (sender === 'user') avatar = '<i class="fas fa-user"></i>';
        else if (sender === 'admin') avatar = '<i class="fas fa-headset"></i>';
        else if (sender === 'bot') avatar = '<i class="fas fa-robot"></i>';
        
        msgDiv.innerHTML = `
            <div class="message-avatar">${avatar}</div>
            <div class="message-bubble">${escapeHtml(text)}</div>
        `;
        chatbotMessages.appendChild(msgDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    function getBotReply(message) {
        const msg = message.toLowerCase();
        if (msg.includes('c3') || msg.includes('what is')) 
            return 'C3 is a student-led coding club at GEC Samastipur focused on building and learning together! 🚀';
        if (msg.includes('join') || msg.includes('register')) 
            return 'To join C3, click the Login button and create an account!';
        if (msg.includes('event')) 
            return 'Check our Events section for hackathons, workshops, and competitions!';
        if (msg.includes('contact')) 
            return 'Email: creativecodingcodingcommunity@gmail.com | Instagram: @creativecoding_community';
        if (msg.includes('hi') || msg.includes('hello')) 
            return 'Hello! 👋 How can I help you today?';
        if (msg.includes('thank')) 
            return 'You\'re welcome! 😊 Feel free to ask anything else.';
        
        return null; // Let admin handle
    }

    function playNotificationSound() {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
        audio.volume = 0.5;
        audio.play().catch(() => {});
    }

    if (chatbotSend) chatbotSend.addEventListener('click', sendMessage);
    if (chatbotInput) chatbotInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
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
// ========== ADVANCED SCROLL FADE-IN ==========
function initScrollReveal() {
    // Section titles — from bottom
    document.querySelectorAll('.section-title, .section-description').forEach(el => {
        el.classList.add('reveal', 'from-bottom');
    });

    // Event cards — staggered from bottom
    document.querySelectorAll('.event-card').forEach((el, i) => {
        el.classList.add('reveal', 'from-bottom');
        if (i < 6) el.classList.add(`delay-${(i % 3) + 1}`);
    });

    // Member & faculty cards — alternate left/right
    document.querySelectorAll('.member-card, .faculty-card').forEach((el, i) => {
        el.classList.add('reveal', i % 2 === 0 ? 'from-left' : 'from-right');
        if (i < 6) el.classList.add(`delay-${(i % 3) + 1}`);
    });

    // Recruit cards — scale in
    document.querySelectorAll('.recruit-card').forEach((el, i) => {
        el.classList.add('reveal', 'scale-in');
        if (i < 6) el.classList.add(`delay-${(i % 6) + 1}`);
    });

    // Winner cards — scale in
    document.querySelectorAll('.winner-card').forEach((el, i) => {
        el.classList.add('reveal', 'scale-in');
        if (i < 6) el.classList.add(`delay-${(i % 3) + 1}`);
    });

    // Notice items — from left
    document.querySelectorAll('.notice-item').forEach((el, i) => {
        el.classList.add('reveal', 'from-left');
        if (i < 6) el.classList.add(`delay-${(i % 3) + 1}`);
    });

    // Priority notices — from bottom
    document.querySelectorAll('.recruitment-notice').forEach((el, i) => {
        el.classList.add('reveal', 'from-bottom');
        el.classList.add(`delay-${i + 1}`);
    });

    // Reel items — scale in
    document.querySelectorAll('.reel-item').forEach((el, i) => {
        el.classList.add('reveal', 'scale-in');
        if (i < 6) el.classList.add(`delay-${(i % 3) + 1}`);
    });

    // Footer sections — from bottom
    document.querySelectorAll('.footer-about, .footer-links, .footer-contact').forEach((el, i) => {
        el.classList.add('reveal', 'from-bottom');
        el.classList.add(`delay-${i + 1}`);
    });

    // Intersection Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -60px 0px'
    });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// Re-run reveal on dynamic content load (events/notices loaded via API)
function reinitReveal() {
    document.querySelectorAll('.event-card:not(.reveal), .notice-item:not(.reveal), .recruitment-notice:not(.reveal)').forEach((el, i) => {
        el.classList.add('reveal', 'from-bottom');
        if (i < 6) el.classList.add(`delay-${(i % 3) + 1}`);
        observer.observe(el);
    });
}

initScrollReveal();
// ========== MOBILE BOTTOM NAV ACTIVE LINK ==========
function updateActiveBottomNav() {
    const sections = ['home', 'events', 'members', 'notices', 'contact'];
    const scrollPosition = window.scrollY + 150;

    for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
            const offsetTop = element.offsetTop;
            const offsetBottom = offsetTop + element.offsetHeight;
            
            if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
                // Remove active class from all bottom nav items
                document.querySelectorAll('.bottom-nav-item').forEach(item => {
                    item.classList.remove('active');
                });
                
                // Add active class to matching item
                const activeLink = document.querySelector(`.bottom-nav-item[href="#${section}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
                break;
            }
        }
    }
}

// For gallery page
if (window.location.pathname.includes('gallery.html')) {
    const galleryBtn = document.querySelector('.bottom-nav-item[href="gallery.html"]');
    if (galleryBtn) galleryBtn.classList.add('active');
}

// Smooth scroll for bottom nav items
document.querySelectorAll('.bottom-nav-item').forEach(item => {
    item.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        
        // Check if it's a section link (starts with #)
        if (href && href.startsWith('#')) {
            e.preventDefault();
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Update active state
                document.querySelectorAll('.bottom-nav-item').forEach(link => {
                    link.classList.remove('active');
                });
                this.classList.add('active');
            }
        }
    });
});

// Listen to scroll events
window.addEventListener('scroll', updateActiveBottomNav);
window.addEventListener('load', updateActiveBottomNav);
// Also re-run after dynamic content loads
const originalDisplayEvents = window.displayEvents;
window.addEventListener('load', () => {
    setTimeout(initScrollReveal, 1500);
});
window.loadDynamicNavItems = loadDynamicNavItems;

// ==========================================
// ========== GALLERY CAROUSEL ==========
// ==========================================

let carouselState = {
    slides: [],
    currentIndex: 0,
    autoplayInterval: null,
    progressInterval: null,
    progress: 0,
    autoplayDuration: 5000,
    isPaused: false,
    touchStartX: 0,
    touchEndX: 0,
    isInitialized: false
};

async function initGalleryCarousel() {
    const track = document.getElementById('carouselTrack');
    const container = document.getElementById('carouselContainer');
    
    if (!track || !container || carouselState.isInitialized) return;
    
    try {
        console.log('🖼️ Loading gallery carousel...');
        
        const response = await fetch(`${API_BASE_URL}/api/public/gallery`);
        
        const contentType = response.headers.get('content-type');
        if (!response.ok || !contentType || !contentType.includes('application/json')) {
            console.warn('⚠️ Gallery API not available');
            showCarouselEmpty(track);
            return;
        }
        
        const images = await response.json();
        
        if (!images || images.length === 0) {
            console.warn('No gallery images found');
            showCarouselEmpty(track);
            return;
        }
        
        // Get latest 10 images
        const latestImages = images
            .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))
            .slice(0, 10);
        
        carouselState.slides = latestImages;
        carouselState.isInitialized = true;
        
        renderCarouselSlides(track, latestImages);
        setupCarouselControls();
        setupCarouselSwipe(container);
        setupCarouselKeyboard();
        startCarouselAutoplay();
        
        container.addEventListener('mouseenter', pauseCarousel);
        container.addEventListener('mouseleave', resumeCarousel);
        
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                pauseCarousel();
            } else {
                resumeCarousel();
            }
        });
        
        console.log(`✅ Carousel loaded with ${latestImages.length} slides`);
        
    } catch (error) {
        console.error('❌ Error loading carousel:', error);
        showCarouselEmpty(track);
    }
}

function showCarouselEmpty(track) {
    track.innerHTML = `
        <div class="carousel-empty">
            <i class="fas fa-images"></i>
            <p>No images in gallery yet</p>
        </div>
    `;
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');
    const dots = document.getElementById('carouselDots');
    const progress = document.querySelector('.carousel-progress');
    if (prevBtn) prevBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';
    if (dots) dots.style.display = 'none';
    if (progress) progress.style.display = 'none';
}

function renderCarouselSlides(track, images) {
    const slidesHTML = images.map((img, index) => {
        const uploadDate = img.uploadDate 
            ? new Date(img.uploadDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
            : 'Recent';
        
        return `
            <div class="carousel-slide ${index === 0 ? 'active' : ''}" data-index="${index}">
                <img 
                    src="${img.cloudinaryUrl}" 
                    alt="${escapeHtmlCarousel(img.title || 'Gallery Image')}" 
                    loading="${index < 2 ? 'eager' : 'lazy'}"
                    onerror="this.src='assets/img/default-event.jpg'"
                >
                <div class="carousel-slide-info">
                    <h3>${escapeHtmlCarousel(img.title || 'Untitled')}</h3>
                    <div class="slide-meta">
                        <span class="slide-category-badge">${escapeHtmlCarousel(img.category || 'events')}</span>
                        <span><i class="far fa-calendar-alt"></i> ${uploadDate}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    track.innerHTML = slidesHTML;
    
    const dotsContainer = document.getElementById('carouselDots');
    if (dotsContainer) {
        dotsContainer.innerHTML = images.map((_, index) => `
            <button 
                class="carousel-dot ${index === 0 ? 'active' : ''}" 
                data-index="${index}"
                aria-label="Go to slide ${index + 1}"
            ></button>
        `).join('');
    }
}

function setupCarouselControls() {
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');
    const dotsContainer = document.getElementById('carouselDots');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            goToCarouselSlide(carouselState.currentIndex - 1);
            resetCarouselProgress();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            goToCarouselSlide(carouselState.currentIndex + 1);
            resetCarouselProgress();
        });
    }
    
    if (dotsContainer) {
        dotsContainer.addEventListener('click', (e) => {
            const dot = e.target.closest('.carousel-dot');
            if (dot) {
                const index = parseInt(dot.dataset.index);
                goToCarouselSlide(index);
                resetCarouselProgress();
            }
        });
    }
}

function goToCarouselSlide(index) {
    const track = document.getElementById('carouselTrack');
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.carousel-dot');
    
    if (!track || slides.length === 0) return;
    
    if (index < 0) {
        index = slides.length - 1;
    } else if (index >= slides.length) {
        index = 0;
    }
    
    carouselState.currentIndex = index;
    track.style.transform = `translateX(-${index * 100}%)`;
    
    slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
    });
    
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
}

function startCarouselAutoplay() {
    if (carouselState.slides.length <= 1) return;
    
    stopCarouselAutoplay();
    
    carouselState.autoplayInterval = setInterval(() => {
        if (!carouselState.isPaused) {
            goToCarouselSlide(carouselState.currentIndex + 1);
            resetCarouselProgress();
        }
    }, carouselState.autoplayDuration);
    
    startCarouselProgress();
}

function stopCarouselAutoplay() {
    if (carouselState.autoplayInterval) {
        clearInterval(carouselState.autoplayInterval);
        carouselState.autoplayInterval = null;
    }
    stopCarouselProgress();
}

function startCarouselProgress() {
    stopCarouselProgress();
    
    const progressBar = document.getElementById('carouselProgressBar');
    if (!progressBar) return;
    
    carouselState.progress = 0;
    progressBar.style.width = '0%';
    
    const updateInterval = 50;
    const step = (updateInterval / carouselState.autoplayDuration) * 100;
    
    carouselState.progressInterval = setInterval(() => {
        if (!carouselState.isPaused) {
            carouselState.progress += step;
            if (carouselState.progress >= 100) {
                carouselState.progress = 0;
            }
            progressBar.style.width = carouselState.progress + '%';
        }
    }, updateInterval);
}

function stopCarouselProgress() {
    if (carouselState.progressInterval) {
        clearInterval(carouselState.progressInterval);
        carouselState.progressInterval = null;
    }
}

function resetCarouselProgress() {
    carouselState.progress = 0;
    const progressBar = document.getElementById('carouselProgressBar');
    if (progressBar) {
        progressBar.style.width = '0%';
    }
}

function pauseCarousel() {
    carouselState.isPaused = true;
}

function resumeCarousel() {
    carouselState.isPaused = false;
}

function setupCarouselSwipe(container) {
    container.addEventListener('touchstart', (e) => {
        carouselState.touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    container.addEventListener('touchend', (e) => {
        carouselState.touchEndX = e.changedTouches[0].screenX;
        handleCarouselSwipe();
    }, { passive: true });
}

function handleCarouselSwipe() {
    const swipeThreshold = 50;
    const diff = carouselState.touchStartX - carouselState.touchEndX;
    
    if (Math.abs(diff) < swipeThreshold) return;
    
    if (diff > 0) {
        goToCarouselSlide(carouselState.currentIndex + 1);
    } else {
        goToCarouselSlide(carouselState.currentIndex - 1);
    }
    
    resetCarouselProgress();
}

function setupCarouselKeyboard() {
    document.addEventListener('keydown', (e) => {
        const container = document.getElementById('carouselContainer');
        if (!container) return;
        
        const rect = container.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        if (!isVisible) return;
        
        if (e.key === 'ArrowLeft') {
            goToCarouselSlide(carouselState.currentIndex - 1);
            resetCarouselProgress();
        } else if (e.key === 'ArrowRight') {
            goToCarouselSlide(carouselState.currentIndex + 1);
            resetCarouselProgress();
        }
    });
}

function escapeHtmlCarousel(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

window.initGalleryCarousel = initGalleryCarousel;

// ==========================================
// ========== ✅ NEW: CUSTOM SECTIONS ==========
// ==========================================

async function initCustomSections() {
    const container = document.getElementById('customSectionsContainer');
    if (!container) return;

    try {
        console.log('🎨 Loading custom sections...');

        const response = await fetch(`${API_BASE_URL}/api/team/public/custom-sections`);

        if (!response.ok) {
            console.warn('⚠️ Custom sections API not available');
            return;
        }

        const sections = await response.json();

        if (!sections || sections.length === 0) {
            console.log('ℹ️ No custom sections to display');
            return;
        }

        // Filter: only show sections that are published + showOnHomepage
        const visibleSections = sections.filter(s => s.isPublished && s.showOnHomepage !== false);

        if (visibleSections.length === 0) {
            console.log('ℹ️ No published sections');
            return;
        }

        // Render all sections
        let html = '';
        visibleSections.forEach(section => {
            html += renderCustomSection(section);
        });

        container.innerHTML = html;
        console.log(`✅ Rendered ${visibleSections.length} custom section(s)`);

    } catch (error) {
        console.error('❌ Error loading custom sections:', error);
    }
}

function renderCustomSection(section) {
    const bgClass = getSectionBgClass(section.background);
    const maxWidth = section.maxWidth || '1400px';
    const padding = section.padding || '90px 28px';

    let html = `
        <section class="custom-section ${bgClass}" id="custom-${escapeHtmlCarousel(section.name)}">
            <div class="custom-section-inner" style="max-width:${maxWidth};padding:${padding};">
    `;

    // Section title (if not hidden)
    if (section.title) {
        html += `
            <div class="section-title">
                <h2>${section.icon ? section.icon + ' ' : ''}${escapeHtmlCarousel(section.title)}</h2>
                ${section.description ? `<p class="section-description">${escapeHtmlCarousel(section.description)}</p>` : ''}
            </div>
        `;
    }

    // Render blocks
    if (section.blocks && section.blocks.length > 0) {
        const sortedBlocks = [...section.blocks].sort((a, b) => (a.order || 0) - (b.order || 0));
        sortedBlocks.forEach(block => {
            html += renderBlock(block);
        });
    }

    html += `
            </div>
        </section>
    `;

    return html;
}

function getSectionBgClass(bg) {
    switch (bg) {
        case 'gradient': return 'bg-gradient';
        case 'dark': return 'bg-dark';
        case 'light': return 'bg-light';
        case 'custom': return 'bg-custom';
        default: return 'bg-default';
    }
}

function renderBlock(block) {
    const c = block.content || {};

    switch (block.type) {
        case 'heading':
            const hTag = c.size || 'h2';
            return `<${hTag} class="custom-heading" style="text-align:${c.align || 'left'};">${escapeHtmlCarousel(c.text || '')}</${hTag}>`;

        case 'subheading':
            return `<h3 class="custom-subheading" style="text-align:${c.align || 'left'};">${escapeHtmlCarousel(c.text || '')}</h3>`;

        case 'paragraph':
            return `<p class="custom-paragraph" style="text-align:${c.align || 'left'};">${escapeHtmlCarousel(c.text || '').replace(/\n/g, '<br>')}</p>`;

        case 'image':
            if (!c.url) return '';
            return `
                <figure class="custom-image">
                    <img src="${escapeAttr(c.url)}" alt="${escapeAttr(c.alt || c.caption || '')}" loading="lazy" onerror="this.src='assets/img/default-event.jpg'">
                    ${c.caption ? `<figcaption>${escapeHtmlCarousel(c.caption)}</figcaption>` : ''}
                </figure>
            `;

        case 'video':
            if (!c.url) return '';
            // YouTube embed
            let videoUrl = c.url;
            if (videoUrl.includes('youtube.com/watch?v=')) {
                const vid = videoUrl.split('v=')[1]?.split('&')[0];
                videoUrl = `https://www.youtube.com/embed/${vid}`;
            } else if (videoUrl.includes('youtu.be/')) {
                const vid = videoUrl.split('youtu.be/')[1]?.split('?')[0];
                videoUrl = `https://www.youtube.com/embed/${vid}`;
            }
            return `
                <div class="custom-video">
                    <iframe src="${escapeAttr(videoUrl)}" frameborder="0" allowfullscreen loading="lazy"></iframe>
                    ${c.caption ? `<p class="video-caption">${escapeHtmlCarousel(c.caption)}</p>` : ''}
                </div>
            `;

        case 'button':
            const btnClass = `custom-btn custom-btn-${c.style || 'primary'}`;
            const target = c.target === '_blank' ? 'target="_blank" rel="noopener noreferrer"' : '';
            return `
                <div class="custom-button-wrap" style="text-align:${c.align || 'left'};">
                    <a href="${escapeAttr(c.url || '#')}" class="${btnClass}" ${target}>
                        ${escapeHtmlCarousel(c.text || 'Click Here')}
                    </a>
                </div>
            `;

        case 'gallery':
            if (!c.images || c.images.length === 0) return '';
            const cols = c.columns || 3;
            return `
                <div class="custom-gallery" style="grid-template-columns:repeat(${cols}, 1fr);">
                    ${c.images.map(img => `
                        <div class="gallery-img">
                            <img src="${escapeAttr(img.url)}" alt="Gallery image" loading="lazy">
                        </div>
                    `).join('')}
                </div>
            `;

        case 'list':
            if (!c.items || c.items.length === 0) return '';
            const listTag = c.listType === 'number' ? 'ol' : 'ul';
            return `
                <${listTag} class="custom-list">
                    ${c.items.map(item => `<li>${escapeHtmlCarousel(item)}</li>`).join('')}
                </${listTag}>
            `;

        case 'quote':
            return `
                <blockquote class="custom-quote">
                    <p>${escapeHtmlCarousel(c.text || '').replace(/\n/g, '<br>')}</p>
                    ${c.author ? `<cite>— ${escapeHtmlCarousel(c.author)}</cite>` : ''}
                </blockquote>
            `;

        case 'divider':
            return `<hr class="custom-divider" style="border-top-style:${c.style || 'solid'};">`;

        case 'card':
            return `
                <div class="custom-card">
                    ${c.icon ? `<div class="card-icon">${c.icon.startsWith('fa-') ? `<i class="${c.icon}"></i>` : c.icon}</div>` : ''}
                    ${c.title ? `<h4>${escapeHtmlCarousel(c.title)}</h4>` : ''}
                    ${c.description ? `<p>${escapeHtmlCarousel(c.description)}</p>` : ''}
                    ${c.url ? `<a href="${escapeAttr(c.url)}" class="card-link">Learn More <i class="fas fa-arrow-right"></i></a>` : ''}
                </div>
            `;

        // ========== ✅ NEW: CARD GRID (multiple cards) ==========
        case 'cardgrid':
            if (!c.cards || c.cards.length === 0) return '';
            const gridCols = c.columns || 3;
            return `
                <div class="custom-cardgrid" style="grid-template-columns:repeat(${gridCols}, 1fr);">
                    ${c.cards.map(card => `
                        <div class="custom-cardgrid-item">
                            ${card.image 
                                ? `<div class="cardgrid-image"><img src="${escapeAttr(card.image)}" alt="${escapeAttr(card.title || '')}" loading="lazy" onerror="this.style.display='none'"></div>`
                                : `<div class="cardgrid-image cardgrid-image-placeholder"><i class="fas fa-user"></i></div>`
                            }
                            <div class="cardgrid-content">
                                ${card.title ? `<h4>${escapeHtmlCarousel(card.title)}</h4>` : ''}
                                ${card.subtitle ? `<p class="cardgrid-subtitle">${escapeHtmlCarousel(card.subtitle)}</p>` : ''}
                                ${card.description ? `<p class="cardgrid-description">${escapeHtmlCarousel(card.description)}</p>` : ''}
                                ${card.link ? `<a href="${escapeAttr(card.link)}" class="cardgrid-link" target="_blank" rel="noopener noreferrer">
                                    ${escapeHtmlCarousel(card.linkText || 'Learn More')} <i class="fas fa-arrow-right"></i>
                                </a>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;

        case 'cta':
            return `
                <div class="custom-cta">
                    ${c.heading ? `<h3>${escapeHtmlCarousel(c.heading)}</h3>` : ''}
                    ${c.text ? `<p>${escapeHtmlCarousel(c.text)}</p>` : ''}
                    ${c.buttonText ? `<a href="${escapeAttr(c.buttonUrl || '#')}" class="cta-btn">${escapeHtmlCarousel(c.buttonText)}</a>` : ''}
                </div>
            `;

        case 'html':
            // Raw HTML — as-is render
            return `<div class="custom-html">${c.code || ''}</div>`;

        case 'spacer':
            return `<div style="height:${c.height || 40}px;"></div>`;

        default:
            return '';
    }
}

function escapeAttr(text) {
    if (!text) return '';
    return String(text).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Expose globally for retry
window.initCustomSections = initCustomSections;

// ==========================================
// ========== ✅ NEW: LATEST VIDEOS (REELS) ==========
// ==========================================

async function initLatestVideos() {
    const container = document.getElementById('reelsContainer');
    if (!container) return;

    try {
        console.log('🎬 Loading latest videos...');

        const response = await fetch(`${API_BASE_URL}/api/team/public/reels`);

        if (!response.ok) {
            console.warn('⚠️ Latest Videos API not available');
            hideVideosSection();
            return;
        }

        const reels = await response.json();

        if (!reels || reels.length === 0) {
            console.log('ℹ️ No videos to display');
            hideVideosSection();
            return;
        }

        renderReels(reels);
        console.log(`✅ Rendered ${reels.length} video(s)`);

    } catch (error) {
        console.error('❌ Error loading latest videos:', error);
        hideVideosSection();
    }
}

function hideVideosSection() {
    const section = document.getElementById('latest-videos');
    if (section) section.style.display = 'none';
}

function renderReels(reels) {
    const container = document.getElementById('reelsContainer');
    if (!container) return;

    // ✅ Single reel ke liye class add karo
    const isSingle = reels.length === 1;
    let html = '<div class="reels-scroll' + (isSingle ? ' single-reel' : '') + '">';

    reels.forEach(function (reel) {
        const aspectClass = reel.aspectRatio === 'horizontal' ? 'horizontal' : (reel.aspectRatio === 'square' ? 'square' : 'vertical');
        html += '<div class="reel-item ' + aspectClass + '" onclick="openReelModal(\'' + reel._id + '\')">' +
            '<div class="reel-video-wrapper">';

        if (reel.videoType === 'url' && isExternalEmbed(reel.videoUrl)) {
            html += '<iframe src="' + escapeAttr(getEmbedUrl(reel.videoUrl)) + '" frameborder="0" allowfullscreen loading="lazy"></iframe>';
        } else {
            html += '<video src="' + escapeAttr(reel.videoUrl) + '" ' +
                (reel.thumbnailUrl ? 'poster="' + escapeAttr(reel.thumbnailUrl) + '"' : '') +
                ' muted loop playsinline autoplay preload="metadata"></video>';
        }

        html += '</div>' +
            '<div class="reel-overlay">' +
            '<i class="fas fa-play-circle"></i>' +
            '</div>' +
            '<div class="reel-title">' + escapeHtmlCarousel(reel.title) + '</div>' +
            '</div>';
    });

    html += '</div>';
    container.innerHTML = html;

    // Store reels globally for modal
    window._c3Reels = reels;
}

function isExternalEmbed(url) {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com') || url.includes('instagram.com');
}

function getEmbedUrl(url) {
    if (!url) return '';
    if (url.includes('youtube.com/watch?v=')) {
        return 'https://www.youtube.com/embed/' + url.split('v=')[1].split('&')[0] + '?autoplay=1&mute=1&loop=1';
    }
    if (url.includes('youtu.be/')) {
        return 'https://www.youtube.com/embed/' + url.split('youtu.be/')[1].split('?')[0] + '?autoplay=1&mute=1&loop=1';
    }
    if (url.includes('youtube.com/shorts/')) {
        return 'https://www.youtube.com/embed/' + url.split('youtube.com/shorts/')[1].split('?')[0] + '?autoplay=1&mute=1&loop=1';
    }
    if (url.includes('vimeo.com/')) {
        var vid = url.split('vimeo.com/')[1].split('/')[0];
        return 'https://player.vimeo.com/video/' + vid + '?autoplay=1&muted=1&loop=1';
    }
    return url;
}

// ========== REEL MODAL (Full-screen play with sound) ==========
function openReelModal(reelId) {
    var reels = window._c3Reels || [];
    var reel = reels.find(function (r) { return r._id === reelId; });
    if (!reel) return;

    var modal = document.getElementById('reelModal');
    var content = document.getElementById('reelModalContent');
    if (!modal || !content) return;

    var html = '';

    if (reel.videoType === 'url' && isExternalEmbed(reel.videoUrl)) {
        html = '<iframe src="' + escapeAttr(getEmbedUrl(reel.videoUrl).replace('mute=1', 'mute=0')) + '" frameborder="0" allowfullscreen allow="autoplay; encrypted-media"></iframe>';
    } else {
        html = '<video src="' + escapeAttr(reel.videoUrl) + '" controls autoplay playsinline' +
            (reel.thumbnailUrl ? ' poster="' + escapeAttr(reel.thumbnailUrl) + '"' : '') +
            '></video>';
    }

    html += '<div class="reel-modal-info">' +
        '<h3>' + escapeHtmlCarousel(reel.title) + '</h3>' +
        (reel.description ? '<p>' + escapeHtmlCarousel(reel.description) + '</p>' : '') +
        '</div>';

    content.innerHTML = html;
    modal.classList.add('active');
    
    // ✅ Single reel mode
    if (reels.length === 1) {
        modal.classList.add('single-reel-active');
    } else {
        modal.classList.remove('single-reel-active');
    }
    
    document.body.style.overflow = 'hidden';
}

function closeReelModal() {
    var modal = document.getElementById('reelModal');
    var content = document.getElementById('reelModalContent');
    if (modal) {
        modal.classList.remove('active');
        modal.classList.remove('single-reel-active');   // ✅ Remove single reel class
    }
    if (content) content.innerHTML = '';
    document.body.style.overflow = 'auto';
}

// Close on outside click
document.addEventListener('click', function (e) {
    if (e.target && e.target.id === 'reelModal') {
        closeReelModal();
    }
});

// Expose globally
window.initLatestVideos = initLatestVideos;
window.openReelModal = openReelModal;
window.closeReelModal = closeReelModal;