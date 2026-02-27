import { collectSnapshot } from './collector';
import fetch from 'node-fetch'; // pastikan install node-fetch v2

const SERVER_URL = process.env.SERVER_URL || 'http://127.0.0.1:8787';
const TOKEN = process.env.DASH_TOKEN || 'super_secret_poco_token_123';
const INTERVAL = parseInt(process.env.AGENT_INTERVAL_MS || '2000');

async function sendData() {
  const data = collectSnapshot();
  try {
    await fetch(`${SERVER_URL}/ingest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      },
      body: JSON.stringify(data)
    });
    console.log(`[Agent] Sent snapshot at ${new Date(data.timestamp).toISOString()}`);
  } catch (err) {
    console.error(`[Agent] Failed to send data: ${(err as Error).message}`);
  }
}

setInterval(sendData, INTERVAL);
sendData(); // Initial run
