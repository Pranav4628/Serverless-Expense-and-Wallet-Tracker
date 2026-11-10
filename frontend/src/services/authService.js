/**
 * authService.js
 * Thin wrapper around amazon-cognito-identity-js for user auth operations.
 *
 * The CognitoUserPool is created lazily (on first use) so that a missing
 * .env file does not crash module initialisation and cause a blank screen.
 */
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
} from 'amazon-cognito-identity-js';

// ─── Lazy pool singleton ─────────────────────────────────────────────────────

let _userPool = null;

function getUserPool() {
  if (_userPool) return _userPool;

  const UserPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID;
  const ClientId   = import.meta.env.VITE_COGNITO_CLIENT_ID;

  if (!UserPoolId || !ClientId) {
    // Return a stub so the app renders; auth actions will surface a clear error.
    return null;
  }

  _userPool = new CognitoUserPool({ UserPoolId, ClientId });
  return _userPool;
}

function requirePool() {
  const pool = getUserPool();
  if (!pool) {
    throw new Error(
      'Cognito is not configured. Please set VITE_COGNITO_USER_POOL_ID and ' +
      'VITE_COGNITO_CLIENT_ID in your .env file.',
    );
  }
  return pool;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getCognitoUser(usernameOrEmail) {
  return new CognitoUser({ Username: usernameOrEmail, Pool: requirePool() });
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Sign up a new user with all required attributes.
 * @param {{ username: string, email: string, password: string, name: string, preferredUsername?: string, phoneNumber: string, gender: string }} credentials
 * @returns {Promise<any>} Cognito signUp result
 */
export function signUp({ username, email, password, name, preferredUsername, phoneNumber, gender }) {
  const pool = requirePool();
  const attributes = [
    new CognitoUserAttribute({ Name: 'email', Value: email }),
    new CognitoUserAttribute({ Name: 'name', Value: name }),
    new CognitoUserAttribute({ Name: 'phone_number', Value: phoneNumber }),
    new CognitoUserAttribute({ Name: 'gender', Value: gender }),
  ];
  
  if (preferredUsername) {
    attributes.push(new CognitoUserAttribute({ Name: 'preferred_username', Value: preferredUsername }));
  }
  
  return new Promise((resolve, reject) => {
    pool.signUp(username, password, attributes, null, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

/**
 * Confirm sign-up with the OTP code sent via email.
 * @param {{ username: string, code: string }} params
 * @returns {Promise<string>} 'SUCCESS' on success
 */
export function confirmSignUp({ username, code }) {
  const cognitoUser = getCognitoUser(username);
  return new Promise((resolve, reject) => {
    cognitoUser.confirmRegistration(code, true, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

/**
 * Authenticate a user and return their JWT tokens.
 * @param {{ username: string, password: string }} credentials
 * @returns {Promise<{ accessToken: string, idToken: string, refreshToken: string, email: string, sub: string }>}
 */
export function login({ username, password }) {
  const authDetails = new AuthenticationDetails({
    Username: username,
    Password: password,
  });
  const cognitoUser = getCognitoUser(username);

  return new Promise((resolve, reject) => {
    cognitoUser.authenticateUser(authDetails, {
      onSuccess: (session) => {
        const idTokenPayload = session.getIdToken().decodePayload();
        resolve({
          accessToken:  session.getAccessToken().getJwtToken(),
          idToken:      session.getIdToken().getJwtToken(),
          refreshToken: session.getRefreshToken().getToken(),
          email:        idTokenPayload['email'],
          sub:          idTokenPayload['sub'],
        });
      },
      onFailure: (err) => reject(err),
      newPasswordRequired: () =>
        reject(new Error('New password required. Please reset your password.')),
    });
  });
}

/**
 * Sign out the current Cognito user and clear local storage.
 */
export function logout() {
  const pool = getUserPool(); // safe — no throw if not configured
  if (pool) {
    const currentUser = pool.getCurrentUser();
    if (currentUser) currentUser.signOut();
  }
  localStorage.removeItem('fintrack_access_token');
  localStorage.removeItem('fintrack_id_token');
  localStorage.removeItem('fintrack_user');
}

/**
 * Retrieve a valid session for the currently authenticated user.
 * Returns null if Cognito is not yet configured.
 * @returns {Promise<{ accessToken: string, idToken: string, email: string, sub: string } | null>}
 */
export function getCurrentSession() {
  const pool = getUserPool();
  if (!pool) return Promise.resolve(null);

  const currentUser = pool.getCurrentUser();
  if (!currentUser) return Promise.resolve(null);

  return new Promise((resolve) => {
    currentUser.getSession((err, session) => {
      if (err || !session || !session.isValid()) {
        resolve(null);
        return;
      }
      const payload = session.getIdToken().decodePayload();
      resolve({
        accessToken: session.getAccessToken().getJwtToken(),
        idToken:     session.getIdToken().getJwtToken(),
        email:       payload['email'],
        sub:         payload['sub'],
      });
    });
  });
}

/**
 * Initiate forgot-password flow (sends reset code to email).
 * @param {string} username
 * @returns {Promise<any>}
 */
export function forgotPassword(username) {
  const cognitoUser = getCognitoUser(username);
  return new Promise((resolve, reject) => {
    cognitoUser.forgotPassword({
      onSuccess: resolve,
      onFailure: reject,
    });
  });
}

/**
 * Confirm a new password using the reset code.
 * @param {{ username: string, code: string, newPassword: string }} params
 * @returns {Promise<any>}
 */
export function confirmForgotPassword({ username, code, newPassword }) {
  const cognitoUser = getCognitoUser(username);
  return new Promise((resolve, reject) => {
    cognitoUser.confirmPassword(code, newPassword, {
      onSuccess: resolve,
      onFailure: reject,
    });
  });
}
