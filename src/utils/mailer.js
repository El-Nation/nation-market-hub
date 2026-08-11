const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

// Configure SMTP transport using environment variables
const createTransporter = () => {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 465;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
        return null; // Return null if SMTP credentials are not fully configured
    }

    return nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        pool: true,
        maxConnections: 3,
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 15000,
        auth: { user, pass },
        family: 4,
        tls: {
            rejectUnauthorized: false
        }
    });
};

const LOGO_PATH = path.join(__dirname, '../../client/public/logo.png');

const getAttachments = () => {
    if (fs.existsSync(LOGO_PATH)) {
        return [
            {
                filename: 'logo.png',
                path: LOGO_PATH,
                cid: 'logo_nmh@nationmarkethub.com'
            }
        ];
    }
    return [];
};

const getLogoHeaderHtml = () => {
    if (fs.existsSync(LOGO_PATH)) {
        return `<img src="cid:logo_nmh@nationmarkethub.com" alt="Nation Market Hub" style="height: 48px; width: auto; max-width: 220px; display: block; margin: 0 auto 8px auto;" />`;
    }
    return `<h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.5px;">Nation Market <span style="color: #38bdf8;">Hub</span></h1>`;
};

const EMAIL_FOOTER_HTML = `
    <!-- Guaranteed Full-Width Base Email Footer -->
    <tr id="email-footer-row">
        <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 22px 20px; text-align: center;">
            <p style="font-size: 13px; color: #334155; margin: 0 0 6px 0; font-weight: 700;">
                © 2026 Nation Market Hub. All rights reserved.
            </p>
            <p style="font-size: 12px; color: #64748b; margin: 0; font-style: italic; line-height: 1.4;">
                This is an automated service notification from Nation Market Hub. Please do not reply directly to this email.
            </p>
        </td>
    </tr>
`;

const EMAIL_FOOTER_TEXT = `
---
© 2026 Nation Market Hub. All rights reserved.
This is an automated service notification from Nation Market Hub. Please do not reply directly to this email.
`;

/**
 * Send email notification to Service Provider when a new enquiry is received
 */
