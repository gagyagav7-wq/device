import fetch from 'node-fetch';
import os from 'os';

const SERVER_URL = 'http://127.0.0.1:8787';
const TOKEN = process.env.DASH_TOKEN || 'super_secret_poco_token_123';

function collectSnapshot() {
  return {
    timestamp: Date.now(),
    battery: { level: 100, status: 'Charging', temp: 35.5, voltage: 4.2, current: 1500, power: 6.3, plugged: true },
    memory: { total: os.totalmem() / 1024 / 1024, used: (os.totalmem() - os.freemem()) / 1024 / 1024, free: os.freemem() / 1024 / 1024, available: os.freemem() / 1024 / 1024 },
    cpu: { load: Math.random() * 100 },
    storage: { total: 128000, used: 64000, free: 64000 },
    network: { rxDelta: Math.random() * 100, txDelta: Math.random() * 50, ip: '192.168.x.x' },
    uptime: os.uptime(),
  };
}

setInterval(async () => {
  const data = collectSnapshot();
  try {
    await fetch(`${SERVER_URL}/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` },
      body: JSON.stringify(data)
    });
    console.log(`[Agent] Berhasil kirim data - ${new Date().toLocaleTimeString()}`);
  } catch (err) {
    console.log(`[Agent] Gagal kirim data. Server belum nyala?`);
  }
}, 2000);
