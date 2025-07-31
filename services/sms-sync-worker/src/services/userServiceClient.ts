import axios from "axios";

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://user-service:3001";

export async function fetchUserById(userId: string) {
  try {
    const res = await axios.get(`${USER_SERVICE_URL}/v1/users/${userId}`);
    return res.data?.data?.user || null;
  } catch (err) {
    return null;
  }
}