const sendEnquiryNotificationToProvider = async ({
    providerEmail,
    providerName,
    businessName,
    customerName,
    customerPhone,
    customerEmail,
    location,
    serviceDescription,
}) => {
    const fromAddress = process.env.SMTP_FROM || '"Nation Market Hub" <no-reply@nationmarkethub.com>';
    const subject = `[Nation Market Hub] New Service Request from ${customerName}`;
    const dashboardUrl = process.env.APP_URL || (process.env.NODE_ENV === 'production' ? 'https://nationmarkethub.eghedev.com' : 'http://localhost:5173');

    const textContent = `
Hello ${providerName || businessName || 'Service Provider'},

You have received a new service request on Nation Market Hub!

Customer Details:
- Name: ${customerName}
- Phone: ${customerPhone}
- Email: ${customerEmail || 'Not provided'}
- Location: ${location}

Requested Service Description:
"${serviceDescription}"

Access your Provider Dashboard to manage this request: ${dashboardUrl}
${EMAIL_FOOTER_TEXT}
    `.trim();

    const logoHtml = getLogoHeaderHtml();

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Service Request</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; -webkit-font-smoothing: antialiased;">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 10px;">
            <tr>
                <td align="center">
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08); border: 1px solid #e2e8f0;">
                        
                        <!-- Header Banner -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 26px 20px; text-align: center; border-bottom: 3px solid #0284c7;">
                                ${logoHtml}
                                <span style="display: inline-block; color: #38bdf8; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;">
                                    Service Marketplace Notification
                                </span>
                            </td>
                        </tr>

                        <!-- Content Area -->
                        <tr>
                            <td style="padding: 30px 28px 20px 28px;">
                                <h2 style="color: #0284c7; font-size: 20px; font-weight: 800; margin: 0 0 14px 0;">
                                    🔔 New Service Request
                                </h2>
                                
                                <p style="color: #334155; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
                                    Hello <strong>${providerName || businessName || 'Service Provider'}</strong>,
                                </p>
                                <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
                                    You have received a new service enquiry on <strong>Nation Market Hub</strong>. Below are the customer's contact details and service requirements:
                                </p>

                                <!-- Customer Details Card -->
                                <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin-bottom: 24px;">
                                    <tr>
                                        <td>
                                            <div style="font-size: 12px; font-weight: 800; color: #0284c7; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 6px;">
                                                📋 Customer Contact Details
                                            </div>
                                            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="4" style="font-size: 14px; color: #334155;">
                                                <tr>
                                                    <td width="35%" style="font-weight: 600; color: #64748b; padding: 4px 0;">Full Name:</td>
                                                    <td style="font-weight: 700; color: #0f172a; padding: 4px 0;">${customerName}</td>
                                                </tr>
                                                <tr>
                                                    <td style="font-weight: 600; color: #64748b; padding: 4px 0;">Phone Number:</td>
                                                    <td style="font-weight: 700; color: #0f172a; padding: 4px 0;">${customerPhone}</td>
                                                </tr>
                                                <tr>
                                                    <td style="font-weight: 600; color: #64748b; padding: 4px 0;">Email Address:</td>
                                                    <td style="color: #0284c7; padding: 4px 0;">${customerEmail || 'Not provided'}</td>
                                                </tr>
                                                <tr>
                                                    <td style="font-weight: 600; color: #64748b; padding: 4px 0;">Location:</td>
                                                    <td style="font-weight: 700; color: #0f172a; padding: 4px 0;">📍 ${location}</td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>

                                <!-- Work Description Card -->
                                <div style="margin-bottom: 26px;">
                                    <div style="font-size: 12px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
                                        🛠️ Requested Work Description
                                    </div>
                                    <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-left: 4px solid #0284c7; border-radius: 8px; padding: 16px; color: #0369a1; font-size: 14px; line-height: 1.6; font-style: italic;">
                                        "${serviceDescription}"
                                    </div>
                                </div>

                                <!-- CTA Button -->
                                <div style="text-align: center; margin: 30px 0 20px 0;">
                                    <a href="${dashboardUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: #ffffff; font-weight: 700; font-size: 15px; text-decoration: none; padding: 14px 32px; border-radius: 8px; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.35);">
                                        View Service Request →
                                    </a>
                                </div>
                            </td>
                        </tr>

                        <!-- Always Rendered Base Footer -->
                        ${EMAIL_FOOTER_HTML}
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;

    try {
        const transporter = createTransporter();
        if (!transporter) {
            console.log(`\n📧 [EMAIL FALLBACK / DEV LOG] To Provider (${providerEmail}):\nSubject: ${subject}\n${textContent}\n`);
            return { success: true, mode: 'fallback_log' };
        }

        const info = await transporter.sendMail({
            from: fromAddress,
            to: providerEmail,
            subject,
            text: textContent,
            html: htmlContent,
            attachments: getAttachments(),
        });

        console.log(`📧 [EMAIL SENT] MessageId: ${info.messageId} to ${providerEmail}`);
        return { success: true, messageId: info.messageId };
    } catch (err) {
        console.error('❌ Error sending provider email notification:', err.message);
        console.log(`\n📧 [EMAIL FALLBACK AFTER ERROR] To Provider (${providerEmail}):\nSubject: ${subject}\n${textContent}\n`);
        return { success: false, error: err.message };
    }
};

/**
 * Send status update email notification to Customer when provider updates enquiry status
 */
