// Loading Animation
window.addEventListener('load', function() {
    setTimeout(function() {
        document.querySelector('.loading-screen').classList.add('fade-out');
    }, 3000);
});

// Matrix Background
const canvas = document.getElementById('matrixCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const nums = '0123456789';
const symbols = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';

const alphabet = katakana + latin + nums + symbols;

const fontSize = 16;
const columns = canvas.width / fontSize;

const rainDrops = [];

for (let x = 0; x < columns; x++) {
    rainDrops[x] = 1;
}

const draw = () => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = document.documentElement.getAttribute('data-theme') === 'light' ? '#0066ff' : '#00f0ff';
    ctx.font = fontSize + 'px monospace';
    
    for (let i = 0; i < rainDrops.length; i++) {
        const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
        ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);
        
        if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            rainDrops[i] = 0;
        }
        rainDrops[i]++;
    }
};

setInterval(draw, 30);

// Code Background Animation
const codeLines = [
    "function createMagic() {",
    "  const creativity = new Inspiration();",
    "  const code = new Innovation();",
    "  while (!success) {",
    "    try {",
    "      const result = creativity.meets(code);",
    "      if (result) return 'Awesome!';",
    "    } catch (error) {",
    "      debug(error);",
    "      tryAgain();",
    "    }",
    "  }",
    "}",
    "class Community {",
    "  constructor() {",
    "    this.passion = 100;",
    "    this.innovation = true;",
    "  }",
    "  collaborate() {",
    "    return this.passion * Math.random();",
    "  }",
    "}",
    "// Join our creative coding journey",
    "const community = new Community();",
    "setInterval(() => {",
    "  community.collaborate();",
    "}, 1000);"
];

const codeElement = document.getElementById('codeAnimation');
let currentLine = 0;

function typeCode() {
    if (currentLine < codeLines.length) {
        codeElement.innerHTML += codeLines[currentLine] + "<br>";
        currentLine++;
        setTimeout(typeCode, Math.random() * 500 + 100);
    } else {
        currentLine = 0;
        codeElement.innerHTML = "";
        setTimeout(typeCode, 1000);
    }
}

typeCode();

// Mobile Navigation
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const navLinksItems = document.querySelectorAll('.nav-links li');

hamburger.addEventListener('click', function() {
    navLinks.classList.toggle('active');
    hamburger.innerHTML = navLinks.classList.contains('active') ? 
        '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
});

// Close mobile menu when clicking a link
navLinksItems.forEach(item => {
    item.addEventListener('click', () => {
        navLinks.classList.remove('active');
        hamburger.innerHTML = '<i class="fas fa-bars"></i>';
    });
});

// Theme Switcher
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle.querySelector('i');

// Check for saved theme preference or use preferred color scheme
const currentTheme = localStorage.getItem('theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
document.documentElement.setAttribute('data-theme', currentTheme);

if (currentTheme === 'light') {
    themeIcon.className = 'fas fa-sun';
}

themeToggle.addEventListener('click', function() {
    const newTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    themeIcon.className = newTheme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
});

// Gallery Navigation
const galleryLink = document.getElementById('galleryLink');
const galleryContainer = document.querySelector('.gallery-container');

galleryLink.addEventListener('click', function(e) {
    e.preventDefault();
    
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show gallery
    galleryContainer.classList.add('active');
    
    // Scroll to gallery
    window.scrollTo({
        top: galleryContainer.offsetTop - 80,
        behavior: 'smooth'
    });
    
    // Update active nav link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
    });
    this.classList.add('active');
});

// Show other sections when clicking other nav links
document.querySelectorAll('.nav-links a:not(#galleryLink)').forEach(link => {
    link.addEventListener('click', function(e) {
        if (this.getAttribute('href') !== '#contact') {
            e.preventDefault();
            
            // Show all sections
            document.querySelectorAll('.section').forEach(section => {
                section.style.display = 'block';
            });
            
            // Hide gallery
            galleryContainer.classList.remove('active');
            
            // Scroll to section
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
            
            // Update active nav link
            document.querySelectorAll('.nav-links a').forEach(link => {
                link.classList.remove('active');
            });
            this.classList.add('active');
        }
    });
});

// Event Modal
const eventModal = document.getElementById('eventModal');
const eventCards = document.querySelectorAll('.event-card');

