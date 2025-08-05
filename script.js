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

    // Mobile drawer navigation
    const mobileDrawer = document.getElementById('mobileDrawer');
    const drawerOverlay = document.getElementById('drawerOverlay');
    const drawerClose = document.getElementById('drawerClose');
    
    // Debug: Log what elements we found
    console.log('Mobile drawer elements found:');
    console.log('mobileDrawer:', mobileDrawer);
    console.log('drawerOverlay:', drawerOverlay);
    console.log('drawerClose:', drawerClose);
    const mobileDropdownToggles = document.querySelectorAll('.dropdown-toggle');
    
    // Toggle mobile drawer (open/close)
    navToggle.addEventListener('click', (e) => {
        console.log('Nav toggle clicked');
        e.preventDefault();
        e.stopPropagation();
        
        // Check if drawer is currently open
        const isOpen = mobileDrawer.classList.contains('active');
        
        if (isOpen) {
            // Close the drawer
            console.log('Closing drawer via nav toggle');
            closeMobileDrawer();
        } else {
            // Open the drawer
            console.log('Opening drawer via nav toggle');
            mobileDrawer.classList.add('active');
            navToggle.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        }
    });
    
    // Close mobile drawer
    function closeMobileDrawer() {
        console.log('closeMobileDrawer function called');
        mobileDrawer.classList.remove('active');
        navToggle.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
        console.log('Drawer closed, active class removed');
    }
    
    // Make close function globally available for testing
    window.testCloseDrawer = function() {
        console.log('Manual test: Closing drawer...');
        closeMobileDrawer();
    };
    
    // Make drawer state check function available
    window.checkDrawerState = function() {
        console.log('Drawer active:', mobileDrawer.classList.contains('active'));
        console.log('Nav toggle active:', navToggle.classList.contains('active'));
        console.log('Body overflow:', document.body.style.overflow);
    };
    
    // Close drawer when clicking overlay
    drawerOverlay.addEventListener('click', closeMobileDrawer);
    
    // Note: Close button in drawer is now just for visual purposes
    // The nav-toggle button in header handles both open and close functionality
    
    // Close drawer when clicking on navigation links (except dropdown toggles)
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link:not(.dropdown-toggle)');
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            closeMobileDrawer();
        });
    });
    
    // Handle mobile dropdown toggles
    mobileDropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            const dropdown = toggle.closest('.mobile-nav-dropdown');
            dropdown.classList.toggle('active');
        });
    });
    
    // Close drawer on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileDrawer.classList.contains('active')) {
            closeMobileDrawer();
        }
    });
    
    // Handle window resize - close drawer if screen becomes large
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && mobileDrawer.classList.contains('active')) {
            closeMobileDrawer();
        }
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
            
            // Skip buttons that have href attributes (let them work normally)
            if (button.hasAttribute('href')) {
                return; // Let the link work normally
            }
            
            // Skip mobile dropdown toggles (let them work with their specific handler)
            if (button.classList.contains('dropdown-toggle') || button.classList.contains('drawer-close') || button.classList.contains('nav-toggle')) {
                return; // Let mobile navigation handlers work
            }
            
            // Handle different button types for buttons without href
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

// Appointment Booking Calendar Functionality
class BookingCalendar {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = null;
        this.selectedTime = null;
        this.currentMonth = this.currentDate.getMonth();
        this.currentYear = this.currentDate.getFullYear();
        this.bookedSlots = []; // Store booked time slots from Google Calendar
        
        // Add a test booking for debugging (remove this later)
        const today = new Date();
        const testDate = today.toISOString().split('T')[0];
        this.bookedSlots.push({
            date: testDate,
            time: '10:00 AM',
            title: 'Test Booking'
        });
        
        this.monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        // Available time slots (matching HTML time slots)
        this.availableTimeSlots = [
            '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'
        ];
        