const sendStatusUpdateNotificationToCustomer = async ({
    customerEmail,
    customerName,
    businessName,
    providerPhone,
    status,
    serviceDescription,
}) => {
    if (!customerEmail) return { success: false, reason: 'no_customer_email' };

    const fromAddress = process.env.SMTP_FROM || '"Nation Market Hub" <no-reply@nationmarkethub.com>';
    const statusText = status.toUpperCase();
    const subject = `[Nation Market Hub] Update on your request with ${businessName || 'Service Provider'}`;
    const dashboardUrl = process.env.APP_URL || (process.env.NODE_ENV === 'production' ? 'https://nationmarkethub.eghedev.com' : 'http://localhost:5173');

    const textContent = `
Hello ${customerName},

Your service request status with ${businessName || 'Service Provider'} has been updated to: ${statusText}.

Provider Phone: ${providerPhone || 'N/A'}
Service Description: "${serviceDescription}"

Log in to your Customer Dashboard on Nation Market Hub to view your request status: ${dashboardUrl}
${EMAIL_FOOTER_TEXT}
    `.trim();

    const logoHtml = getLogoHeaderHtml();

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Request Status Update</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; -webkit-font-smoothing: antialiased;">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 10px;">
            <tr>
                <td align="center">
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08); border: 1px solid #e2e8f0;">
                        
                        <!-- Header Banner -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 26px 20px; text-align: center; border-bottom: 3px solid #0284c7;">
                                ${logoHtml}
                                <span style="display: inline-block; color: #38bdf8; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;">
                                    Service Request Status Update
                                </span>
                            </td>
                        </tr>

                        <!-- Content Area -->
                        <tr>
                            <td style="padding: 30px 28px 20px 28px;">
                                <h2 style="color: #0284c7; font-size: 20px; font-weight: 800; margin: 0 0 14px 0;">
                                    Request Status Update
                                </h2>
                                
                                <p style="color: #334155; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
                                    Hello <strong>${customerName}</strong>,
                                </p>
                                <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
                                    Your service request with <strong>${businessName || 'Service Provider'}</strong> has been updated:
                                </p>

                                <!-- Status Badge Card -->
                                <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 18px; margin-bottom: 24px;">
                                    <tr>
                                        <td>
                                            <p style="margin: 4px 0; font-size: 14px;"><strong>Status:</strong> <span style="color: #166534; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">${statusText}</span></p>
                                            <p style="margin: 4px 0; font-size: 14px; color: #334155;"><strong>Provider Contact:</strong> ${providerPhone || 'N/A'}</p>
                                        </td>
                                    </tr>
                                </table>

                                <!-- Original Request Card -->
                                <div style="margin-bottom: 26px;">
                                    <div style="font-size: 12px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
                                        Original Service Request
                                    </div>
                                    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; color: #475569; font-size: 14px; line-height: 1.6; font-style: italic;">
                                        "${serviceDescription}"
                                    </div>
                                </div>

                                <!-- CTA Button -->
                                <div style="text-align: center; margin: 30px 0 20px 0;">
                                    <a href="${dashboardUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: #ffffff; font-weight: 700; font-size: 15px; text-decoration: none; padding: 14px 32px; border-radius: 8px; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.35);">
                                        Open Customer Dashboard →
                                    </a>
                                </div>
                            </td>
                        </tr>

                        <!-- Always Rendered Base Footer -->
                        ${EMAIL_FOOTER_HTML}
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;

    try {
        const transporter = createTransporter();
        if (!transporter) {
            console.log(`\n📧 [EMAIL FALLBACK / DEV LOG] To Customer (${customerEmail}):\nSubject: ${subject}\n${textContent}\n`);
            return { success: true, mode: 'fallback_log' };
        }

        const info = await transporter.sendMail({
            from: fromAddress,
            to: customerEmail,
            subject,
            text: textContent,
            html: htmlContent,
            attachments: getAttachments(),
        });

        console.log(`📧 [EMAIL SENT] MessageId: ${info.messageId} to customer (${customerEmail})`);
        return { success: true, messageId: info.messageId };
    } catch (err) {
        console.error('❌ Error sending customer email notification:', err.message);
        console.log(`\n📧 [EMAIL FALLBACK AFTER ERROR] To Customer (${customerEmail}):\nSubject: ${subject}\n${textContent}\n`);
        return { success: false, error: err.message };
    }
};

/**
 * Send confirmation email to Customer when they submit a new service request
 */
