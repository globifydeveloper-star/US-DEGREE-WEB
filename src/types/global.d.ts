export {};

interface AppleIDAuthInitConfig {
  clientId: string;
  scope?: string;
  redirectURI: string;
  usePopup?: boolean;
  state?: string;
  nonce?: string;
}

interface AppleIDSignInResponse {
  authorization: {
    id_token: string;
    code?: string;
    state?: string;
  };
  user?: {
    email?: string;
    name?: {
      firstName?: string;
      lastName?: string;
    };
  };
}

interface AppleIDNamespace {
  auth: {
    init: (config: AppleIDAuthInitConfig) => void;
    signIn: () => Promise<AppleIDSignInResponse>;
  };
}

declare global {
  interface Window {
    AppleID?: AppleIDNamespace;
  }
}