        this.init();
    }
    
    init() {
        if (!document.querySelector('.booking-calendar')) return;
        
        this.bindEvents();
        this.renderCalendar();
        this.handleMeetingTypeButtons();
        this.setupFormValidation();
        this.fetchCalendarAvailability();
    }
    
    // Fetch calendar availability from Google Calendar
    async fetchCalendarAvailability() {
        try {
            const startDate = new Date(this.currentYear, this.currentMonth, 1);
            const endDate = new Date(this.currentYear, this.currentMonth + 1, 0);
            
            // Use different endpoints for local development vs production
            const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            const apiEndpoint = isLocal 
                ? `http://localhost:3001/api/calendar-availability?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
                : `/.netlify/functions/calendar-availability?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
            
            console.log('Fetching calendar availability from:', apiEndpoint);
            const response = await fetch(apiEndpoint);
            
            console.log('Calendar availability response status:', response.status);
            if (response.ok) {
                const data = await response.json();
                console.log('Calendar availability data received:', data);
                this.bookedSlots = data.bookedSlots || [];
                console.log('Booked slots set to:', this.bookedSlots);
                this.updateCalendarAvailability();
                // Update time slots if a date is already selected
                if (this.selectedDate) {
                    this.updateTimeSlots();
                }
            } else {
                console.warn('Failed to fetch calendar availability:', response.statusText);
                const errorText = await response.text();
                console.warn('Error response:', errorText);
            }
        } catch (error) {
            console.warn('Error fetching calendar availability:', error);
        }
    }
    
    // Update calendar to show booked slots
    updateCalendarAvailability() {
        const calendarDays = document.getElementById('calendarDays');
        if (!calendarDays) return;
        
        // Group booked slots by date
        const bookedByDate = {};
        this.bookedSlots.forEach(slot => {
            if (!bookedByDate[slot.date]) {
                bookedByDate[slot.date] = [];
            }
            bookedByDate[slot.date].push(slot);
        });
        
        // Update calendar days to show booking status
        calendarDays.querySelectorAll('.calendar-day.available').forEach(dayBtn => {
            const dateStr = dayBtn.getAttribute('data-date');
            if (dateStr && bookedByDate[dateStr]) {
                const bookedSlotsForDay = bookedByDate[dateStr];
                const totalAvailableSlots = this.availableTimeSlots.length;
                
                // If all slots are booked, gray out the entire day
                if (bookedSlotsForDay.length >= totalAvailableSlots) {
                    dayBtn.classList.remove('available');
                    dayBtn.classList.add('fully-booked');
                    dayBtn.disabled = true;
                } else {
                    // Some slots are booked, add partial booking indicator
                    dayBtn.classList.add('partially-booked');
                }
            }
        });
    }
    
    // Update time slots based on selected date
    updateTimeSlots() {
        if (!this.selectedDate) return;
        
        const selectedDateStr = this.selectedDate.toISOString().split('T')[0];
        const bookedSlotsForDate = this.bookedSlots.filter(slot => slot.date === selectedDateStr);
        
        // Update time slot buttons
        const timeSlots = document.querySelectorAll('.time-slot');
        timeSlots.forEach(slot => {
            const timeStr = slot.getAttribute('data-time');
            const isBooked = bookedSlotsForDate.some(bookedSlot => bookedSlot.startTime === timeStr);
            
            if (isBooked) {
                slot.classList.add('booked');
                slot.disabled = true;
                slot.textContent = slot.textContent.replace(' (Booked)', '') + ' (Booked)';
            } else {
                slot.classList.remove('booked');
                slot.disabled = false;
                slot.textContent = slot.textContent.replace(' (Booked)', '');
            }
        });
    }
    
    // Setup form validation
    setupFormValidation() {
        const form = document.getElementById('appointmentForm');
        const submitBtn = form?.querySelector('button[type="submit"]');
        
        if (!form || !submitBtn) return;
        
        const requiredFields = [
            'name', 'email', 'phone', 'meetingType', 'projectType', 'description'
        ];
        
        const validateForm = () => {
            let isValid = true;
            
            // Check required fields
            requiredFields.forEach(fieldName => {
                const field = form.querySelector(`[name="${fieldName}"]`);
                if (field && (!field.value || field.value.trim() === '')) {
                    isValid = false;
                }
            });
            
            // Check if date and time are selected
            if (!this.selectedDate || !this.selectedTime) {
                isValid = false;
            }
            
            // Enable/disable submit button
            submitBtn.disabled = !isValid;
            
            if (isValid) {
                submitBtn.classList.remove('disabled');
                submitBtn.classList.add('enabled');
            } else {
                submitBtn.classList.add('disabled');
                submitBtn.classList.remove('enabled');
            }
        };
        
        // Add event listeners to all form fields
        requiredFields.forEach(fieldName => {
            const field = form.querySelector(`[name="${fieldName}"]`);
            if (field) {
                field.addEventListener('input', validateForm);
                field.addEventListener('change', validateForm);
            }
        });
        
        // Store validation function for later use
        this.validateForm = validateForm;
        
        // Initial validation
        validateForm();
    }
    
    bindEvents() {
        const prevBtn = document.getElementById('prevMonth');
        const nextBtn = document.getElementById('nextMonth');
        const timeSlots = document.querySelectorAll('.time-slot');
        const appointmentForm = document.getElementById('appointmentForm');
        const meetingTypeSelect = document.getElementById('meetingType');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousMonth());
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextMonth());
        }
        
        timeSlots.forEach(slot => {
            slot.addEventListener('click', (e) => this.selectTime(e));
        });
        
        if (appointmentForm) {
            appointmentForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
        
        if (meetingTypeSelect) {
            meetingTypeSelect.addEventListener('change', (e) => {
                this.updateSummaryType(e.target.value);
                this.handleSelectChange(e.target);
            });
        }
        
        // Handle project type select
        const projectTypeSelect = document.getElementById('projectType');
        if (projectTypeSelect) {
            projectTypeSelect.addEventListener('change', (e) => this.handleSelectChange(e.target));
        }
    }
    
    renderCalendar() {
        const monthElement = document.getElementById('currentMonth');
        const calendarDays = document.getElementById('calendarDays');
        
        if (!monthElement || !calendarDays) return;
        
        monthElement.textContent = `${this.monthNames[this.currentMonth]} ${this.currentYear}`;
        
        const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
        const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
        const today = new Date();
        
        let daysHTML = '';
        
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            daysHTML += '<button class="calendar-day other-month"></button>';
        }
        
        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(this.currentYear, this.currentMonth, day);
            const isToday = date.toDateString() === today.toDateString();
            const isPast = date < today.setHours(0, 0, 0, 0);
            
            let classes = 'calendar-day';
            
            if (isPast) {
                classes += ' unavailable';
            } else {
                classes += ' available';
            }
            
            if (this.selectedDate && 
                this.selectedDate.getDate() === day && 
                this.selectedDate.getMonth() === this.currentMonth && 
                this.selectedDate.getFullYear() === this.currentYear) {
                classes += ' selected';
            }
            
            daysHTML += `<button class="${classes}" data-date="${this.currentYear}-${(this.currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}">${day}</button>`;
        }
        
        calendarDays.innerHTML = daysHTML;
        
        // Add click events to available days
        calendarDays.querySelectorAll('.calendar-day.available').forEach(day => {
            day.addEventListener('click', (e) => this.selectDate(e));
        });
        
        // Fetch calendar availability for the current month
        this.fetchCalendarAvailability();
    }
    
    // Update time slots to show booked times for selected date
    updateTimeSlots() {
        if (!this.selectedDate) return;
        
        const selectedDateStr = this.selectedDate.toISOString().split('T')[0];
        console.log('Updating time slots for date:', selectedDateStr);
        
        // Find booked slots for the selected date
        const bookedSlotsForDate = this.bookedSlots.filter(slot => slot.date === selectedDateStr);
        console.log('Booked slots for selected date:', bookedSlotsForDate);
        
        // Get all time slot buttons
        const timeSlotButtons = document.querySelectorAll('.time-slot');
        
        timeSlotButtons.forEach(button => {
            const timeValue = button.getAttribute('data-time');
            
            // Check if this time slot is booked
            const isBooked = bookedSlotsForDate.some(slot => {
                // Convert slot time to 24-hour format for comparison
                const slotTime = this.convertTo24Hour(slot.time);
                console.log(`Comparing slot time '${slot.time}' (converted: '${slotTime}') with time value '${timeValue}'`);
                return slotTime === timeValue;
            });
            
            console.log(`Time slot ${timeValue}: isBooked = ${isBooked}`);
            
            if (isBooked) {
                console.log(`Marking time slot ${timeValue} as booked`);
                button.classList.add('booked');
                button.disabled = true;
                button.innerHTML = button.innerHTML.replace(' (Booked)', '') + ' (Booked)';
                console.log(`Time slot ${timeValue} classes after booking:`, button.className);
                console.log(`Time slot ${timeValue} disabled:`, button.disabled);
            } else {
                console.log(`Time slot ${timeValue} is available`);
                button.classList.remove('booked');
                button.disabled = false;
                button.innerHTML = button.innerHTML.replace(' (Booked)', '');
            }
        });
    }
    
    // Helper method to convert 12-hour time format to 24-hour format
    convertTo24Hour(time12h) {
        const [time, modifier] = time12h.split(' ');
        let [hours, minutes] = time.split(':');
        hours = parseInt(hours, 10);
        
        if (modifier === 'AM' || modifier === 'am') {
            if (hours === 12) {
                hours = 0; // 12 AM = 00:xx
            }
        } else if (modifier === 'PM' || modifier === 'pm') {
            if (hours !== 12) {
                hours += 12; // 1 PM = 13:xx, but 12 PM = 12:xx
            }
        }
        
        return `${hours.toString().padStart(2, '0')}:${minutes}`;
    }
    
    selectDate(e) {
        const dateStr = e.target.getAttribute('data-date');
        if (!dateStr) return;
        
        // Parse date components to avoid timezone issues
        const [year, month, day] = dateStr.split('-').map(Number);
        // Create date in local context (Adelaide timezone)
        this.selectedDate = new Date(year, month - 1, day, 0, 0, 0, 0);
        
        // Remove previous selection
        document.querySelectorAll('.calendar-day.selected').forEach(day => {
            day.classList.remove('selected');
        });
        
        // Add selection to clicked day
        e.target.classList.add('selected');
        
        // Update selected date text
        const selectedDateText = document.getElementById('selectedDateText');
        if (selectedDateText) {
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            selectedDateText.textContent = this.selectedDate.toLocaleDateString('en-AU', options);
        }
        
        // Show time slots
        const timeSlots = document.getElementById('timeSlots');
        if (timeSlots) {
            timeSlots.style.display = 'block';
        }
        
        // Reset time selection
        this.selectedTime = null;
        document.querySelectorAll('.time-slot.selected').forEach(slot => {
            slot.classList.remove('selected');
        });
        
        // Hide booking form
        const bookingForm = document.getElementById('bookingForm');
        if (bookingForm) {
            bookingForm.style.display = 'none';
        }
        
        // Update summary date
        this.updateSummaryDate();
        
        // Update time slots based on booked appointments
        this.updateTimeSlots();
        
        // Validate form after date selection
        if (this.validateForm) {
            this.validateForm();
        }
    }
    
    selectTime(e) {
        if (!this.selectedDate) return;
        
        this.selectedTime = e.target.getAttribute('data-time');
        
        // Remove previous selection
        document.querySelectorAll('.time-slot.selected').forEach(slot => {
            slot.classList.remove('selected');
        });
        
        // Add selection to clicked time
        e.target.classList.add('selected');
        
        // Show booking form
        const bookingForm = document.getElementById('bookingForm');
        if (bookingForm) {
            bookingForm.style.display = 'block';
        }
        
        // Update summary time
        this.updateSummaryTime();
        
        // Validate form after time selection
        if (this.validateForm) {
            this.validateForm();
        }
    }
    
    previousMonth() {
        this.currentMonth--;
        if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        }
        this.renderCalendar();
        this.fetchCalendarAvailability(); // Fetch availability for new month
    }
    
    nextMonth() {
        this.currentMonth++;
        if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        }
        this.renderCalendar();
        this.fetchCalendarAvailability(); // Fetch availability for new month
    }
    
    updateSummaryDate() {
        const summaryDate = document.getElementById('summaryDate');
        if (summaryDate && this.selectedDate) {
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            summaryDate.textContent = this.selectedDate.toLocaleDateString('en-AU', options);
        }
    }
    
    updateSummaryTime() {
        const summaryTime = document.getElementById('summaryTime');
        if (summaryTime && this.selectedTime) {
            const time24 = this.selectedTime;
            const [hours, minutes] = time24.split(':');
            const time12 = new Date(2000, 0, 1, parseInt(hours), parseInt(minutes)).toLocaleTimeString('en-AU', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
            summaryTime.textContent = `${time12} (ACST)`;
        }
    }
    
    updateSummaryType(type) {
        const summaryType = document.getElementById('summaryType');
        if (summaryType) {
            const typeText = type === 'in-person' ? 'In-Person Meeting' : 
                           type === 'video-call' ? 'Video Call' : '';
            summaryType.textContent = typeText;
        }
    }
    
    handleSelectChange(selectElement) {
        if (selectElement.value !== '') {
            selectElement.classList.add('has-value');
        } else {
            selectElement.classList.remove('has-value');
        }
    }
    
    handleMeetingTypeButtons() {
        const meetingTypeButtons = document.querySelectorAll('[data-meeting-type]');
        
        meetingTypeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                
                const meetingType = button.getAttribute('data-meeting-type');
                
                // Scroll to booking calendar
                const bookingSection = document.getElementById('booking-calendar');
                if (bookingSection) {
                    bookingSection.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
                
                // Pre-select meeting type after a short delay to allow scrolling
                setTimeout(() => {
                    this.preselectMeetingType(meetingType);
                }, 800);
            });
        });
    }
    
    preselectMeetingType(meetingType) {
        const meetingTypeSelect = document.getElementById('meetingType');
        if (meetingTypeSelect) {
            meetingTypeSelect.value = meetingType;
            meetingTypeSelect.classList.add('has-value');
            this.updateSummaryType(meetingType);
            
            // Add a subtle highlight effect to show it was pre-selected
            meetingTypeSelect.style.borderColor = 'var(--primary-yellow)';
            meetingTypeSelect.style.boxShadow = '0 0 0 3px rgba(255, 215, 0, 0.2)';
            
            setTimeout(() => {
                meetingTypeSelect.style.borderColor = '';
                meetingTypeSelect.style.boxShadow = '';
            }, 2000);
        }
    }
    
    async handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const appointmentData = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            meetingType: formData.get('meetingType'),
            projectType: formData.get('projectType'),
            description: formData.get('description'),
            date: this.selectedDate.getFullYear() + '-' + 
                  String(this.selectedDate.getMonth() + 1).padStart(2, '0') + '-' + 
                  String(this.selectedDate.getDate()).padStart(2, '0'),
            time: this.selectedTime
        };
        
        try {
            // Show loading state
            const submitBtn = e.target.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Booking...';
            submitBtn.disabled = true;
            
            // Send appointment data to backend API
            const apiUrl = window.location.hostname === 'localhost' ? 
                'http://localhost:3001/api/book-appointment' : 
                '/.netlify/functions/book-appointment';
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(appointmentData)
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                // Show success modal
                this.showSuccessMessage(
                    `🎉 Appointment Confirmed!`,
                    `Thank you ${appointmentData.name}! Your consultation has been successfully booked.\n\n📅 Date: ${result.appointmentDetails.date}\n⏰ Time: ${result.appointmentDetails.time}\n📍 Type: ${result.appointmentDetails.meetingType}${result.meetingLink ? `\n\n🔗 Video Call Link: ${result.meetingLink}` : ''}\n\n📧 You'll receive a confirmation email with all details and calendar invite shortly.\n\nWe look forward to discussing your project!`
                );
                
                // Refresh calendar availability to show the newly booked slot
                await this.fetchCalendarAvailability();
                
                this.resetBooking();
            } else {
                throw new Error(result.message || 'Failed to book appointment');
            }
            
            // Reset button state
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            
        } catch (error) {
            console.error('Error booking appointment:', error);
            
            // Show error modal
            this.showErrorMessage(
                'Booking Failed',
                `Sorry, we couldn't book your appointment at this time. Please try again or contact us directly at admin@vssglobal.biz.\n\nError: ${error.message}`
            );
            
            // Reset button state
            const submitBtn = e.target.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.textContent = 'Book Appointment';
                submitBtn.disabled = false;
            }
        }
    }
    
    resetBooking() {
        this.selectedDate = null;
        this.selectedTime = null;
        
        // Reset UI
        document.querySelectorAll('.calendar-day.selected').forEach(day => {
            day.classList.remove('selected');
        });
        
        document.querySelectorAll('.time-slot.selected').forEach(slot => {
            slot.classList.remove('selected');
        });
        
        const selectedDateText = document.getElementById('selectedDateText');
        if (selectedDateText) {
            selectedDateText.textContent = 'Please choose a date from the calendar';
        }
        
        const timeSlots = document.getElementById('timeSlots');
        if (timeSlots) {
            timeSlots.style.display = 'none';
        }
        
        const bookingForm = document.getElementById('bookingForm');
        if (bookingForm) {
            bookingForm.style.display = 'none';
            const form = bookingForm.querySelector('form');
            if (form) form.reset();
        }
    }
    
    showSuccessMessage(title, message) {
        this.showModal(title, message, 'success');
    }
    
    showErrorMessage(title, message) {
        this.showModal(title, message, 'error');
    }
    
    showModal(title, message, type = 'success') {
        // Remove existing modal if any
        const existingModal = document.querySelector('.booking-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Create modal HTML
        const modal = document.createElement('div');
        modal.className = 'booking-modal';
        modal.innerHTML = `
            <div class="booking-modal-overlay">
                <div class="booking-modal-content ${type}">
                    <div class="booking-modal-header">
                        <h3>${title}</h3>
                        <button class="booking-modal-close">&times;</button>
                    </div>
                    <div class="booking-modal-body">
                        <p>${message.replace(/\n/g, '<br>')}</p>
                    </div>
                    <div class="booking-modal-footer">
                        <button class="btn booking-modal-ok">OK</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal styles
        const style = document.createElement('style');
        style.textContent = `
            .booking-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .booking-modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                animation: fadeIn 0.3s ease;
            }
            
            .booking-modal-content {
                background: white;
                border-radius: 12px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
                max-width: 500px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                animation: slideIn 0.3s ease;
            }
            
            .booking-modal-content.success {
                border-top: 4px solid #28a745;
            }
            
            .booking-modal-content.error {
                border-top: 4px solid #dc3545;
            }
            
            .booking-modal-header {
                padding: 20px 20px 0 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .booking-modal-header h3 {
                margin: 0;
                color: #333;
                font-size: 1.5rem;
            }
            
            .booking-modal-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #999;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .booking-modal-close:hover {
                color: #333;
            }
            
            .booking-modal-body {
                padding: 20px;
            }
            
            .booking-modal-body p {
                margin: 0;
                line-height: 1.6;
                color: #555;
                white-space: pre-line;
            }
            
            .booking-modal-footer {
                padding: 0 20px 20px 20px;
                text-align: right;
            }
            
            .booking-modal-ok {
                background: var(--primary-yellow, #FFD700);
                color: #000;
                border: none;
                padding: 12px 24px;
                border-radius: 6px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .booking-modal-ok:hover {
                background: #E6C200;
                transform: translateY(-2px);
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideIn {
                from { 
                    opacity: 0;
                    transform: translateY(-50px) scale(0.9);
                }
                to { 
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
        `;
        
        // Add to document
        document.head.appendChild(style);
        document.body.appendChild(modal);
        
        // Add event listeners
        const closeBtn = modal.querySelector('.booking-modal-close');
        const okBtn = modal.querySelector('.booking-modal-ok');
        const overlay = modal.querySelector('.booking-modal-overlay');
        
        const closeModal = () => {
            modal.remove();
            style.remove();
        };
        
        closeBtn.addEventListener('click', closeModal);
        okBtn.addEventListener('click', closeModal);
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeModal();
            }
        });
        
        // Close on Escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        
        document.addEventListener('keydown', handleEscape);
    }
}

// Contact Form Handler
class ContactForm {
    constructor() {
        console.log('ContactForm constructor called');
        this.form = document.querySelector('.contact-form');
        this.submitBtn = this.form?.querySelector('button[type="submit"]');
        
        console.log('Form found:', this.form);
        console.log('Submit button found:', this.submitBtn);
        
        if (this.form) {
            this.init();
        } else {
            console.log('No contact form found on this page');
        }
    }
    
    init() {
        console.log('ContactForm init called');
        this.setupFormValidation();
        
        // Add form submit event listener
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        console.log('Form submit event listener added');
        
        // Also add direct button click handler as backup
        if (this.submitBtn) {
            this.submitBtn.addEventListener('click', (e) => {
                console.log('Button clicked directly!');
                e.preventDefault();
                this.handleSubmit(e);
            });
            console.log('Button click event listener added');
        }
    }
    
    setupFormValidation() {
        console.log('Setting up form validation');
        const requiredFields = ['firstName', 'lastName', 'email', 'service', 'message'];
        const inputs = this.form.querySelectorAll('input, select, textarea');
        
        console.log('Required fields:', requiredFields);
        console.log('Found inputs:', inputs.length);
        
        const validateForm = () => {
            let isValid = true;
            console.log('Validating form...');
            
            // Check required fields
            for (const fieldName of requiredFields) {
                const field = this.form.querySelector(`[name="${fieldName}"]`);
                console.log(`Field ${fieldName}:`, field, field?.value);
                if (!field || !field.value.trim()) {
                    isValid = false;
                    break;
                }
            }
            
            console.log('Form is valid:', isValid);
            
            // Update submit button state
            if (this.submitBtn) {
                if (isValid) {
                    this.submitBtn.classList.remove('disabled');
                    this.submitBtn.classList.add('enabled');
                    this.submitBtn.disabled = false;
                    console.log('Button enabled');
                } else {
                    this.submitBtn.classList.remove('enabled');
                    this.submitBtn.classList.add('disabled');
                    this.submitBtn.disabled = true;
                    console.log('Button disabled');
                }
            }
        };
        
        // Add event listeners to all form inputs
        inputs.forEach(input => {
            input.addEventListener('input', validateForm);
            input.addEventListener('change', validateForm);
        });
        
        // Initial validation
        validateForm();
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        console.log('Form submitted!');
        
        if (!this.submitBtn) {
            console.log('No submit button found');
            return;
        }
        
        try {
            // Update button state
            const originalText = this.submitBtn.textContent;
            this.submitBtn.textContent = '📤 Sending Message...';
            this.submitBtn.disabled = true;
            
            // Collect form data
            const formData = new FormData(this.form);
            const contactData = {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                company: formData.get('company'),
                service: formData.get('service'),
                budget: formData.get('budget'),
                timeline: formData.get('timeline'),
                message: formData.get('message'),
                newsletter: formData.get('newsletter') === 'on'
            };
            
            // Send to backend API
            const apiUrl = window.location.hostname === 'localhost' ? 
                'http://localhost:3001/api/contact' : 
                '/.netlify/functions/contact';
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(contactData)
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                // Show success message
                this.showSuccessMessage(
                    '🎉 Message Sent Successfully!',
                    `Thank you ${result.contactDetails.name}! We've received your inquiry about ${result.contactDetails.service}.\n\n✅ Confirmation email sent to ${result.contactDetails.email}\n⏰ We'll contact you within 24 hours\n📋 Our team is already reviewing your project details\n\nWe're excited to discuss how VSS Global can help bring your vision to life!`
                );
                
                // Reset form
                this.form.reset();
                this.setupFormValidation(); // Re-run validation to disable button
            } else {
                throw new Error(result.message || 'Failed to send message');
            }
            
            // Reset button state
            this.submitBtn.textContent = originalText;
            this.submitBtn.disabled = false;
            
        } catch (error) {
            console.error('Error sending contact form:', error);
            
            // Show error message
            this.showErrorMessage(
                '❌ Message Failed to Send',
                `Sorry, we couldn't send your message at this time. Please try again or contact us directly at admin@vssglobal.biz.\n\nError: ${error.message}`
            );
            
            // Reset button state
            this.submitBtn.textContent = '🚀 Let\'s Start Your Project - We\'ll Contact You Within 24 Hours!';
            this.submitBtn.disabled = false;
        }
    }
    
    showSuccessMessage(title, message) {
        this.showModal(title, message, 'success');
    }
    
    showErrorMessage(title, message) {
        this.showModal(title, message, 'error');
    }
    
    showModal(title, message, type = 'success') {
        // Remove existing modal if any
        const existingModal = document.querySelector('.contact-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Create modal HTML
        const modal = document.createElement('div');
        modal.className = 'contact-modal';
        modal.innerHTML = `
            <div class="contact-modal-overlay">
                <div class="contact-modal-content ${type}">
                    <div class="contact-modal-header">
                        <h3>${title}</h3>
                        <button class="contact-modal-close">&times;</button>
                    </div>
                    <div class="contact-modal-body">
                        <p>${message.replace(/\n/g, '<br>')}</p>
                    </div>
                    <div class="contact-modal-footer">
                        <button class="btn contact-modal-ok">OK</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal styles
        const style = document.createElement('style');
        style.textContent = `
            .contact-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .contact-modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                animation: fadeIn 0.3s ease;
            }
            
            .contact-modal-content {
                background: white;
                border-radius: 12px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
                max-width: 500px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                animation: slideIn 0.3s ease;
            }
            
            .contact-modal-content.success {
                border-top: 4px solid #28a745;
            }
            
            .contact-modal-content.error {
                border-top: 4px solid #dc3545;
            }
            
            .contact-modal-header {
                padding: 20px 20px 0 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .contact-modal-header h3 {
                margin: 0;
                color: #333;
                font-size: 1.5rem;
            }
            
            .contact-modal-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #999;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .contact-modal-close:hover {
                color: #333;
            }
            
            .contact-modal-body {
                padding: 20px;
                line-height: 1.6;
            }
            
            .contact-modal-body p {
                margin: 0;
                color: #555;
            }
            
            .contact-modal-footer {
                padding: 0 20px 20px 20px;
                text-align: right;
            }
            
            .contact-modal-ok {
                background: linear-gradient(135deg, #FFD700, #FFA500);
                color: #333;
                border: none;
                padding: 10px 20px;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.3s ease;
            }
            
            .contact-modal-ok:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(255, 215, 0, 0.4);
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateY(-50px) scale(0.95);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(modal);
        
        // Add event listeners
        const closeBtn = modal.querySelector('.contact-modal-close');
        const okBtn = modal.querySelector('.contact-modal-ok');
        const overlay = modal.querySelector('.contact-modal-overlay');
        
        const closeModal = () => {
            modal.remove();
            style.remove();
        };
        
        closeBtn.addEventListener('click', closeModal);
        okBtn.addEventListener('click', closeModal);
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeModal();
            }
        });
        
        // Close on Escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        
        document.addEventListener('keydown', handleEscape);
    }
}

