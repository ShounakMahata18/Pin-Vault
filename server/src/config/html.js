export const getVerifyEmailHtml = ({ email, token }) => {
  const appName = process.env.APP_NAME || "Authentication Service";
  const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  const verifyUrl = `${baseUrl.replace(/\/+$/, "")}/token/${encodeURIComponent(token)}`;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta name="x-apple-disable-message-reformatting" />
  <title>${appName} Verify Your Account</title>
</head>

<body style="margin:0;padding:0;background:#f6f7fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol',sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f7fb;padding:24px 0;">
    <tr>
      <td align="center">

        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e9ecf3;">

          <!-- Header -->
          <tr>
            <td style="background:#111827;color:#ffffff;text-align:center;padding:18px 24px;font-weight:700;font-size:16px;">
              ${appName}
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">

              <h1 style="margin:0 0 12px 0;font-size:22px;line-height:1.3;color:#111;font-weight:700;">
                Verify your account
              </h1>

              <p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;color:#444;">
                Thanks for registering with ${appName}.
              </p>

              <p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;color:#444;">
                Please confirm your email address: <strong>${email}</strong>
              </p>

              <p style="margin:0 0 20px 0;font-size:15px;line-height:1.6;color:#444;">
                Click the button below to verify your account:
              </p>

              <!-- Button -->
              <table cellpadding="0" cellspacing="0" style="margin:16px 0 20px 0;">
                <tr>
                  <td align="center">
                    <a href="${verifyUrl}"
                       target="_blank"
                       rel="noopener"
                       style="background:#111827;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:600;font-size:14px;display:inline-block;">
                       Verify Account
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback link -->
              <p style="margin:0 0 12px 0;font-size:14px;color:#555;">
                If the button doesn’t work, copy and paste this link into your browser:
              </p>

              <p style="margin:0 0 16px 0;font-size:14px;">
                <a href="${verifyUrl}" target="_blank" rel="noopener" style="color:#111827;text-decoration:underline;word-break:break-all;">
                  ${verifyUrl}
                </a>
              </p>

              <p style="margin:0 0 12px 0;font-size:14px;color:#555;">
                This link will expire shortly for security reasons.
              </p>

              <p style="margin:0;font-size:14px;color:#555;">
                If this wasn’t you, you can safely ignore this email.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="text-align:center;color:#6b7280;font-size:12px;padding:16px 24px;">
              © ${new Date().getFullYear()} ${appName}. All rights reserved.
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
};

export const getOtpHtml = ({ email, otp }) => {
  const appName = process.env.APP_NAME || "Authentication App";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta name="x-apple-disable-message-reformatting" />
  <title>${appName} Verification Code</title>
</head>

<body style="margin:0;padding:0;background:#f6f7fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol',sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f7fb;padding:24px 0;">
    <tr>
      <td align="center">

        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e9ecf3;">

          <!-- Header -->
          <tr>
            <td style="background:#111827;color:#ffffff;text-align:center;padding:18px 24px;font-weight:700;font-size:16px;">
              ${appName}
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">

              <h1 style="margin:0 0 12px 0;font-size:22px;line-height:1.3;color:#111;font-weight:700;">
                Verify your email
              </h1>

              <p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;color:#444;">
                Use the verification code below to complete your sign-in.
              </p>

              <p style="margin:0 0 16px 0;font-size:15px;color:#444;">
                Email: <strong>${email}</strong>
              </p>

              <!-- OTP Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
                <tr>
                  <td align="center">
                    <div style="display:inline-block;background:#f3f4f6;border:1px solid #e5e7eb;border-radius:10px;padding:14px 18px;font-size:30px;letter-spacing:8px;font-weight:700;color:#111;">
                      ${otp}
                    </div>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 12px 0;font-size:14px;color:#555;">
                This code will expire in <strong>5 minutes</strong>.
              </p>

              <p style="margin:0;font-size:14px;color:#555;">
                If this wasn’t you, you can safely ignore this email.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="text-align:center;color:#6b7280;font-size:12px;padding:16px 24px;">
              © ${new Date().getFullYear()} ${appName}. All rights reserved.
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
};

