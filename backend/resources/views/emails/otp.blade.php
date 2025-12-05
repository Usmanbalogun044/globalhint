<!DOCTYPE html>
<html>

<head>
    <title>Verification Code</title>
</head>

<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
    <div
        style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h2 style="color: #D4AF37; text-align: center;">GlobalHint Verification</h2>
        <p style="color: #333; font-size: 16px; line-height: 1.5;">Hello,</p>
        <p style="color: #333; font-size: 16px; line-height: 1.5;">Your verification code is:</p>
        <div style="text-align: center; margin: 30px 0;">
            <span
                style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #000; background-color: #f0f0f0; padding: 10px 20px; border-radius: 5px; border: 1px solid #ddd;">{{ $otp }}</span>
        </div>
        <p style="color: #333; font-size: 16px; line-height: 1.5;">This code will expire in 10 minutes.</p>
        <p style="color: #333; font-size: 16px; line-height: 1.5;">If you did not request this code, please ignore this
            email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">&copy; {{ date('Y') }} GlobalHint. All rights
            reserved.</p>
    </div>
</body>

</html>