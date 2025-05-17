const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
    // Set CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };
    
    // Handle OPTIONS request (preflight CORS request)
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 204, // No content
            headers: headers,
            body: ''
        };
    }
    
    // Only allow POST requests for actual operations
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: headers,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
        // Parse request body
        const data = JSON.parse(event.body);
        const {
            to,
            subject,
            bookingId,
            userName,
            serviceType,
            date,
            pickupLocation,
            destinationLocation,
            passengerCount,
            distance,
            totalPrice,
            deposit
        } = data;

        // Validate required fields
        if (!to || !bookingId) {
            return {
                statusCode: 400,
                headers: headers,
                body: JSON.stringify({ error: 'Missing required fields' })
            };
        }

        // Configure Nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER || 'your-email@gmail.com',
                pass: process.env.EMAIL_PASS || 'your-app-password'
            }
        });

        // Create email HTML content
        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <img src="https://sri-lanka-stay-explore.netlify.app/images/ranga_bandara_logo_v2.png" alt="Sri Lanka Stay & Explore" style="max-width: 200px;">
                </div>
                
                <div style="background-color: #4CAF50; color: white; padding: 15px; border-radius: 5px; text-align: center; margin-bottom: 20px;">
                    <h1 style="margin: 0;">Booking Confirmation</h1>
                </div>
                
                <p style="font-size: 16px; line-height: 1.5;">Dear ${userName},</p>
                
                <p style="font-size: 16px; line-height: 1.5;">Thank you for booking with Sri Lanka Stay & Explore. Your booking has been confirmed!</p>
                
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4CAF50;">
                    <p style="margin: 5px 0; font-size: 18px;"><strong>Booking ID:</strong> <span style="color: #4CAF50;">${bookingId}</span></p>
                </div>
                
                <h2 style="color: #4a6fa5; border-bottom: 1px solid #e0e0e0; padding-bottom: 10px;">Journey Details</h2>
                
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; width: 40%;"><strong>Service Type:</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${serviceType}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;"><strong>Date & Time:</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${date}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;"><strong>Pickup Location:</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${pickupLocation}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;"><strong>Destination:</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${destinationLocation}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;"><strong>Passengers:</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${passengerCount}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;"><strong>Distance:</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${distance} km</td>
                    </tr>
                </table>
                
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <table style="width: 100%;">
                        <tr>
                            <td style="padding: 5px;"><strong>Total Price:</strong></td>
                            <td style="padding: 5px; text-align: right;"><strong>$${totalPrice}</strong></td>
                        </tr>
                        <tr>
                            <td style="padding: 5px; color: #d63031;"><strong>Required Deposit (30%):</strong></td>
                            <td style="padding: 5px; text-align: right; color: #d63031;"><strong>$${deposit}</strong></td>
                        </tr>
                    </table>
                </div>
                
                <p style="font-size: 15px; line-height: 1.5; color: #555;">Please note that a 30% deposit is required to secure your booking. The remaining balance will be due on the day of your journey.</p>
                
                <div style="background-color: #e9f7ef; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p style="margin: 5px 0;">Our driver will meet you at the pickup location on the scheduled date and time.</p>
                    <p style="margin: 5px 0;">For any questions or modifications to your booking, please contact us at <a href="mailto:info@srilankastayexplore.com" style="color: #4a6fa5;">info@srilankastayexplore.com</a> or call us at +94 77 760 5921.</p>
                </div>
                
                <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
                    <p>Thank you for choosing Sri Lanka Stay & Explore!</p>
                    <div style="margin-top: 20px;">
                        <a href="https://sri-lanka-stay-explore.netlify.app/" style="color: #4a6fa5; text-decoration: none;">Visit our website</a> |
                        <a href="https://sri-lanka-stay-explore.netlify.app/#contact" style="color: #4a6fa5; text-decoration: none;">Contact Us</a>
                    </div>
                </div>
            </div>
        `;

        // Configure email options
        const mailOptions = {
            from: '"Sri Lanka Stay & Explore" <info@srilankastayexplore.com>',
            to: to,
            subject: subject || 'Your Sri Lanka Stay & Explore Booking Confirmation',
            html: htmlContent
        };

        // Send email
        await transporter.sendMail(mailOptions);

        // Return success response
        return {
            statusCode: 200,
            headers: headers,
            body: JSON.stringify({ success: true, message: 'Confirmation email sent successfully' })
        };
    } catch (error) {
        console.error('Error sending email:', error);
        
        // Return error response
        return {
            statusCode: 500,
            headers: headers,
            body: JSON.stringify({ error: 'Failed to send confirmation email', details: error.message })
        };
    }
}; 