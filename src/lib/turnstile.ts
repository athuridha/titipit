export async function verifyTurnstileToken(token: string): Promise<boolean> {
  const secretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;
  // If secret key is not configured, pass validation so development is not blocked
  if (!secretKey) return true;

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
    });

    const data = await res.json();
    return Boolean(data.success);
  } catch (err) {
    console.error("Cloudflare Turnstile verification error:", err);
    return false;
  }
}
