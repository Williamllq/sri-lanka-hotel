// Feedback functionality
document.addEventListener('DOMContentLoaded', function() {
    // Feedback modal
    const feedbackModal = document.getElementById('feedbackModal');
    const showFeedbackBtn = document.getElementById('showFeedback');
    const closeFeedbackBtn = feedbackModal ? feedbackModal.querySelector('.close-modal') : null;
    
    console.log('Feedback elements:', { 
        feedbackModal: feedbackModal ? 'Found' : 'Not found', 
        showFeedbackBtn: showFeedbackBtn ? 'Found' : 'Not found',
        closeFeedbackBtn: closeFeedbackBtn ? 'Found' : 'Not found'
    });
    
    // Fix any class issues on the feedback modal
    if (feedbackModal) {
        // Make sure we're using the right class for the modal
        if (feedbackModal.classList.contains('modal') && !feedbackModal.classList.contains('map-modal')) {
            console.log('Fixing feedback modal classes: changing from modal to map-modal');
            feedbackModal.classList.remove('modal');
            feedbackModal.classList.add('map-modal');
        }
        
        // Make sure it's initially hidden
        if (feedbackModal.classList.contains('active')) {
            console.log('Removing active class from feedback modal');
            feedbackModal.classList.remove('active');
        }
        
        // Force hide with inline style until CSS loads
        feedbackModal.style.display = 'none';
    }
    
    if (feedbackModal && showFeedbackBtn) {
        // Show feedback modal when clicking the button
        showFeedbackBtn.addEventListener('click', function() {
            console.log('Feedback button clicked');
            
            // Force hide any visible share your experience section
            feedbackModal.style.display = ''; // Remove inline style
            
            // Add appropriate classes
            feedbackModal.classList.add('map-modal');
            feedbackModal.classList.add('active');
            
            // Force display flex if needed
            setTimeout(() => {
                const style = window.getComputedStyle(feedbackModal);
                if (style.display !== 'flex') {
                    console.log('Forcing display:flex on feedback modal');
                    feedbackModal.style.display = 'flex';
                }
            }, 50);
        });
        
        // Close modal when clicking the close button
        if (closeFeedbackBtn) {
            closeFeedbackBtn.addEventListener('click', function() {
                console.log('Close feedback button clicked');
                feedbackModal.classList.remove('active');
                // Force hide if needed
                setTimeout(() => {
                    if (feedbackModal.classList.contains('active')) {
                        feedbackModal.classList.remove('active');
                    }
                    feedbackModal.style.display = 'none';
                }, 50);
            });
        }
        
        // Close modal when clicking outside the modal content
        feedbackModal.addEventListener('click', function(e) {
            if (e.target === feedbackModal) {
                console.log('Clicked outside feedback modal');
                feedbackModal.classList.remove('active');
                // Force hide if needed
                setTimeout(() => {
                    feedbackModal.style.display = 'none';
                }, 50);
            }
        });
    } else {
        console.error('Feedback modal or button not found');
    }
    
    // Handle feedback form submission
    const feedbackForm = document.getElementById('feedbackForm');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Feedback form submitted');
            
            // Get form values
            const name = document.getElementById('feedbackName').value;
            const country = document.getElementById('feedbackCountry').value;
            const rating = document.querySelector('input[name="rating"]:checked')?.value || 5;
            const feedback = document.getElementById('feedbackText').value;
            
            // In a real app, you would send this data to a server
            console.log('Feedback data:', { name, country, rating, feedback });
            
            // Show success message
            alert('Thank you for your feedback!');
            
            // Reset form and close modal
            feedbackForm.reset();
            feedbackModal.classList.remove('active');
            
            // Force hide
            setTimeout(() => {
                feedbackModal.style.display = 'none';
            }, 50);
        });
    } else {
        console.error('Feedback form not found');
    }
}); 