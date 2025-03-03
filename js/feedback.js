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
    
    if (feedbackModal && showFeedbackBtn) {
        // Show feedback modal when clicking the button
        showFeedbackBtn.addEventListener('click', function() {
            console.log('Feedback button clicked');
            feedbackModal.classList.add('active');
        });
        
        // Close modal when clicking the close button
        if (closeFeedbackBtn) {
            closeFeedbackBtn.addEventListener('click', function() {
                console.log('Close feedback button clicked');
                feedbackModal.classList.remove('active');
            });
        }
        
        // Close modal when clicking outside the modal content
        feedbackModal.addEventListener('click', function(e) {
            if (e.target === feedbackModal) {
                console.log('Clicked outside feedback modal');
                feedbackModal.classList.remove('active');
            }
        });
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
        });
    }
}); 