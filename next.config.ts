import type { NextConfig } from "next";

// Origins this app actually talks to from the client: Firebase Auth/Identity
// Toolkit (token exchange, popup sign-in), Apple's Sign-In JS SDK, and our own
// origin (all backend calls are same-origin via /api/proxy). No image/font
// CDNs are used — next/font self-hosts Google fonts at build time.
//
// 'unsafe-eval' is added only outside production: React dev mode and
// Turbopack/webpack HMR both eval() for debugging/fast refresh. React never
// calls eval() in a production build, so the built app doesn't need it.
const isDev = process.env.NODE_ENV !== "production";
const CSP = [
  "default-src 'self'",
  // apis.google.com serves the gapi loader (js/api.js). signInWithPopup loads
  // it *before* opening the popup and asserts window.gapi exists afterwards —
  // blocking it makes Firebase throw a bare auth/internal-error.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://apis.google.com https://appleid.cdn-apple.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.googleapis.com https://securetoken.googleapis.com https://identitytoolkit.googleapis.com https://appleid.apple.com",
  // signInWithPopup relies on a hidden helper iframe served from the Firebase
  // authDomain (project.firebaseapp.com) to relay the popup's auth result
  // back to this page — without it in frame-src, Firebase surfaces the
  // failure as a generic auth/internal-error.
  "frame-src 'self' https://appleid.apple.com https://apis.google.com https://*.firebaseapp.com",
  "form-action 'self' https://appleid.apple.com",
  "object-src 'none'",
  "base-uri 'self'",
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
          {
            key: "Content-Security-Policy",
            value: CSP,
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
