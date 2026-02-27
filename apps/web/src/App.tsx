import { useEffect, useState } from 'react';
import { MetricCard, KpiRow, Badge } from './components/MetricCard';

export default function App() {
  const [data, setData] = useState<any>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const wsUrl = `${import.meta.env.VITE_WS_URL}/ws?token=${import.meta.env.VITE_DASH_TOKEN}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'metrics:update') {
        setData(msg.data);
      }
    };

    return () => ws.close();
  }, []);

  if (!data) return <div className="min-h-screen bg-cream flex items-center justify-center font-bold text-xl border-4 border-brutal m-4 rounded-brutal shadow-brutal bg-white">INITIALIZING AGENT...</div>;

  const { battery, cpu, memory, storage, network } = data;

  return (
    <div className="min-h-screen bg-cream p-4 md:p-8 font-sans text-brutal selection:bg-pink selection:text-brutal">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-6 bg-white p-3 border-4 border-brutal rounded-brutal shadow-brutal">
        <h1 className="text-2xl font-black tracking-tighter">POCO CONTROL</h1>
        <Badge active={connected}>{connected ? 'LIVE' : 'OFFLINE'}</Badge>
      </div>

      {/* Hero Strip */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[150px] bg-mint p-4 border-4 border-brutal rounded-brutal shadow-brutal flex flex-col justify-center items-center">
          <span className="text-sm font-bold uppercase mb-1">Battery</span>
          <span className="text-4xl font-black font-mono">{battery.level}%</span>
        </div>
        <div className="flex-1 min-w-[150px] bg-pink p-4 border-4 border-brutal rounded-brutal shadow-brutal flex flex-col justify-center items-center">
          <span className="text-sm font-bold uppercase mb-1">Status</span>
          <span className="text-2xl font-black uppercase">{battery.status}</span>
        </div>
        <div className="flex-1 min-w-[150px] bg-lavender p-4 border-4 border-brutal rounded-brutal shadow-brutal flex flex-col justify-center items-center">
          <span className="text-sm font-bold uppercase mb-1">Thermals</span>
          <span className="text-4xl font-black font-mono">{battery.temp}°C</span>
        </div>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard title="Power Delivery" accent="bg-white">
          <KpiRow label="Voltage" value={`${battery.voltage} V`} />
          <KpiRow label="Current" value={`${battery.current} mA`} />
          <KpiRow label="Est. Wattage" value={`${battery.power} W`} />
        </MetricCard>

        <MetricCard title="CPU Compute" accent="bg-white">
          <KpiRow label="Overall Load" value={`${cpu.load}%`} />
          <div className="mt-4 h-2 w-full bg-brutal/10 rounded-full border-2 border-brutal overflow-hidden">
            <div className="h-full bg-pink border-r-2 border-brutal transition-all duration-300" style={{ width: `${cpu.load}%` }} />
          </div>
        </MetricCard>

        <MetricCard title="Memory (RAM)" accent="bg-white">
          <KpiRow label="Total" value={`${(memory.total / 1024).toFixed(1)} GB`} />
          <KpiRow label="Used" value={`${(memory.used / 1024).toFixed(1)} GB`} />
          <KpiRow label="Available" value={`${(memory.available / 1024).toFixed(1)} GB`} />
        </MetricCard>

        <MetricCard title="Internal Storage" accent="bg-white">
          <KpiRow label="/data Total" value={`${(storage.total / 1024).toFixed(1)} GB`} />
          <KpiRow label="/data Used" value={`${(storage.used / 1024).toFixed(1)} GB`} />
          <KpiRow label="/data Free" value={`${(storage.free / 1024).toFixed(1)} GB`} />
        </MetricCard>

        <MetricCard title="Network Edge" accent="bg-white">
          <KpiRow label="Local IP" value={network.ip} />
          <KpiRow label="Download" value={`${network.rxDelta} KB/s`} />
          <KpiRow label="Upload" value={`${network.txDelta} KB/s`} />
        </MetricCard>
      </div>
    </div>
  );
}