eventCards.forEach(card => {
    card.addEventListener('click', function() {
        const eventType = this.getAttribute('data-event');
        const eventTitle = this.querySelector('h3').textContent;
        const eventDate = this.querySelector('.event-date span').textContent;
        const eventImg = this.querySelector('img').src;
        
        document.getElementById('modalEventTitle').textContent = eventTitle;
        document.getElementById('modalEventDate').textContent = eventDate;
        document.getElementById('modalEventImage').src = eventImg;
        
        // Update modal content based on event type
        let eventBody = '';
        if (eventType === 'hackathon') {
            eventBody = `
                <p>Join us for our annual 24-hour hackathon where developers, designers, and innovators come together to build amazing projects.</p>
                <h3>Details:</h3>
                <ul>
                    <li>Date: June 15-16, 2023</li>
                    <li>Location: Tech Innovation Center</li>
                    <li>Time: 9:00 AM Saturday to 9:00 AM Sunday</li>
                    <li>Theme: "Solutions for Sustainable Future"</li>
                </ul>
                <h3>Prizes:</h3>
                <ul>
                    <li>1st Place: $5,000 + Mentorship Opportunity</li>
                    <li>2nd Place: $3,000</li>
                    <li>3rd Place: $1,500</li>
                    <li>Best Design: $1,000</li>
                </ul>
                <h3>Registration:</h3>
                <p>Teams of 2-4 members can register at our website. Early bird registration ends June 1st.</p>
                <a href="#" class="cta-button">Register Now</a>
            `;
        } else if (eventType === 'workshop') {
            eventBody = `
                <p>Our comprehensive web development workshop covers the latest technologies and best practices in modern web development.</p>
                <h3>Workshop Topics:</h3>
                <ul>
                    <li>HTML5 & CSS3 Fundamentals</li>
                    <li>Responsive Design with Flexbox and Grid</li>
                    <li>JavaScript ES6+ Features</li>
                    <li>Introduction to React.js</li>
                    <li>Backend Basics with Node.js</li>
                    <li>Deployment Strategies</li>
                </ul>
                <h3>Details:</h3>
                <ul>
                    <li>Date: July 5, 2023</li>
                    <li>Time: 10:00 AM - 4:00 PM</li>
                    <li>Location: Creative Coding Lab</li>
                    <li>Skill Level: Beginner to Intermediate</li>
                </ul>
                <h3>Requirements:</h3>
                <p>Bring your laptop with VS Code installed. Basic programming knowledge recommended but not required.</p>
                <a href="#" class="cta-button">Sign Up Now</a>
            `;
        } else if (eventType === 'competition') {
            eventBody = `
                <p>Test your problem-solving skills against the best coders in our community in this intense coding competition.</p>
                <h3>Competition Format:</h3>
                <ul>
                    <li>3-hour timed competition</li>
                    <li>5 algorithmic challenges of varying difficulty</li>
                    <li>Individual participation</li>
                    <li>Languages allowed: Python, Java, JavaScript, C++</li>
                </ul>
                <h3>Details:</h3>
                <ul>
                    <li>Date: August 12, 2023</li>
                    <li>Time: 2:00 PM - 5:00 PM</li>
                    <li>Location: Online (with optional in-person gathering)</li>
                </ul>
                <h3>Prizes:</h3>
                <ul>
                    <li>1st Place: $1,000 + Interview Prep Package</li>
                    <li>2nd Place: $500</li>
                    <li>3rd Place: $250</li>
                    <li>Top 10: Exclusive community badges</li>
                </ul>
                <a href="#" class="cta-button">Join Competition</a>
            `;
        }
        
        document.getElementById('modalEventBody').innerHTML = eventBody;
        eventModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
});

// Notice Modal
const noticeModal = document.getElementById('noticeModal');
const noticeItems = document.querySelectorAll('.notice-item');

noticeItems.forEach(item => {
    item.addEventListener('click', function() {
        const noticeId = this.getAttribute('data-notice');
        const noticeTitle = this.querySelector('.notice-title').textContent;
        const noticeDate = this.querySelector('.notice-date span').textContent;
        
        document.getElementById('modalNoticeTitle').textContent = noticeTitle;
        document.getElementById('modalNoticeDate').textContent = noticeDate;
        
        // Update modal content based on notice ID
        let noticeBody = '';
        if (noticeId === '1') {
            noticeBody = `
                <p>We're thrilled to announce our 4-week intensive Summer Coding Bootcamp designed for beginners and intermediate coders looking to level up their skills.</p>
                
                <h3>Program Details:</h3>
                <p><strong>Dates:</strong> July 10 - August 4, 2023</p>
                <p><strong>Schedule:</strong> Monday to Thursday, 6:00 PM - 9:00 PM</p>
                <p><strong>Location:</strong> Creative Coding Community Center (Virtual participation also available)</p>
                
                <h3>Curriculum:</h3>
                <ul>
                    <li>Week 1: Web Fundamentals (HTML, CSS, JavaScript)</li>
                    <li>Week 2: Frontend Development (React.js)</li>
                    <li>Week 3: Backend Development (Node.js, Express)</li>
                    <li>Week 4: Final Project & Demo Day</li>
                </ul>
                
                <h3>What You'll Get:</h3>
                <ul>
                    <li>40+ hours of hands-on instruction</li>
                    <li>Personalized mentorship</li>
                    <li>Project portfolio development</li>
                    <li>Career guidance session</li>
                    <li>Certificate of completion</li>
                </ul>
                
                <h3>Tuition:</h3>
                <p>$299 for members ($399 for non-members)</p>
                <p><em>Scholarships available for students and underrepresented groups</em></p>
                
                <p>Space is limited to 30 participants to ensure quality instruction. Registration closes July 5th or when all seats are filled.</p>
                
                <a href="#" class="cta-button">Apply Now</a>
            `;
        } else if (noticeId === '2') {
            noticeBody = `
                <p>We're launching a new community outreach program to teach coding basics to underprivileged students in our area.</p>
                
                <h3>Program Details:</h3>
                <p><strong>Start Date:</strong> July 15, 2023</p>
                <p><strong>Duration:</strong> 8 weeks (Saturdays only)</p>
                <p><strong>Location:</strong> Local Community Centers (3 locations)</p>
                
                <h3>Volunteer Roles:</h3>
                <ul>
                    <li>Instructors (teach basic HTML/CSS/JavaScript)</li>
                    <li>Mentors (provide 1-on-1 assistance)</li>
                    <li>Coordinators (help with logistics and organization)</li>
                </ul>
                
                <h3>Requirements:</h3>
                <ul>
                    <li>Basic coding knowledge (for instructor roles)</li>
                    <li>Patience and enthusiasm for teaching</li>
                    <li>Commitment to at least 4 sessions</li>
                    <li>Background check required</li>
                </ul>
                
                <h3>Benefits:</h3>
                <ul>
                    <li>Teaching experience</li>
                    <li>Community service hours</li>
                    <li>Networking opportunities</li>
                    <li>Exclusive volunteer appreciation event</li>
                </ul>
                
                <p>Orientation session for all volunteers on July 8th at 2:00 PM.</p>
                
                <a href="#" class="cta-button">Sign Up to Volunteer</a>
            `;
        } else if (noticeId === '3') {
            noticeBody = `
                <p>We're excited to launch our new mentorship program connecting experienced developers with those looking to grow their skills.</p>
                
                <h3>Program Structure:</h3>
                <ul>
                    <li>3-month mentorship cycles</li>
                    <li>Bi-weekly 1-hour meetings (virtual or in-person)</li>
                    <li>Structured learning paths available</li>
                    <li>Career guidance and portfolio review</li>
                </ul>
                
                <h3>For Mentees:</h3>
                <p>Whether you're just starting out or looking to advance your career, our mentors can help you:</p>
                <ul>
                    <li>Learn new technologies</li>
                    <li>Improve your coding skills</li>
                    <li>Prepare for job interviews</li>
                    <li>Navigate career transitions</li>
                </ul>
                
                <h3>For Mentors:</h3>
                <p>Share your knowledge and give back to the community while:</p>
                <ul>
                    <li>Developing leadership skills</li>
                    <li>Expanding your professional network</li>
                    <li>Earning recognition in our community</li>
                </ul>
                
                <h3>Application Deadline:</h3>
                <p>June 20, 2023 for the first cycle starting July 1st.</p>
                
                <a href="#" class="cta-button">Apply as Mentee</a>
                <a href="#" class="cta-button" style="margin-left: 1rem;">Apply as Mentor</a>
            `;
        } else if (noticeId === '4') {
            noticeBody = `
                <p>Congratulations to all participants of our May Coding Challenge! We had record participation this month with 87 submissions.</p>
                
                <h3>Challenge Winners:</h3>
                <ul>
                    <li><strong>1st Place:</strong> Alex Turner - Optimized sorting algorithm with O(n log n) complexity</li>
                    <li><strong>2nd Place:</strong> Maria Garcia - Elegant recursive solution</li>
                    <li><strong>3rd Place:</strong> Jordan Smith - Most creative approach</li>
                </ul>
                
                <h3>Honorable Mentions:</h3>
                <ul>
                    <li>Best Documentation: Taylor Wong</li>
                    <li>Cleanest Code: Sam Patel</li>
                    <li>Most Innovative Solution: Casey Nguyen</li>
                </ul>
                
                <p>All winners will receive exclusive community badges and featured profiles on our website.</p>
                
                <h3>June Challenge:</h3>
                <p>Our June challenge will focus on data structures. Details will be announced on June 5th.</p>
                
                <a href="#" class="cta-button">View Challenge Solutions</a>
            `;
        }
        
        document.getElementById('modalNoticeBody').innerHTML = noticeBody;
        noticeModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
});

// Image Modal
const imageModal = document.getElementById('imageModal');
const fullImage = document.getElementById('fullImage');
const galleryImages = document.querySelectorAll('.gallery-item img');

galleryImages.forEach(image => {
    image.addEventListener('click', function() {
        fullImage.src = this.src;
        imageModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
});

// Close Modals
const closeButtons = document.querySelectorAll('.close-modal, .close-image-modal');
const modals = document.querySelectorAll('.modal, .image-modal');

closeButtons.forEach(button => {
    button.addEventListener('click', function() {
        modals.forEach(modal => {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    });
});

// Close modal when clicking outside content
modals.forEach(modal => {
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Update active nav link on scroll
window.addEventListener('scroll', function() {
    const scrollPosition = window.scrollY + 100;
    
    document.querySelectorAll('.section, .gallery-container').forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            document.querySelectorAll('.nav-links a').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
});

// Resize canvas on window resize
window.addEventListener('resize', function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Auth Popup
const authLink = document.getElementById('authLink');
const authPopup = document.getElementById('authPopup');
const closePopup = document.querySelector('.close-popup');

// Update the authLink based on token presence
const webtoken = localStorage.getItem("jwtToken");
if(webtoken){
    authLink.innerHTML="Dashboard";
    authLink.href="./user-dashboard.html";
}

// Add event listener to authLink that checks token first
authLink.addEventListener('click', function(e) {
    // If user is logged in, redirect to dashboard
    if(localStorage.getItem("jwtToken")) {
        e.preventDefault(); // Prevent default to handle navigation ourselves
        window.location.href = "./user-dashboard.html"; // Explicitly navigate to dashboard
        return;
    }
    
    // Otherwise, show the auth popup
    e.preventDefault();
    authPopup.classList.add('active');
    document.body.style.overflow = 'hidden';
});

// Close popup
closePopup.addEventListener('click', function() {
    authPopup.classList.remove('active');
    document.body.style.overflow = 'auto';
});

// Close popup when clicking outside
authPopup.addEventListener('click', function(e) {
    if (e.target === this) {
        this.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

// Auth Tabs Functionality
const loginTab = document.getElementById('loginTab');
const registerTab = document.getElementById('registerTab');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const showLogin = document.getElementById('showLogin');

loginTab.addEventListener('click', function() {
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
});

registerTab.addEventListener('click', function() {
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    registerForm.classList.add('active');
    loginForm.classList.remove('active');
});

showLogin.addEventListener('click', function(e) {
    e.preventDefault();
    loginTab.click();
});

// Form Submissions
const loginFormElement = document.getElementById('loginFormElement');
const registerFormElement = document.getElementById('registerFormElement');

loginFormElement.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('http://127.0.0.1:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        // Store token in localStorage
        localStorage.setItem('jwtToken', data.token);

        // Store events in localStorage or process them
        localStorage.setItem('events', JSON.stringify(data.events));

        // Redirect or update UI
        window.location.href = "#home";
        alert('Login successful! Welcome back to Creative Coding Community.');

        // Optionally, render events on the page
        renderEvents(data.events);

    } catch (error) {
        console.error('Error:', error);
       
    }
});

// Function to render events (example)
function renderEvents(events) {
    const eventsContainer = document.getElementById('events-container'); // Ensure this exists in your HTML
    eventsContainer.innerHTML = events.map(event => `
        <div class="event-card">
            <h3>${event.name}</h3>
            <p>Date: ${new Date(event.date).toLocaleDateString()}</p>
            <p>Location: ${event.location}</p>
            <p>Prize: ${event.prize}</p>
        </div>
    `).join('');
}

// Function to show signup success popup
function showSignupSuccessPopup() {
    const popup = document.getElementById('signupSuccessPopup');
    popup.style.display = 'flex';
}

// Function to hide signup success popup
function hideSignupSuccessPopup() {
    const popup = document.getElementById('signupSuccessPopup');
    popup.style.display = 'none';
}

// Close popup when clicking close button
document.getElementById('closeSignupPopup').addEventListener('click', hideSignupSuccessPopup);

// Modify the register form submission handler
registerFormElement.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    const branch = document.getElementById('branch').value;
    const batch = document.getElementById('batch').value;
    const regno = document.getElementById('regno').value;
    const mobileno = document.getElementById('mobileno').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    try {
        const response = await fetch('http://127.0.0.1:3000/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name,
                email,
                password,
                branch,
                batch,
                regno,
                mobileno
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        showSignupSuccessPopup(); // Show the popup
        loginTab.click();
        document.getElementById('loginEmail').value = email;
        document.getElementById('loginPassword').value = password;
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during registration. Please try again.');
    }
});

// Function to show verify email popup
function showVerifyEmailPopup() {
    const popup = document.getElementById('verifyEmailPopup');
    popup.style.display = 'flex';
}

// Function to hide verify email popup
function hideVerifyEmailPopup() {
    const popup = document.getElementById('verifyEmailPopup');
    popup.style.display = 'none';
}

// Close popup when clicking close button
document.getElementById('closeVerifyPopup').addEventListener('click', hideVerifyEmailPopup);

// Resend verification email
document.getElementById('resendVerificationEmail').addEventListener('click', async () => {
    try {
        const response = await fetch('/resend-verification', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const data = await response.json();
        if (response.ok) {
            alert('Verification email sent! Please check your inbox.');
        } else {
            alert(data.message || 'Failed to resend verification email');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while resending the verification email');
    }
});

// Check if user is verified on page load (except on registration/login pages)
window.addEventListener('load', async () => {
    const token = localStorage.getItem('token');
    const isAuthPage = window.location.pathname.includes('login') || 
                       window.location.pathname.includes('register');

    if (token && !isAuthPage) {
        try {
            const response = await fetch('/check-verification', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (!data.isVerified) {
                showVerifyEmailPopup();
            }
        } catch (error) {
            console.error('Error checking verification status:', error);
        }
    }
});

// Function to render event cards (modified to handle your API response format)
function renderEventCards(events, container) {
  container.innerHTML = '';
  
  if (!events || events.length === 0) {
    container.innerHTML = `
      <div class="no-events">
        <i class="fas fa-calendar-times"></i>
        <p>No events found.</p>
      </div>
    `;
    return;
  }
  
  events.forEach(event => {
    const card = document.createElement('div');
    card.className = 'event-card';
    
    // Extract properties from the event object
    const eventId = event._id;
    const eventName = event.name || 'Unnamed Event';
    const eventDate = event.date ? new Date(event.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : 'Date TBA';
    const eventLocation = event.location || 'Location TBA';
    const eventDescription = event.description || 'No description available';
    const imageUrl = event.imagelink || 'https://via.placeholder.com/400x200?text=Event';
    const isOpen = event.isOpen !== undefined ? event.isOpen : true;
    
    // Extract event type from name or set default
    const eventType = event.type || (event.name?.includes('TEAMUP') ? 'Team Event' : 'Workshop');
    
    // Set participants count or default
    const participantsCount = event.participants?.length || 0;
    
    card.innerHTML = `
      <div class="event-img-container">
        <img src="${imageUrl}" alt="${eventName}">
        <span class="event-tag">${eventType}</span>
      </div>
      <div class="event-info">
        <h3 class="event-title">${eventName}</h3>
        <p class="event-date"><i class="far fa-calendar-alt"></i> ${eventDate}</p>
        <p class="event-location"><i class="fas fa-map-marker-alt"></i> ${eventLocation}</p>
        <p class="event-description">${eventDescription}</p>
        <div class="event-status-bar">
          <span class="status ${isOpen ? 'open' : 'closed'}">
            <i class="fas ${isOpen ? 'fa-unlock' : 'fa-lock'}"></i>
            ${isOpen ? 'Open for Registration' : 'Registration Closed'}
          </span>
          <span class="participants-count">
            <i class="fas fa-users"></i>
            ${participantsCount} Participants
          </span>
        </div>
        <div class="event-card-actions">
          <button class="card-action-btn view" onclick="showEventDetails('${eventId}'); event.stopPropagation();">
            <i class="fas fa-eye"></i> View Details
          </button>
        </div>
      </div>
    `;
    
    container.appendChild(card);
  });
}