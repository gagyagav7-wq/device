import { useEffect, useState } from 'react';

export default function App() {
  const [data, setData] = useState<any>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws?token=super_secret_poco_token_123`;
    
    const ws = new WebSocket(wsUrl);
    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'metrics:update') setData(msg.data);
    };
    return () => ws.close();
  }, []);

  if (!data) return <div className="min-h-screen flex items-center justify-center font-bold text-xl text-brutal">MENUNGGU DATA DARI POCO X3...</div>;

  return (
    <div className="p-4 md:p-8 text-brutal">
      <div className="flex justify-between items-center mb-6 bg-white p-4 border-4 border-brutal rounded-brutal shadow-brutal">
        <h1 className="text-2xl font-black uppercase tracking-tighter">POCO CONTROL</h1>
        <span className={`px-3 py-1 text-sm font-bold border-2 border-brutal rounded-full shadow-[2px_2px_0px_#111827] ${connected ? 'bg-mint' : 'bg-pink'}`}>
          {connected ? 'LIVE' : 'OFFLINE'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 border-4 border-brutal rounded-brutal shadow-brutal bg-mint">
          <h2 className="font-bold text-xl mb-4 border-b-2 border-brutal pb-2">🔋 BATTERY INFO</h2>
          <div className="space-y-2 font-mono">
            <div className="flex justify-between"><span>Level</span><span className="font-black text-lg">{data.battery.level}%</span></div>
            <div className="flex justify-between"><span>Status</span><span className="font-black">{data.battery.status}</span></div>
            <div className="flex justify-between"><span>Temp</span><span className="font-black">{data.battery.temp}°C</span></div>
            <div className="flex justify-between"><span>Power</span><span className="font-black">{data.battery.power} W</span></div>
          </div>
        </div>

        <div className="p-5 border-4 border-brutal rounded-brutal shadow-brutal bg-pink">
          <h2 className="font-bold text-xl mb-4 border-b-2 border-brutal pb-2">⚙️ SYSTEM COMPUTE</h2>
          <div className="space-y-2 font-mono">
            <div className="flex justify-between"><span>CPU Load</span><span className="font-black text-lg">{data.cpu.load.toFixed(1)}%</span></div>
            <div className="flex justify-between"><span>RAM Total</span><span className="font-black">{data.memory.total.toFixed(1)} MB</span></div>
            <div className="flex justify-between"><span>RAM Free</span><span className="font-black">{data.memory.free.toFixed(1)} MB</span></div>
            <div className="flex justify-between"><span>Uptime</span><span className="font-black">{Math.floor(data.uptime / 60)} Mins</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
