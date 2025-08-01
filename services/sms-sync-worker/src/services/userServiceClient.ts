import axios from "axios";

const USER_SERVICE_URL =
  process.env.USER_SERVICE_URL || "http://user-service:3001";

/**
 * Verifies user access by sending a request to the user service with a JWT token.
 *
 * @param token - The JWT token used for authentication.
 * @returns A promise that resolves with the user data if the token is valid, or null if the verification fails.
 */

export async function verifyUserAccess(token: string) {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const res = await axios.get(`${USER_SERVICE_URL}/users/me`, { headers });
    return res.data?.data?.user || null;
  } catch {
    return null;
  }
}
