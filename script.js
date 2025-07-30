// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    const nav = document.querySelector('.nav');
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-link');
    
    // Initialize hero section particles
    initHeroParticles();

    // Navbar scroll effect
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            nav.style.background = 'rgba(255, 255, 255, 0.98)';
            nav.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        } else {
            nav.style.background = 'rgba(255, 255, 255, 0.95)';
            nav.style.boxShadow = 'none';
        }
        
        lastScroll = currentScroll;
    });

    // Mobile navigation toggle
    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    // Smooth scrolling for navigation links (only for internal anchor links)
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const targetId = item.getAttribute('href');
            
            // Only prevent default for internal anchor links (starting with #)
            if (targetId && targetId.startsWith('#')) {
                e.preventDefault();
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    const offsetTop = targetSection.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                    
                    // Update active nav item
                    navItems.forEach(navItem => navItem.classList.remove('active'));
                    item.classList.add('active');
                    
                    // Close mobile menu if open
                    navLinks.classList.remove('active');
                    navToggle.classList.remove('active');
                }
            } else {
                // For external links (like portfolio.html), just close mobile menu if open
                navLinks.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });
    });

    // Handle all button clicks for smooth scrolling
    const allButtons = document.querySelectorAll('button, .btn');
    allButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const buttonText = button.textContent.trim().toLowerCase();
            
            // Handle different button types
            if (buttonText.includes('start your project') || buttonText.includes('get started')) {
                e.preventDefault();
                const contactSection = document.querySelector('#contact');
                if (contactSection) {
                    const offsetTop = contactSection.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            } else if (buttonText.includes('view our work') || buttonText.includes('portfolio')) {
                e.preventDefault();
                const portfolioSection = document.querySelector('#portfolio');
                if (portfolioSection) {
                    const offsetTop = portfolioSection.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            } else if (buttonText.includes('learn more') || buttonText.includes('services')) {
                e.preventDefault();
                const servicesSection = document.querySelector('#services');
                if (servicesSection) {
                    const offsetTop = servicesSection.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    // Portfolio filtering
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    // Ensure all items are visible initially
    portfolioItems.forEach(item => {
        item.classList.remove('hidden');
        item.style.opacity = '1';
        item.style.transform = 'scale(1)';
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterBtns.forEach(button => button.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            
            const filter = btn.getAttribute('data-filter');
            
            // First, fade out all items
            portfolioItems.forEach(item => {
                item.style.opacity = '0';
                item.style.transform = 'scale(0.8)';
            });
            
            // After a short delay, hide/show items and fade in visible ones
            setTimeout(() => {
                portfolioItems.forEach(item => {
                    const category = item.getAttribute('data-category');
                    
                    if (filter === 'all' || category === filter) {
                        item.classList.remove('hidden');
                        // Fade in with slight delay for staggered effect
                        setTimeout(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'scale(1)';
                        }, 50);
                    } else {
                        item.classList.add('hidden');
                    }
                });
            }, 200);
        });
    });

    // Form handling
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const formObj = Object.fromEntries(formData);
            
            // Simulate form submission
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            
            setTimeout(() => {
                alert('Thank you for your message! We\'ll get back to you soon.');
                contactForm.reset();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 2000);
        });
    }

    // Floating cards animation enhancement
    const floatingCards = document.querySelectorAll('.floating-card');
    floatingCards.forEach((card, index) => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-12px) rotate(2deg)';
            card.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            card.style.boxShadow = '';
        });
    });

    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-on-scroll');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.service-card, .portfolio-item, .review-card, .contact-item');
    animateElements.forEach(el => {
        observer.observe(el);
    });

    // Smooth hover effects for buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'translateY(-2px)';
        });
        
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
        });
    });

    // Active section highlighting in navigation
    const sections = document.querySelectorAll('section[id]');
    const navLinksArray = Array.from(navItems);

    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            
            if (window.pageYOffset >= sectionTop && 
                window.pageYOffset < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        navLinksArray.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // Parallax effect for hero section
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallax = document.querySelector('.hero-visual');
        if (parallax) {
            const speed = scrolled * 0.5;
            parallax.style.transform = `translateY(${speed}px)`;
        }
    });

    // Service cards interaction
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

    // Portfolio item click handler
    portfolioItems.forEach(item => {
        item.addEventListener('click', () => {
            // Here you could implement a modal or detail view
            const title = item.querySelector('h3').textContent;
            console.log(`Clicked on project: ${title}`);
            // You could show a modal with more project details here
        });
    });

    // Review cards hover effect
    const reviewCards = document.querySelectorAll('.review-card');
    reviewCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-4px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

    // Form input focus effects
    const formInputs = document.querySelectorAll('.form-group input, .form-group select, .form-group textarea');
    formInputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.style.transform = 'scale(1.02)';
        });
        
        input.addEventListener('blur', () => {
            input.parentElement.style.transform = '';
        });
    });



    // Scroll to top functionality (if needed)
    let scrollToTopBtn = document.createElement('button');
    scrollToTopBtn.innerHTML = '↑';
    scrollToTopBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: var(--gradient-primary);
        color: var(--primary-dark);
        border: none;
        font-size: 20px;
        font-weight: bold;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 1000;
        box-shadow: var(--shadow-medium);
    `;

    document.body.appendChild(scrollToTopBtn);

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.style.opacity = '1';
            scrollToTopBtn.style.visibility = 'visible';
        } else {
            scrollToTopBtn.style.opacity = '0';
            scrollToTopBtn.style.visibility = 'hidden';
        }
    });

    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Add loading animation for images (excluding logos)
    const images = document.querySelectorAll('img:not(.logo):not(.footer-logo img)');
    images.forEach(img => {
        // Only apply the effect to non-logo images
        if (!img.classList.contains('logo') && !img.closest('.footer-logo')) {
            // Check if image is already loaded
            if (img.complete) {
                // If image is already loaded, show it immediately
                img.style.opacity = '1';
                img.style.transform = 'scale(1)';
            } else {
                // If image is still loading, add load event listener
                img.addEventListener('load', function() {
                    this.style.opacity = '1';
                    this.style.transform = 'scale(1)';
                }, { once: true });
                
                // Set initial styles
                img.style.opacity = '0';
                img.style.transform = 'scale(0.9)';
                img.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            }
        }
    });
});

// Additional utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimized scroll listener
const optimizedScroll = debounce(() => {
    // Any additional scroll handling can go here
}, 10);

window.addEventListener('scroll', optimizedScroll);

// Hero section animated particles
function initHeroParticles() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    // Create canvas element for particles
    const canvas = document.createElement('canvas');
    canvas.classList.add('hero-particles');
    canvas.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
        pointer-events: none;
    `;
    hero.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    let width = canvas.width = hero.offsetWidth;
    let height = canvas.height = hero.offsetHeight;
    
    // Brand colors
    const colors = [
        'rgba(255, 215, 0, 0.7)',  // Gold/Yellow
        'rgba(255, 165, 0, 0.6)',   // Orange
        'rgba(255, 215, 0, 0.4)',    // Lighter Gold
        'rgba(255, 165, 0, 0.3)'     // Lighter Orange
    ];
    
    // Particle properties
    const particles = [];
    const particleCount = Math.min(Math.floor(width * height / 10000), 100);
    const maxSize = 8;
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * maxSize + 1,
            color: colors[Math.floor(Math.random() * colors.length)],
            speedX: Math.random() * 0.5 - 0.25,
            speedY: Math.random() * 0.5 - 0.25,
            opacity: Math.random() * 0.5 + 0.3
        });
    }
    
    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, width, height);
        
        // Update and draw particles
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            
            // Update position
            p.x += p.speedX;
            p.y += p.speedY;
            
            // Wrap around edges
            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height;
            if (p.y > height) p.y = 0;
            
            // Draw particle
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.opacity;
            ctx.fill();
        }
        
        requestAnimationFrame(animate);
    }
    
    // Handle resize
    window.addEventListener('resize', debounce(() => {
        width = canvas.width = hero.offsetWidth;
        height = canvas.height = hero.offsetHeight;
    }, 250));
    
    // Start animation
    animate();
}