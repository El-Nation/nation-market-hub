const crypto = require('crypto');

// Base32 alphabet per RFC 4648
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Decode Base32 string to Buffer
 */
function base32ToBuffer(base32) {
    const clean = base32.toUpperCase().replace(/=+$/, '').replace(/[^A-Z2-7]/g, '');
    let bits = 0;
    let value = 0;
    const output = [];

    for (let i = 0; i < clean.length; i++) {
        value = (value << 5) | BASE32_ALPHABET.indexOf(clean[i]);
        bits += 5;

        if (bits >= 8) {
            output.push((value >>> (bits - 8)) & 255);
            bits -= 8;
        }
    }

    return Buffer.from(output);
}

/**
 * Encode Buffer to Base32 string
 */
function bufferToBase32(buffer) {
    let bits = 0;
    let value = 0;
    let output = '';

    for (let i = 0; i < buffer.length; i++) {
        value = (value << 8) | buffer[i];
        bits += 8;

        while (bits >= 5) {
            output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
            bits -= 5;
        }
    }

    if (bits > 0) {
        output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
    }

    return output;
}

/**
 * Generate random Base32 secret for 2FA TOTP
 */
function generateSecret(length = 20) {
    const bytes = crypto.randomBytes(length);
    return bufferToBase32(bytes).slice(0, 32);
}

/**
 * Generate 6-digit TOTP code for a given secret at timestamp
 */
function generateTOTP(secret, timeStep = 30, timeOffset = 0) {
    const epoch = Math.floor((Date.now() / 1000 + timeOffset) / timeStep);
    const buffer = Buffer.alloc(8);
    buffer.writeBigInt64BE(BigInt(epoch), 0);

    const secretBuf = base32ToBuffer(secret);
    const hmac = crypto.createHmac('sha1', secretBuf).update(buffer).digest();

    const offset = hmac[hmac.length - 1] & 0xf;
    const binary =
        ((hmac[offset] & 0x7f) << 24) |
        ((hmac[offset + 1] & 0xff) << 16) |
        ((hmac[offset + 2] & 0xff) << 8) |
        (hmac[offset + 3] & 0xff);

    const otp = (binary % 1000000).toString();
    return otp.padStart(6, '0');
}

/**
 * Verify user-provided 6-digit TOTP code against secret with +/- 1 period drift
 */
function verifyTOTP(secret, token, window = 1) {
    if (!secret || !token) return false;
    const cleanToken = String(token).trim();
    if (cleanToken.length !== 6 || !/^\d{6}$/.test(cleanToken)) return false;

    for (let errorWindow = -window; errorWindow <= window; errorWindow++) {
        const generated = generateTOTP(secret, 30, errorWindow * 30);
        if (generated === cleanToken) {
            return true;
        }
    }

    return false;
}

/**
 * Generate OTP Auth URI for QR code generation
 */
function getOtpAuthUrl(secret, email, issuer = 'Nation Market Hub') {
    const label = encodeURIComponent(`${issuer}:${email}`);
    const encodedIssuer = encodeURIComponent(issuer);
    return `otpauth://totp/${label}?secret=${secret}&issuer=${encodedIssuer}`;
}

module.exports = {
    generateSecret,
    generateTOTP,
    verifyTOTP,
    getOtpAuthUrl,
};
