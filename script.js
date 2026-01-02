/* ============================================
   MOKA'S PERSONAL WEBSITE - JAVASCRIPT
   Making everything come alive! ✨
   ============================================ */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    initCustomCursor();
    initParticles();
    initNavigation();
    initScrollAnimations();
    initPunGenerator();
    initSmoothScroll();
});

/* ============================================
   CUSTOM CURSOR
   ============================================ */
function initCustomCursor() {
    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursor-follower');

    if (!cursor || !follower) return;

    // Check if it's a touch device
    if ('ontouchstart' in window) {
        cursor.style.display = 'none';
        follower.style.display = 'none';
        return;
    }

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let followerX = 0, followerY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Smooth cursor animation
    function animateCursor() {
        // Cursor follows instantly
        cursorX += (mouseX - cursorX) * 0.5;
        cursorY += (mouseY - cursorY) * 0.5;

        // Follower has delay
        followerX += (mouseX - followerX) * 0.15;
        followerY += (mouseY - followerY) * 0.15;

        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';

        follower.style.left = followerX + 'px';
        follower.style.top = followerY + 'px';

        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Cursor effects on interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .life-card, .info-card, .contact-card');

    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.transform = 'scale(2)';
            follower.style.transform = 'scale(1.5)';
            follower.style.borderColor = 'var(--accent-pink)';
        });

        el.addEventListener('mouseleave', () => {
            cursor.style.transform = 'scale(1)';
            follower.style.transform = 'scale(1)';
            follower.style.borderColor = 'var(--primary-light)';
        });
    });
}

/* ============================================
   PARTICLES BACKGROUND
   ============================================ */
function initParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;

    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
        createParticle(particlesContainer);
    }
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'particle';

    // Random position
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';

    // Random size
    const size = Math.random() * 4 + 2;
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';

    // Random animation delay
    particle.style.animationDelay = Math.random() * 20 + 's';

    // Random color variation
    const colors = ['var(--primary)', 'var(--accent-pink)', 'var(--accent-teal)', 'var(--accent-amber)'];
    particle.style.background = colors[Math.floor(Math.random() * colors.length)];

    container.appendChild(particle);
}

/* ============================================
   NAVIGATION
   ============================================ */
function initNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navbar = document.querySelector('.navbar');

    // Mobile menu toggle
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            navToggle.classList.toggle('active');
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });
    }

    // Active link on scroll
    const sections = document.querySelectorAll('section[id]');
    const navLinkElements = document.querySelectorAll('.nav-link');

    function updateActiveLink() {
        const scrollY = window.scrollY;

        sections.forEach(section => {
            const sectionTop = section.offsetTop - 150;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                navLinkElements.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + sectionId) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', updateActiveLink);

    // Navbar background on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(15, 15, 26, 0.95)';
        } else {
            navbar.style.background = 'rgba(15, 15, 26, 0.8)';
        }
    });
}

/* ============================================
   SCROLL ANIMATIONS
   ============================================ */
function initScrollAnimations() {
    // Create intersection observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observe elements that should animate
    const animateElements = document.querySelectorAll(
        '.life-card, .info-card, .timeline-item, .contact-card, .section-header'
    );

    animateElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
}

/* ============================================
   PUN GENERATOR
   ============================================ */