const sendEnquiryConfirmationToCustomer = async ({
    customerEmail,
    customerName,
    businessName,
    providerName,
    providerPhone,
    location,
    serviceDescription,
}) => {
    if (!customerEmail) return { success: false, reason: 'no_customer_email' };

    const fromAddress = process.env.SMTP_FROM || '"Nation Market Hub" <no-reply@nationmarkethub.com>';
    const subject = `[Nation Market Hub] Service Request Confirmation - ${businessName || providerName || 'Service Provider'}`;
    const dashboardUrl = process.env.APP_URL || (process.env.NODE_ENV === 'production' ? 'https://nationmarkethub.eghedev.com' : 'http://localhost:5173');

    const textContent = `
Hello ${customerName},

Thank you for submitting your service request on Nation Market Hub! We have sent your request details to ${businessName || providerName || 'the Service Provider'}.

Request Details:
- Provider: ${businessName || providerName || 'Service Provider'}
- Provider Contact: ${providerPhone || 'N/A'}
- Your Location: ${location}

Service Description:
"${serviceDescription}"

Log in to your Customer Dashboard to track your request status: ${dashboardUrl}
${EMAIL_FOOTER_TEXT}
    `.trim();

    const logoHtml = getLogoHeaderHtml();

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Service Request Confirmation</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; -webkit-font-smoothing: antialiased;">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 10px;">
            <tr>
                <td align="center">
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08); border: 1px solid #e2e8f0;">
                        
                        <!-- Header Banner -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 26px 20px; text-align: center; border-bottom: 3px solid #0284c7;">
                                ${logoHtml}
                                <span style="display: inline-block; color: #38bdf8; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;">
                                    Service Request Confirmation
                                </span>
                            </td>
                        </tr>

                        <!-- Content Area -->
                        <tr>
                            <td style="padding: 30px 28px 20px 28px;">
                                <h2 style="color: #0284c7; font-size: 20px; font-weight: 800; margin: 0 0 14px 0;">
                                    ✅ Request Received Successfully!
                                </h2>
                                
                                <p style="color: #334155; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
                                    Hello <strong>${customerName}</strong>,
                                </p>
                                <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
                                    Thank you for submitting a service enquiry on <strong>Nation Market Hub</strong>. We have delivered your request details to <strong>${businessName || providerName || 'the Service Provider'}</strong>.
                                </p>

                                <!-- Summary Card -->
                                <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin-bottom: 24px;">
                                    <tr>
                                        <td>
                                            <div style="font-size: 12px; font-weight: 800; color: #0284c7; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 6px;">
                                                📋 Service Request Summary
                                            </div>
                                            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="4" style="font-size: 14px; color: #334155;">
                                                <tr>
                                                    <td width="35%" style="font-weight: 600; color: #64748b; padding: 4px 0;">Service Provider:</td>
                                                    <td style="font-weight: 700; color: #0f172a; padding: 4px 0;">${businessName || providerName || 'Service Provider'}</td>
                                                </tr>
                                                <tr>
                                                    <td style="font-weight: 600; color: #64748b; padding: 4px 0;">Provider Phone:</td>
                                                    <td style="font-weight: 700; color: #0f172a; padding: 4px 0;">${providerPhone || 'N/A'}</td>
                                                </tr>
                                                <tr>
                                                    <td style="font-weight: 600; color: #64748b; padding: 4px 0;">Your Location:</td>
                                                    <td style="font-weight: 700; color: #0f172a; padding: 4px 0;">📍 ${location}</td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>

                                <!-- Work Description Card -->
                                <div style="margin-bottom: 26px;">
                                    <div style="font-size: 12px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
                                        🛠️ Your Submitted Requirements
                                    </div>
                                    <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-left: 4px solid #0284c7; border-radius: 8px; padding: 16px; color: #0369a1; font-size: 14px; line-height: 1.6; font-style: italic;">
                                        "${serviceDescription}"
                                    </div>
                                </div>

                                <!-- CTA Button -->
                                <div style="text-align: center; margin: 30px 0 20px 0;">
                                    <a href="${dashboardUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: #ffffff; font-weight: 700; font-size: 15px; text-decoration: none; padding: 14px 32px; border-radius: 8px; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.35);">
                                        Open Customer Dashboard →
                                    </a>
                                </div>
                            </td>
                        </tr>

                        <!-- Always Rendered Base Footer -->
                        ${EMAIL_FOOTER_HTML}
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;

    try {
        const transporter = createTransporter();
        if (!transporter) {
            console.log(`\n📧 [EMAIL FALLBACK / DEV LOG] To Customer Confirmation (${customerEmail}):\nSubject: ${subject}\n${textContent}\n`);
            return { success: true, mode: 'fallback_log' };
        }

        const info = await transporter.sendMail({
            from: fromAddress,
            to: customerEmail,
            subject,
            text: textContent,
            html: htmlContent,
            attachments: getAttachments(),
        });

        console.log(`📧 [EMAIL SENT] Confirmation messageId: ${info.messageId} to customer (${customerEmail})`);
        return { success: true, messageId: info.messageId };
    } catch (err) {
        console.error('❌ Error sending customer confirmation email:', err.message);
        console.log(`\n📧 [EMAIL FALLBACK AFTER ERROR] To Customer Confirmation (${customerEmail}):\nSubject: ${subject}\n${textContent}\n`);
        return { success: false, error: err.message };
    }
};