// Newsletter Subscription Class
class NewsletterSubscription {
    constructor() {
        this.form = document.getElementById('newsletterForm');
        this.emailInput = document.getElementById('newsletterEmail');
        this.messageDiv = document.getElementById('newsletterMessage');
        this.submitBtn = this.form?.querySelector('button[type="submit"]');
        
        if (this.form) {
            this.init();
        }
    }
    
    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Add real-time email validation
        this.emailInput.addEventListener('input', () => this.validateEmail());
        this.emailInput.addEventListener('blur', () => this.validateEmail());
    }
    
    validateEmail() {
        const email = this.emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (email && !emailRegex.test(email)) {
            this.emailInput.style.borderColor = '#dc3545';
            this.showMessage('Please enter a valid email address', 'error');
            return false;
        } else {
            this.emailInput.style.borderColor = '';
            this.hideMessage();
            return true;
        }
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        const email = this.emailInput.value.trim();
        
        // Validate email
        if (!email) {
            this.showMessage('Please enter your email address', 'error');
            this.emailInput.focus();
            return;
        }
        
        if (!this.validateEmail()) {
            this.emailInput.focus();
            return;
        }
        
        // Update button state
        const originalText = this.submitBtn.textContent;
        this.submitBtn.textContent = 'Subscribing...';
        this.submitBtn.disabled = true;
        
        try {
            // Use different endpoints for local development vs production
            const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            const apiEndpoint = isLocal ? 'http://localhost:3001/api/newsletter' : '/.netlify/functions/newsletter-subscription';
            
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showSuccessMessage(
                    '🎉 Welcome to VSS Global Newsletter!',
                    `Thank you for subscribing! We've sent a welcome email to ${email} with all the details.\n\n📧 Check your inbox (and spam folder) for your welcome message\n🚀 You'll receive valuable insights, tips, and industry trends\n💡 Be the first to know about our latest projects and updates\n\nWe're excited to have you in our digital community!`
                );
                
                // Reset form
                this.form.reset();
                this.hideMessage();
                
            } else {
                this.showMessage(result.message || 'Subscription failed. Please try again.', 'error');
            }
            
        } catch (error) {
            console.error('Newsletter subscription error:', error);
            this.showErrorMessage(
                '❌ Subscription Failed',
                `Sorry, we couldn't process your subscription at this time. Please try again or contact us directly at admin@vssglobal.biz.\n\nError: ${error.message}`
            );
        } finally {
            // Reset button state
            this.submitBtn.textContent = originalText;
            this.submitBtn.disabled = false;
        }
    }
    
    showMessage(message, type = 'info') {
        this.messageDiv.textContent = message;
        this.messageDiv.className = `form-message ${type}`;
        this.messageDiv.style.display = 'block';
        
        // Auto-hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => this.hideMessage(), 5000);
        }
    }
    
    hideMessage() {
        this.messageDiv.style.display = 'none';
    }
    
    showSuccessMessage(title, message) {
        this.showModal(title, message, 'success');
    }
    
    showErrorMessage(title, message) {
        this.showModal(title, message, 'error');
    }
    
    showModal(title, message, type = 'success') {
        // Remove existing modal if any
        const existingModal = document.querySelector('.newsletter-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Create modal HTML
        const modal = document.createElement('div');
        modal.className = 'newsletter-modal';
        modal.innerHTML = `
            <div class="newsletter-modal-overlay"></div>
            <div class="newsletter-modal-content ${type}">
                <div class="newsletter-modal-header">
                    <h3>${title}</h3>
                    <button class="newsletter-modal-close" aria-label="Close">&times;</button>
                </div>
                <div class="newsletter-modal-body">
                    <p style="white-space: pre-line; line-height: 1.6;">${message}</p>
                </div>
                <div class="newsletter-modal-footer">
                    <button class="newsletter-modal-ok btn btn-primary">Got it!</button>
                </div>
            </div>
        `;
        
        // Add modal styles
        const style = document.createElement('style');
        style.textContent = `
            .newsletter-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .newsletter-modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(5px);
                animation: fadeIn 0.3s ease;
            }
            
            .newsletter-modal-content {
                background: white;
                border-radius: 12px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
                max-width: 500px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                animation: slideIn 0.3s ease;
                position: relative;
                z-index: 1;
            }
            
            .newsletter-modal-content.success {
                border-top: 4px solid #28a745;
            }
            
            .newsletter-modal-content.error {
                border-top: 4px solid #dc3545;
            }
            
            .newsletter-modal-header {
                padding: 20px 20px 0 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .newsletter-modal-header h3 {
                margin: 0;
                color: #333;
                font-size: 1.25rem;
            }
            
            .newsletter-modal-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #666;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.2s ease;
            }
            
            .newsletter-modal-close:hover {
                background: #f0f0f0;
                color: #333;
            }
            
            .newsletter-modal-body {
                padding: 20px;
            }
            
            .newsletter-modal-body p {
                margin: 0;
                color: #555;
                line-height: 1.6;
            }
            
            .newsletter-modal-footer {
                padding: 0 20px 20px 20px;
                text-align: center;
            }
            
            .newsletter-modal-ok {
                padding: 10px 30px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 500;
                transition: all 0.2s ease;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateY(-50px) scale(0.9);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(modal);
        
        // Add event listeners
        const closeBtn = modal.querySelector('.newsletter-modal-close');
        const okBtn = modal.querySelector('.newsletter-modal-ok');
        const overlay = modal.querySelector('.newsletter-modal-overlay');
        
        const closeModal = () => {
            modal.remove();
            style.remove();
        };
        
        closeBtn.addEventListener('click', closeModal);
        okBtn.addEventListener('click', closeModal);
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeModal();
            }
        });
        
        // Close on Escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        
        document.addEventListener('keydown', handleEscape);
    }
}

// Initialize components when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize booking calendar (for index.html)
    if (document.querySelector('.booking-calendar')) {
        new BookingCalendar();
    }
    
    // Initialize contact form (for contact.html)
    if (document.querySelector('.contact-form')) {
        new ContactForm();
    }
    
    // Initialize newsletter subscription (for blog.html)
    if (document.getElementById('newsletterForm')) {
        new NewsletterSubscription();
    }
});