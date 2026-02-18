import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const client = axios.create({
  baseURL: process.env.KB_URL,
  auth: {
    username: process.env.KB_USER!,
    password: process.env.KB_TOKEN!
  },
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Call a Kanboard JSON-RPC method.
 */
export async function call<T>(method: string, params: object = {}): Promise<T> {
  try {
    const response = await client.post('', {
      jsonrpc: '2.0',
      method,
      id: Date.now(),
      params
    });

    if (response.data.error) {
      const { message, code } = response.data.error;
      throw new Error(`API Error [${code}]: ${message}`);
    }

    return response.data.result;
  } catch (err: any) {
    if (err.response) {
      throw new Error(`HTTP Error [${err.response.status}]: ${err.response.statusText}`);
    }
    throw err;
  }
}