/**
 * Send Password Reset email notification to User
 */
const sendPasswordResetEmail = async ({ toEmail, userName, resetUrl, resetToken }) => {
    if (!toEmail) return { success: false, reason: 'no_recipient_email' };

    const fromAddress = process.env.SMTP_FROM || '"Nation Market Hub" <no-reply@nationmarkethub.com>';
    const subject = '[Nation Market Hub] Password Reset Request';

    const textContent = `
Hello ${userName || 'Valued User'},

We received a request to reset your password on Nation Market Hub.

Your Password Reset Token: ${resetToken}

Click the link below or paste it into your browser to reset your password:
${resetUrl}

This link and token will expire in 1 hour. If you did not request a password reset, please ignore this email.

${EMAIL_FOOTER_TEXT}
    `.trim();

    const logoHtml = getLogoHeaderHtml();

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Request</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; -webkit-font-smoothing: antialiased;">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 10px;">
            <tr>
                <td align="center">
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08); border: 1px solid #e2e8f0;">
                        
                        <!-- Header Banner -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 26px 20px; text-align: center; border-bottom: 3px solid #0284c7;">
                                ${logoHtml}
                                <span style="display: inline-block; color: #38bdf8; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;">
                                    Account Security Notification
                                </span>
                            </td>
                        </tr>

                        <!-- Content Area -->
                        <tr>
                            <td style="padding: 30px 28px 20px 28px;">
                                <h2 style="color: #0284c7; font-size: 20px; font-weight: 800; margin: 0 0 14px 0;">
                                    🔒 Password Reset Request
                                </h2>
                                
                                <p style="color: #334155; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
                                    Hello <strong>${userName || 'Valued User'}</strong>,
                                </p>
                                <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
                                    We received a request to reset your password on <strong>Nation Market Hub</strong>. Click the button below or use your secure token to set a new password:
                                </p>

                                <!-- Reset Token Box -->
                                <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px dashed #0284c7; border-radius: 10px; padding: 18px; margin-bottom: 24px; text-align: center;">
                                    <tr>
                                        <td>
                                            <div style="font-size: 12px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">
                                                Your Secure Password Reset Token
                                            </div>
                                            <div style="font-family: monospace; font-size: 16px; font-weight: 800; color: #0284c7; word-break: break-all;">
                                                ${resetToken}
                                            </div>
                                        </td>
                                    </tr>
                                </table>

                                <!-- CTA Button -->
                                <div style="text-align: center; margin: 30px 0 20px 0;">
                                    <a href="${resetUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: #ffffff; font-weight: 700; font-size: 15px; text-decoration: none; padding: 14px 32px; border-radius: 8px; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.35);">
                                        Reset Password Now →
                                    </a>
                                </div>

                                <p style="font-size: 13px; color: #64748b; margin-top: 20px;">
                                    This link and token will expire in <strong>1 hour</strong>. If you did not request a password reset, you can safely ignore this email.
                                </p>
                            </td>
                        </tr>

                        <!-- Always Rendered Base Footer -->
                        ${EMAIL_FOOTER_HTML}
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;

    try {
        const transporter = createTransporter();
        if (!transporter) {
            console.log(`\n📧 [EMAIL FALLBACK / DEV LOG] Password Reset to (${toEmail}):\nSubject: ${subject}\n${textContent}\n`);
            return { success: true, mode: 'fallback_log' };
        }

        const info = await transporter.sendMail({
            from: fromAddress,
            to: toEmail,
            subject,
            text: textContent,
            html: htmlContent,
            attachments: getAttachments(),
        });

        console.log(`📧 [EMAIL SENT] Password reset messageId: ${info.messageId} to (${toEmail})`);
        return { success: true, messageId: info.messageId };
    } catch (err) {
        console.error('❌ Error sending password reset email:', err.message);
        console.log(`\n📧 [EMAIL FALLBACK AFTER ERROR] Password Reset to (${toEmail}):\nSubject: ${subject}\n${textContent}\n`);
        return { success: false, error: err.message };
    }
};

module.exports = {
    sendEnquiryNotificationToProvider,
    sendStatusUpdateNotificationToCustomer,
    sendEnquiryConfirmationToCustomer,
    sendPasswordResetEmail,
};