function initPunGenerator() {
    const punElement = document.getElementById('daily-pun');
    const punButton = document.getElementById('new-pun');

    if (!punElement || !punButton) return;

    const puns = [
        "I told my wife she was drawing her eyebrows too high. She looked surprised.",
        "Why do programmers prefer dark mode? Because light attracts bugs!",
        "I'm reading a book about anti-gravity. It's impossible to put down!",
        "Why did the scarecrow win an award? He was outstanding in his field!",
        "I used to hate facial hair, but then it grew on me.",
        "What do you call a fake noodle? An impasta!",
        "Why don't scientists trust atoms? Because they make up everything!",
        "I'm on a seafood diet. I see food and I eat it!",
        "What do you call a bear with no teeth? A gummy bear!",
        "Why did the coffee file a police report? It got mugged!",
        "I would tell you a UDP joke, but you might not get it.",
        "There are only 10 types of people: those who understand binary and those who don't.",
        "A SQL query walks into a bar, walks up to two tables and asks, 'Can I join you?'",
        "Why do Java developers wear glasses? Because they don't C#!",
        "I've got a really good joke about JavaScript... but it only works on your end.",
        "Why was the JavaScript developer sad? Because he didn't Node how to Express himself!",
        "My cat was just sitting there staring at me. I said 'What?' She said 'meow'. Typical code review.",
        "I named my cats 'Commit' and 'Push'. Now I can say I push after every commit!",
        "Why did the chess player bring a ladder? To reach the high ranks!",
        "What's a chess player's favorite snack? Check-mate cookies!",
        "Douglas Adams taught me: Don't Panic, and always know where your towel is!",
        "Chennai filter coffee: Strong enough to debug your code and your life!",
        "I'm not saying my code is perfect, but it works on my MacBook!",
        "Why did I move from Chennai to Hyderabad? For a change of 'byte'!",
        "Marriage is like a software update: Never sure if it's going to fix bugs or create new ones. Worth it though! ❤️",
        "Wodehouse's Jeeves could probably debug my code better than I can.",
        "AR Rahman's music is like good code - it just flows perfectly.",
        "Reading Murakami is like async programming - you never know what timeline you're in!",
        "The Beatles said 'All You Need Is Love'. They clearly never dealt with null pointer exceptions.",
        "Mani Ratnam films are like well-architected software - every frame serves a purpose."
    ];

    let lastPunIndex = -1;

    function getRandomPun() {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * puns.length);
        } while (newIndex === lastPunIndex && puns.length > 1);

        lastPunIndex = newIndex;
        return puns[newIndex];
    }

    punButton.addEventListener('click', () => {
        // Add animation
        punElement.style.opacity = '0';
        punElement.style.transform = 'translateY(10px)';

        setTimeout(() => {
            punElement.textContent = `"${getRandomPun()}"`;
            punElement.style.opacity = '1';
            punElement.style.transform = 'translateY(0)';
        }, 300);
    });

    // Add transition for smooth animation
    punElement.style.transition = 'all 0.3s ease';
}

/* ============================================
   SMOOTH SCROLL
   ============================================ */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));

            if (target) {
                const offsetTop = target.offsetTop - 80; // Account for fixed navbar

                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* ============================================
   TYPEWRITER EFFECT (Optional - for hero)
   ============================================ */
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.textContent = '';

    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}

/* ============================================
   PARALLAX EFFECT
   ============================================ */
window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;

    // Parallax for floating elements
    const floatItems = document.querySelectorAll('.float-item');
    floatItems.forEach((item, index) => {
        const speed = 0.5 + (index * 0.1);
        item.style.transform = `translateY(${scrolled * speed * -0.1}px)`;
    });

    // Parallax for hero visual
    const heroVisual = document.querySelector('.hero-visual');
    if (heroVisual && scrolled < window.innerHeight) {
        heroVisual.style.transform = `translateY(${scrolled * 0.3}px)`;
    }
});

/* ============================================
   EASTER EGG - Konami Code
   ============================================ */
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIndex = 0;

document.addEventListener('keydown', (e) => {
    if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++;

        if (konamiIndex === konamiCode.length) {
            activateEasterEgg();
            konamiIndex = 0;
        }
    } else {
        konamiIndex = 0;
    }
});

function activateEasterEgg() {
    // Fun surprise!
    document.body.style.animation = 'rainbow 2s linear';

    const surprise = document.createElement('div');
    surprise.innerHTML = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--bg-card);
            padding: 2rem;
            border-radius: 20px;
            text-align: center;
            z-index: 10000;
            border: 2px solid var(--primary);
            box-shadow: 0 0 60px var(--primary);
        ">
            <h2 style="font-size: 2rem; margin-bottom: 1rem;">🎉 You found the Easter Egg! 🎉</h2>
            <p style="color: var(--text-secondary);">You're clearly a person of culture.<br>Here's a virtual high-five! ✋</p>
            <button onclick="this.parentElement.parentElement.remove()" style="
                margin-top: 1rem;
                padding: 0.5rem 1rem;
                background: var(--gradient-primary);
                border: none;
                border-radius: 20px;
                color: white;
                cursor: pointer;
            ">Nice! 🎊</button>
        </div>
    `;
    document.body.appendChild(surprise);

    setTimeout(() => {
        document.body.style.animation = '';
    }, 2000);
}

// Add rainbow animation to stylesheet dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes rainbow {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
    }
`;
document.head.appendChild(style);

/* ============================================
   CONSOLE MESSAGE
   ============================================ */
console.log(`
%c🚀 Welcome to Moka's Personal Website! 🚀
%c
Hey there, fellow developer! 👋

Since you're checking out the console, you must be curious.
Here are some things you might find interesting:

• Try the Konami Code (↑↑↓↓←→←→BA) for a surprise!
• This site was built with vanilla HTML, CSS, and JS
• No frameworks were harmed in the making of this website
• Yes, I do prefer dark mode 🌙

Feel free to connect with me! 

— Moka

P.S. Why do programmers prefer dark mode? Because light attracts bugs! 🐛
`,
    'color: #6366f1; font-size: 20px; font-weight: bold;',
    'color: #a1a1aa; font-size: 12px;'
);