export const getResetPasswordHtml = ({ email, token }) => {
  const appName = process.env.APP_NAME || "Authentication App";
  const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const resetUrl = `${baseUrl.replace(/\/+$/, "")}/verify-reset-password/${encodeURIComponent(token)}`;

  return `<!doctype html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="x-apple-disable-message-reformatting" />
        <title>${appName} Reset Your Password</title>
        <style>
            html, body { margin: 0; padding: 0; }
            body {
                background: #f6f7fb;
                color: #111;
                -webkit-text-size-adjust: 100%;
                -ms-text-size-adjust: 100%;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            }
            table { border-collapse: collapse; }
            img {
                border: 0;
                display: block;
                max-width: 100%;
                height: auto;
            }
            .wrapper { width: 100%; background: #f6f7fb; }
            .container {
                width: 600px;
                max-width: 600px;
                background: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                border: 1px solid #e9ecf3;
            }
            .p-24 { padding: 24px; }
            .p-32 { padding: 32px; }
            .header {
                background: #111827;
                padding: 18px 24px;
                text-align: center;
            }
            .brand {
                color: #ffffff;
                font-weight: 700;
                font-size: 16px;
            }
            .title {
                margin: 0 0 12px 0;
                font-size: 22px;
                line-height: 1.3;
                color: #111;
                font-weight: 700;
            }
            .text {
                margin: 0 0 16px 0;
                font-size: 15px;
                line-height: 1.6;
                color: #444;
            }
            .muted {
                color: #555;
                font-size: 14px;
                line-height: 1.6;
                margin: 0 0 12px 0;
            }
            .btn {
                display: inline-block;
                background: #111827;
                color: #ffffff !important;
                text-decoration: none;
                padding: 12px 18px;
                border-radius: 8px;
                font-weight: 600;
                font-size: 14px;
            }
            .footer {
                text-align: center;
                color: #6b7280;
                font-size: 12px;
                line-height: 1.6;
                padding: 16px 24px 0 24px;
            }
            .link {
                color: #111827;
                text-decoration: underline;
                word-break: break-all;
            }
            @media only screen and (max-width: 600px) {
                .container { width: 100% !important; }
                .p-32 { padding: 24px !important; }
            }
        </style>
    </head>
    <body>
        <table class="wrapper" width="100%">
            <tr>
                <td align="center" class="p-24">
                    <table class="container">
                        <!-- Header -->
                        <tr>
                            <td class="header">
                                <span class="brand">${appName}</span>
                            </td>
                        </tr>

                        <!-- Body -->
                        <tr>
                            <td class="p-32">
                                <h1 class="title">Reset your password</h1>

                                <p class="text">
                                    We received a request to reset the password for your account (<strong>${email}</strong>).
                                </p>

                                <p class="text">
                                    Click the button below to set a new password:
                                </p>

                                <!-- Button -->
                                <table style="margin: 16px 0 20px 0">
                                    <tr>
                                        <td align="center">
                                            <a class="btn" href="${resetUrl}" target="_blank" rel="noopener">
                                                Reset Password
                                            </a>
                                        </td>
                                    </tr>
                                </table>

                                <p class="muted">
                                    If the button doesn’t work, copy and paste this link into your browser:
                                </p>

                                <p class="muted">
                                    <a class="link" href="${resetUrl}" target="_blank" rel="noopener">
                                        ${resetUrl}
                                    </a>
                                </p>

                                <p class="muted">
                                    This link will expire shortly for security reasons.
                                </p>

                                <p class="muted">
                                    If you didn’t request this, you can safely ignore this email.
                                </p>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td class="footer">
                                © ${new Date().getFullYear()} ${appName}. All rights reserved.
                            </td>
                        </tr>
                        <tr>
                            <td height="16"></td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
</html>`;
};

export const getVerifyOtpHtml = ({ email, code }) => {
  const appName = process.env.APP_NAME || "Pin Vault";

  return `<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>${appName} Verification Code</title>
    <style>
        html, body { margin: 0; padding: 0; }
        body {
            background: #f6f7fb;
            color: #111;
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        table { border-collapse: collapse; }
        .wrapper { width: 100%; background: #f6f7fb; }
        .container {
            width: 600px;
            max-width: 600px;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid #e9ecf3;
        }
        .p-24 { padding: 24px; }
        .p-32 { padding: 32px; }
        .header {
            background: #111827;
            padding: 18px 24px;
            text-align: center;
        }
        .brand {
            color: #ffffff;
            font-weight: 700;
            font-size: 16px;
        }
        .title {
            margin: 0 0 12px 0;
            font-size: 22px;
            line-height: 1.3;
            color: #111;
            font-weight: 700;
        }
        .text {
            margin: 0 0 16px 0;
            font-size: 15px;
            line-height: 1.6;
            color: #444;
        }
        .otp-box {
            margin: 24px 0;
            text-align: center;
        }
        .otp {
            display: inline-block;
            background: #111827;
            color: #ffffff;
            font-size: 32px;
            font-weight: 700;
            letter-spacing: 8px;
            padding: 14px 24px;
            border-radius: 10px;
        }
        .muted {
            color: #555;
            font-size: 14px;
            line-height: 1.6;
            margin: 0 0 12px 0;
        }
        .footer {
            text-align: center;
            color: #6b7280;
            font-size: 12px;
            line-height: 1.6;
            padding: 16px 24px 0 24px;
        }
        @media only screen and (max-width: 600px) {
            .container { width: 100% !important; }
            .p-32 { padding: 24px !important; }
            .otp {
                font-size: 26px;
                letter-spacing: 5px;
            }
        }
    </style>
</head>
<body>
    <table class="wrapper" width="100%">
        <tr>
            <td align="center" class="p-24">
                <table class="container">
                    <tr>
                        <td class="header">
                            <span class="brand">${appName}</span>
                        </td>
                    </tr>

                    <tr>
                        <td class="p-32">
                            <h1 class="title">Verify Your Email</h1>

                            <p class="text">
                                Hello,
                            </p>

                            <p class="text">
                                We received a request to verify your account associated with
                                <strong>${email}</strong>.
                            </p>

                            <p class="text">
                                Use the verification code below:
                            </p>

                            <div class="otp-box">
                                <span class="otp">${code}</span>
                            </div>

                            <p class="muted">
                                This code will expire shortly for security reasons.
                            </p>

                            <p class="muted">
                                If you didn't request this code, you can safely ignore this email.
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td class="footer">
                            © ${new Date().getFullYear()} ${appName}. All rights reserved.
                        </td>
                    </tr>
                    <tr>
                        <td height="16"></td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
};