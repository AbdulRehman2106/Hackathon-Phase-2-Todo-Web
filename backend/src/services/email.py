"""
Email service for sending password reset emails via Gmail SMTP.

This module provides utilities for:
- Sending HTML emails via Gmail SMTP
- Rendering password reset email templates
- Managing SMTP connection and configuration
"""

import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from pathlib import Path


# SMTP configuration from environment variables
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_USE_TLS = os.getenv("SMTP_USE_TLS", "true").lower() == "true"
EMAIL_FROM = os.getenv("EMAIL_FROM", SMTP_USERNAME)
EMAIL_FROM_NAME = os.getenv("EMAIL_FROM_NAME", "Todo Application")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")


def send_email(to_email: str, subject: str, html_content: str) -> bool:
    """
    Send an HTML email via Gmail SMTP.

    Args:
        to_email: Recipient email address
        subject: Email subject line
        html_content: HTML content of the email

    Returns:
        True if email sent successfully, False otherwise

    Example:
        >>> success = send_email(
        ...     "user@example.com",
        ...     "Password Reset",
        ...     "<h1>Reset your password</h1>"
        ... )
        >>> print(success)
        True
    """
    try:
        # Create message
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = f"{EMAIL_FROM_NAME} <{EMAIL_FROM}>"
        message["To"] = to_email

        # Attach HTML content
        html_part = MIMEText(html_content, "html")
        message.attach(html_part)

        # Connect to SMTP server and send email
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            if SMTP_USE_TLS:
                server.starttls()

            # Login if credentials provided
            if SMTP_USERNAME and SMTP_PASSWORD:
                server.login(SMTP_USERNAME, SMTP_PASSWORD)

            # Send email
            server.send_message(message)

        return True

    except Exception as e:
        print(f"Failed to send email to {to_email}: {str(e)}")
        return False


def render_password_reset_email(reset_link: str, user_email: str) -> str:
    """
    Render the password reset email HTML template.

    Args:
        reset_link: Full URL for password reset
        user_email: User's email address

    Returns:
        Rendered HTML email content

    Example:
        >>> html = render_password_reset_email(
        ...     "http://localhost:3000/reset-password?token=abc123",
        ...     "user@example.com"
        ... )
    """
    # Try to load template from file
    template_path = Path(__file__).parent.parent.parent / "templates" / "password_reset_email.html"

    if template_path.exists():
        with open(template_path, "r", encoding="utf-8") as f:
            template = f.read()
    else:
        # Fallback inline template
        template = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="background-color: #4F46E5; padding: 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Password Reset Request</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                Hello,
                            </p>
                            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                We received a request to reset the password for your account associated with <strong>{{USER_EMAIL}}</strong>.
                            </p>
                            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                                Click the button below to reset your password. This link will expire in 15 minutes.
                            </p>
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <a href="{{RESET_LINK}}" style="display: inline-block; background-color: #4F46E5; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-size: 16px; font-weight: bold;">Reset Password</a>
                                    </td>
                                </tr>
                            </table>
                            <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                                If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
                            </p>
                            <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                                If the button doesn't work, copy and paste this link into your browser:
                            </p>
                            <p style="color: #4F46E5; font-size: 14px; word-break: break-all; margin: 10px 0 0 0;">
                                {{RESET_LINK}}
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #f8f8f8; padding: 20px 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                            <p style="color: #999999; font-size: 12px; margin: 0;">
                                © 2026 Todo Application. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
"""

    # Replace placeholders
    html = template.replace("{{RESET_LINK}}", reset_link)
    html = html.replace("{{USER_EMAIL}}", user_email)

    return html


def send_password_reset_email(to_email: str, reset_token: str) -> bool:
    """
    Send a password reset email to the user.

    Args:
        to_email: User's email address
        reset_token: Password reset token

    Returns:
        True if email sent successfully, False otherwise

    Example:
        >>> success = send_password_reset_email("user@example.com", "abc123def456")
        >>> print(success)
        True
    """
    # Construct reset link
    reset_link = f"{FRONTEND_URL}/reset-password?token={reset_token}"

    # Render email HTML
    html_content = render_password_reset_email(reset_link, to_email)

    # Send email
    return send_email(
        to_email=to_email,
        subject="Reset Your Password - Todo Application",
        html_content=html_content
    )
