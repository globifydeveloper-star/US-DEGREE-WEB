export function getFriendlyErrorMessage(error: unknown): string {
  const err = error as { code?: string; message?: string } | null;
  const code = err?.code || err?.message || "";
  if (code.includes("auth/email-already-in-use")) {
    return "This email address is already in use by another account.";
  }
  if (code.includes("auth/invalid-email")) {
    return "Please enter a valid email address.";
  }
  if (code.includes("auth/weak-password")) {
    return "The password must be at least 6 characters.";
  }
  if (
    code.includes("auth/user-not-found") ||
    code.includes("auth/wrong-password") ||
    code.includes("auth/invalid-credential")
  ) {
    return "Invalid email address or password.";
  }
  if (code.includes("auth/operation-not-allowed")) {
    return "Email/Password authentication is disabled in this project.";
  }
  if (code.includes("auth/too-many-requests")) {
    return "Too many failed login attempts. Please try again later.";
  }
  return err?.message || "Authentication failed. Please try again.";
}
