/**
 * Registered Apple "Return URL" for the usePopup Sign in with Apple flow.
 *
 * Apple's authorization server redirects the *popup window* here after the
 * user approves the request. This page must load Apple's JS SDK again — the
 * SDK detects it is running inside the auth popup and posts the result back
 * to the opener window itself, which is where AppleID.auth.signIn() (called
 * from the login modal) is actually awaiting the response. This route does
 * not read or process the auth response itself.
 */

const CALLBACK_HTML = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Signing in with Apple…</title>
  </head>
  <body>
    <script
      type="text/javascript"
      src="https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js"
    ></script>
  </body>
</html>`;

function htmlResponse(): Response {
  return new Response(CALLBACK_HTML, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function GET(): Promise<Response> {
  return htmlResponse();
}

export async function POST(): Promise<Response> {
  return htmlResponse();
}
