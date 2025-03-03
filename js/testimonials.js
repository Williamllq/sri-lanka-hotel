// Testimonials Slider Functionality
document.addEventListener('DOMContentLoaded', function() {
    const slides = document.querySelectorAll('.testimonial-slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.testimonial-nav.prev');
    const nextBtn = document.querySelector('.testimonial-nav.next');
    
    let currentSlide = 0;
    const slideCount = slides.length;
    
    // Initialize auto-rotation timer
    let slideInterval = setInterval(nextSlide, 5000);
    
    // Function to show a specific slide
    function showSlide(index) {
        // Hide all slides
        slides.forEach(slide => {
            slide.classList.remove('active');
        });
        
        // Remove active class from all dots
        dots.forEach(dot => {
            dot.classList.remove('active');
        });
        
        // Show the selected slide and activate corresponding dot
        slides[index].classList.add('active');
        dots[index].classList.add('active');
        
        // Update current slide index
        currentSlide = index;
    }
    
    // Function to show next slide
    function nextSlide() {
        let nextIndex = (currentSlide + 1) % slideCount;
        showSlide(nextIndex);
    }
    
    // Function to show previous slide
    function prevSlide() {
        let prevIndex = (currentSlide - 1 + slideCount) % slideCount;
        showSlide(prevIndex);
    }
    
    // Add click event listeners to navigation buttons
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            clearInterval(slideInterval); // Reset timer when manually navigating
            prevSlide();
            slideInterval = setInterval(nextSlide, 5000); // Restart timer
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            clearInterval(slideInterval); // Reset timer when manually navigating
            nextSlide();
            slideInterval = setInterval(nextSlide, 5000); // Restart timer
        });
    }
    
    // Add click event listeners to dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', function() {
            clearInterval(slideInterval); // Reset timer when manually navigating
            showSlide(index);
            slideInterval = setInterval(nextSlide, 5000); // Restart timer
        });
    });
    
    // Pause rotation when hovering over testimonials
    const testimonialContainer = document.querySelector('.testimonials-compact');
    if (testimonialContainer) {
        testimonialContainer.addEventListener('mouseenter', function() {
            clearInterval(slideInterval);
        });
        
        testimonialContainer.addEventListener('mouseleave', function() {
            slideInterval = setInterval(nextSlide, 5000);
        });
    }
}); 