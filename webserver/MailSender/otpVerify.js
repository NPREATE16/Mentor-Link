import sendgrid from "@sendgrid/mail";
import dotenv from "dotenv"

dotenv.config();

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);
const otpStore = {};

export const setOtp = (email, otp, expire ) => {
  otpStore[email] = { otp, expire };
  console.log("otps", otpStore);
};

export const getOtp = (email) => otpStore[email];

export const deleteOtp = (email) => delete otpStore[email];

export const getOtpCount = () => Object.keys(otpStore).length;

setInterval(() => {
  const now = Date.now();
  for (const [email, data] of Object.entries(otpStore)) {
    if (now > data.expire) delete otpStore[email];
  }
}, 60 * 1000);

export function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendEmailOtp(email, code) {
  const msg = {
    to: email,
    from: process.env.FROM_EMAIL || 'no-reply@mentor-link.hcmut.edu.vn',
    subject: "[MentorLink] Mã xác thực",
    text: `Đây là mã xác thực của bạn: ${code}. Mã xác thực có hiệu lực trong vòng 2 phút và chỉ có thể sử dụng một lần. Vui lòng không chi sẻ mã xác thực này cho bất kì ai.`,
    html: `
      <!doctype html>
      <html lang="en">
          <head>
              <meta charset="utf-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>Email</title>
              <style>
                  /* Client-specific styles */
                  body,table,td,a{ -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
                  table,td{ mso-table-rspace:0pt; mso-table-lspace:0pt; }
                  img{ -ms-interpolation-mode:bicubic; }

                  /* Responsive */
                  img{ border:0; height:auto; line-height:100%; outline:none; text-decoration:none; }
                  table{ border-collapse:collapse !important; }
                  body{ width:100% !important; height:100% !important; margin:0; padding:0; }

                  /* Mobile */
                  @media screen and (max-width:600px){
                      .container{ width:100% !important; padding:12px !important; }
                      .stack{ display:block !important; width:100% !important; }
                      .hide-mobile{ display:none !important; }
                  }
              </style>
          </head>
          <body style="background-color:#f3f4f6; margin:0; padding:20px;">
              <center>
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                          <td align="center">
                              <table class="container" width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px; background:#ffffff; border-radius:8px; overflow:hidden;">
                                  <!-- Header -->
                                  <tr>
                                      <td style="padding:20px 24px; background:linear-gradient(90deg,#4f46e5,#06b6d4); color:#ffffff; text-align:left;">
                                          <table width="100%"><tr>
                                              <td style="vertical-align: middle; text-align: left;">
                                                <h1 style="margin: 0; font-size: 20px; font-weight: 600; letter-spacing: -0.2px;">Mentor-Link</h1>
                                                <div style="font-size: 14px; opacity: 0.95; margin-top: 6px;">
                                                Vui lòng xác thực tài khoản, <Strong style="color:#fffbeb;"> ${email} </Strong>
                                                </div>
                                              </td>
                                          </tr></table>
                                      </td>
                                  </tr>

                                  <!-- Body -->
                                  <tr>
                                      <td style="padding:28px 24px 18px 24px; color:#111827; font-family:Arial, Helvetica, sans-serif; font-size:15px; line-height:22px;">
                                          <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                                <tr>
                                                  <td style="padding:28px 24px 18px 24px; color:#111827; font-family:Arial, Helvetica, sans-serif; font-size:15px; line-height:22px; text-align:center;">
                                                    <div style="margin:0 0 18px 0; color:#374151;">
                                                      <p style="margin:0; font-size:16px;">Đây là mã xác thực của bạn:</p>
                                                      <p style="margin:10px 0; font-size:28px; font-weight:bold; letter-spacing:2px; color:#1d4ed8;">${code}</p>
                                                    </div>
                                                  </td>
                                                </tr>
                                              </table>


                                          <p style="margin:0; color:#6b7280; font-size:13px;">Mã xác thực có hiệu lực trong vòng 2 phút và chỉ có thể sử dụng một lần. Vui lòng không chi sẻ mã xác thực này cho bất kì ai.</p>
                                      </td>
                                  </tr>

                                  <tr>
                                      <td style="padding:18px 24px 24px 24px; background:#f9fafb; color:#6b7280; font-family:Arial, Helvetica, sans-serif; font-size:12px;">
                                          <table width="100%"><tr>
                                              <td style="vertical-align:top">
                                                  <div style="font-weight:600; color:#111827; margin-bottom:6px;">Mentor-Link</div>
                                                  <div>© ${new Date().getFullYear()} Mentor-Link. All rights reserved.</div>
                                              </td>
                                              <!--<td style="vertical-align:top; text-align:right;">-->
                                              <!--    <div style="margin-bottom:6px;"><a href="#" style="color:#6b7280; text-decoration:none;">Chính sách &amp; Điều khoản</a></div>-->
                                              <!--    <div><a href="#" style="color:#6b7280; text-decoration:none;">Hỗ trợ</a></div>-->
                                              <!--</td>-->
                                          </tr></table>
                                      </td>
                                  </tr>
                              </table>
                              <!-- small note area -->
                              <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px; margin-top:12px;">
                                  <tr>
                                      <td style="font-family:Arial, Helvetica, sans-serif; font-size:12px; color:#9ca3af; text-align:center;">
                                          Bạn nhận được email này vì bạn đã đăng ký dịch vụ Mentor-Link.
                                      </td>
                                  </tr>
                              </table>
                          </td>
                      </tr>
                  </table>
              </center>
          </body>
      </html>
    `,
  };

  try {
    return await sendgrid.send(msg);
  } catch (err) {
    if (err && err.response && err.response.body) {
      console.error('requestOtp error:', err.response.body);
    } else {
      console.error('requestOtp error:', err);
    }
    throw err;
  }
}