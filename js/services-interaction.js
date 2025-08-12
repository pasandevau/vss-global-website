document.addEventListener('DOMContentLoaded', function() {
    // Get all service items and highlight section
    const serviceItems = document.querySelectorAll('.service-featured-item');
    const highlightContent = document.querySelector('.service-highlight-content');
    const highlightImage = document.getElementById('service-highlight-image');
    
    // Service data including content and corresponding images
    const servicesData = {
        'ai': {
            title: 'Artificial Intelligence',
            tag: 'AI Solutions',
            description: 'We create practical AI and IoT solutions that drive operational excellence, seamlessly integrating intelligent systems and connected devices to optimize efficiency and effectiveness across your business. By leveraging advanced analytics and real-time data from IoT networks, we deliver innovative solutions that streamline processes, enhance decision-making, and enable smarter, more connected operations.',
            icon: 'fa-robot',
            image: 'assets/images/ai.png',
            link: 'about.html',
            linkText: 'Know More About Us'
        },
        'mobile': {
            title: 'Mobile Application Development',
            tag: 'Mobile Development',
            description: 'We craft high-performance, user-centric mobile applications for iOS and Android platforms. Our mobile solutions are designed to deliver seamless user experiences, robust functionality, and top-notch performance. From concept to deployment, we ensure your mobile app stands out in the competitive app market while meeting your business objectives.',
            icon: 'fa-mobile-alt',
            image: 'assets/images/mobile.png',
            link: 'mobile-development.html',
            linkText: 'View Mobile Solutions'
        },
        'web': {
            title: 'Full Stack Web Development',
            tag: 'Web Development',
            description: 'Our full-stack web development services create powerful, scalable, and secure web applications. We leverage the latest technologies and frameworks to build responsive, high-performing websites and web applications that drive engagement, conversions, and business growth. From front-end design to back-end development, we\'ve got you covered.',
            icon: 'fa-code',
            image: 'assets/images/fullstack.png',
            link: 'web-development.html',
            linkText: 'Explore Web Solutions'
        },
        'cloud': {
            title: 'Cloud Computing Services',
            tag: 'Cloud Solutions',
            description: 'Transform your business with our comprehensive cloud solutions. We help organizations migrate to the cloud, optimize their cloud infrastructure, and develop cloud-native applications. Our expertise spans across AWS, Azure, and Google Cloud Platform, ensuring you get the most out of cloud computing with enhanced security, scalability, and cost-efficiency.',
            icon: 'fa-cloud',
            image: 'assets/images/cloud.png',
            link: 'cloud-solutions.html',
            linkText: 'Discover Cloud Services'
        }
    };
    
    // Function to update the highlighted service
    function updateHighlightedService(serviceType) {
        const service = servicesData[serviceType];
        if (!service) return;
        
        // Add fade-out class to content
        highlightContent.classList.add('fade-out');
        highlightImage.style.opacity = '0';
        
        // After fade out, update content and fade in
        setTimeout(() => {
            // Update content
            highlightContent.innerHTML = `
                <div class="service-tag">${service.tag}</div>
                <h2>${service.title}</h2>
                <p>${service.description}</p>
                <a href="${service.link}" class="btn btn-primary">${service.linkText}</a>
            `;
            
            // Update image
            highlightImage.innerHTML = `<img src="${service.image}" alt="${service.title}">`;
            
            // Fade in the new content and image
            setTimeout(() => {
                highlightContent.classList.remove('fade-out');
                highlightContent.classList.add('fade-in');
                highlightImage.style.opacity = '1';
                
                // Remove fade-in class after animation completes
                setTimeout(() => {
                    highlightContent.classList.remove('fade-in');
                }, 500);
            }, 50);
        }, 300);
        
        // Update active state of service items
        serviceItems.forEach(item => {
            if (item.dataset.service === serviceType) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
    
    // Add click event listeners to service items
    serviceItems.forEach(item => {
        item.addEventListener('click', function() {
            const serviceType = this.dataset.service;
            updateHighlightedService(serviceType);
        });
        
        // Add hover effect
        item.addEventListener('mouseenter', function() {
            if (!this.classList.contains('active')) {
                this.style.transform = 'translateY(-5px)';
                this.style.boxShadow = '0 15px 30px rgba(0,0,0,0.1)';
            }
        });
        
        item.addEventListener('mouseleave', function() {
            if (!this.classList.contains('active')) {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '0 5px 15px rgba(0,0,0,0.05)';
            }
        });
    });
    
    // Initialize with AI service
    updateHighlightedService('ai');
});
