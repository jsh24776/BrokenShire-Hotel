<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #2d5a3d;
            padding-bottom: 20px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #2d5a3d;
            font-family: Georgia, serif;
        }
        .tagline {
            color: #7a9b6f;
            font-size: 14px;
            margin-top: 5px;
        }
        .content {
            margin-bottom: 30px;
        }
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
            color: #2d5a3d;
        }
        .message {
            color: #555;
            margin-bottom: 20px;
        }
        .cta-button {
            display: inline-block;
            background-color: #2d5a3d;
            color: #ffffff;
            padding: 14px 30px;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
            margin: 30px 0;
            text-align: center;
        }
        .cta-button:hover {
            background-color: #1f3d2a;
        }
        .link-text {
            font-size: 12px;
            color: #999;
            margin-top: 20px;
            word-break: break-all;
        }
        .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
            color: #856404;
        }
        .footer {
            border-top: 1px solid #eee;
            padding-top: 20px;
            font-size: 12px;
            color: #999;
            text-align: center;
        }
        .footer-link {
            color: #2d5a3d;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🏨 Brokenshire Hotel</div>
            <div class="tagline">Experience nature in luxury</div>
        </div>

        <div class="content">
            <div class="greeting">Hello {{ $userName }},</div>
            
            <div class="message">
                We received a request to reset the password for your Brokenshire Hotel account. If you didn't make this request, you can safely ignore this email.
            </div>

            <div style="text-align: center;">
                <a href="{{ $resetUrl }}" class="cta-button">Reset Your Password</a>
            </div>

            <div class="link-text">
                Or copy and paste this link in your browser:<br>
                {{ $resetUrl }}
            </div>

            <div class="warning">
                <strong>⏰ Important:</strong> This password reset link will expire in 24 hours for security reasons. If the link expires, you can request a new one by clicking "Forgot?" on the login page again.
            </div>

            <div class="message">
                If you have any questions or didn't request this reset, please contact our support team.
            </div>

            <div class="message" style="color: #999; font-size: 14px;">
                Best regards,<br>
                <strong>Brokenshire Hotel Team</strong>
            </div>
        </div>

        <div class="footer">
            <p>&copy; 2026 Brokenshire Hotel. All rights reserved.</p>
            <p>
                <a href="https://brokenshire-hotel.local" class="footer-link">Visit our website</a> | 
                <a href="mailto:support@brokenshire-hotel.local" class="footer-link">Contact Support</a>
            </p>
        </div>
    </div>
</body>
</html>
