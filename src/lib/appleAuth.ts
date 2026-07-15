/**
 * Loads Apple's official "Sign in with Apple" JS SDK on demand and exposes a
 * popup sign-in helper that resolves with Apple's id_token. This flow is
 * intentionally independent of Firebase — the id_token is verified directly
 * by the backend's POST /auth/apple (Apple's public keys), not exchanged via
 * the Firebase-based /auth/login path used by Google.
 */

const APPLE_SDK_SRC =
  "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";

let sdkLoadPromise: Promise<void> | null = null;
let initialized = false;

function loadAppleSdk(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Apple Sign In is only available in the browser"));
  }
  if (window.AppleID) {
    return Promise.resolve();
  }
  if (sdkLoadPromise) {
    return sdkLoadPromise;
  }

  sdkLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = APPLE_SDK_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      sdkLoadPromise = null;
      reject(new Error("Failed to load Apple Sign In SDK"));
    };
    document.head.appendChild(script);
  });

  return sdkLoadPromise;
}

function initAppleAuth(): void {
  if (initialized || !window.AppleID) return;

  const clientId = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID;
  const redirectURI = process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI;
  if (!clientId || !redirectURI) {
    throw new Error("Apple Sign In is not configured");
  }

  window.AppleID.auth.init({
    clientId,
    scope: "name email",
    redirectURI,
    usePopup: true,
  });
  initialized = true;
}

/**
 * Opens Apple's popup sign-in flow and resolves with the id_token to send to
 * the backend for verification. Apple only returns `user` (name/email) on the
 * first authorization for a given Apple ID, so this deliberately relies only
 * on the id_token, which the backend can verify and re-derive identity from
 * on every sign-in.
 */
export async function signInWithApple(): Promise<string> {
  await loadAppleSdk();
  initAppleAuth();

  const response = await window.AppleID!.auth.signIn();
  const idToken = response.authorization?.id_token;
  if (!idToken) {
    throw new Error("Apple Sign In did not return an id_token");
  }
  return idToken;
}
