function verificationEmail({ code, type = 'student' }) {
    const html = `
<!doctype html>
<html>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:12px;padding:40px 32px;">
        <tr><td style="font-size:22px;font-weight:bold;color:#1e2a5a;">SkillSpring</td></tr>
        <tr><td style="padding-top:24px;font-size:16px;color:#333;">Here's your ${type} verification code:</td></tr>
        <tr><td align="center" style="padding:24px 0;">
          <div style="display:inline-block;font-size:32px;font-weight:bold;letter-spacing:8px;color:#1e2a5a;background:#eef1fb;padding:16px 24px;border-radius:8px;">${code}</div>
        </td></tr>
        <tr><td style="font-size:14px;color:#666;">This code expires in 15 minutes. If you didn't request it, you can ignore this email.</td></tr>
      </table>
      <p style="font-size:12px;color:#999;padding-top:16px;">© SkillSpring</p>
    </td></tr>
  </table>
</body>
</html>`;

    const text = `Your SkillSpring verification code is ${code}. It expires in 15 minutes.`;

    return { subject: 'Your SkillSpring verification code', html, text };
}

function ndaEmail({ link }) {
  const html = `
<!doctype html>
<html>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:12px;padding:40px 32px;">
        <tr><td style="font-size:22px;font-weight:bold;color:#1e2a5a;">SkillSpring</td></tr>
        <tr><td style="padding-top:24px;font-size:20px;font-weight:bold;color:#1e2a5a;">Congratulations, you've been selected! 🎉</td></tr>
        <tr><td style="padding-top:12px;font-size:16px;line-height:24px;color:#333;">
          A company has picked you for their task. Before you get access to the task details, please review and sign the Non-Disclosure Agreement (NDA).
        </td></tr>
        <tr><td align="center" style="padding:32px 0;">
          <table cellpadding="0" cellspacing="0"><tr>
            <td style="background:#2a4bd7;border-radius:8px;">
              <a href="${link}" style="display:inline-block;padding:14px 32px;font-size:16px;font-weight:bold;color:#ffffff;text-decoration:none;">Review &amp; Sign NDA</a>
            </td>
          </tr></table>
        </td></tr>
        <tr><td style="font-size:14px;line-height:22px;color:#666;">
          Once signed, you'll have full access to the task and can get started right away.
        </td></tr>
        <tr><td style="padding-top:24px;border-top:1px solid #eee;font-size:12px;line-height:18px;color:#999;">
          Button not working? Copy and paste this link into your browser:<br>
          <a href="${link}" style="color:#2a4bd7;word-break:break-all;">${link}</a>
        </td></tr>
      </table>
      <p style="font-size:12px;color:#999;padding-top:16px;">© SkillSpring</p>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `Congratulations, you've been selected for a task on SkillSpring! Please review and sign the NDA to get started: ${link}`;
  return { subject: "You've been selected for a task. Sign the NDA to get started", html, text };
}

module.exports = { verificationEmail, ndaEmail };
