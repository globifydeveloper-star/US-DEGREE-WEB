/**
 * Loads Apple's official "Sign in with Apple" JS SDK on demand and exposes a
 * popup sign-in helper that resolves with Apple's id_token. The id_token
 * itself is verified directly by the backend's POST /auth/apple (Apple's
 * public keys), not exchanged via the Firebase-based /auth/login path used
 * by Google — the backend then hands back a Firebase custom token in that
 * same response so the caller can still establish a persisted Firebase
 * client session (see AuthContext.loginWithApple).
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

export interface AppleSignInResult {
  idToken: string;
  /** Only present on the user's first-ever authorization for this client. */
  fullName?: string;
}

/**
 * Opens Apple's popup sign-in flow and resolves with the id_token to send to
 * the backend for verification, plus the user's name if Apple included it.
 * Apple only returns `user` (name/email) on the first authorization for a
 * given Apple ID — the backend must capture it then, since it will never be
 * sent again on subsequent sign-ins.
 */
export async function signInWithApple(): Promise<AppleSignInResult> {
  await loadAppleSdk();
  initAppleAuth();

  const response = await window.AppleID!.auth.signIn();
  const idToken = response.authorization?.id_token;
  if (!idToken) {
    throw new Error("Apple Sign In did not return an id_token");
  }

  const name = response.user?.name;
  const fullName = name
    ? [name.firstName, name.lastName].filter(Boolean).join(" ").trim()
    : undefined;

  return { idToken, fullName: fullName || undefined };
}
