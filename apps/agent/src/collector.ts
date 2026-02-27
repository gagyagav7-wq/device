import fs from 'fs';
import { execSync } from 'child_process';
import os from 'os';

let lastCpuIdle = 0;
let lastCpuTotal = 0;
let lastRx = 0;
let lastTx = 0;
let lastNetTime = Date.now();

export function readSysfsBattery() {
  try {
    const basePath = '/sys/class/power_supply/battery';
    const capacity = parseInt(fs.readFileSync(`${basePath}/capacity`, 'utf8'));
    const status = fs.readFileSync(`${basePath}/status`, 'utf8').trim();
    const tempRaw = parseInt(fs.readFileSync(`${basePath}/temp`, 'utf8')); // usually in tenths of Celsius
    const temp = tempRaw / 10;
    
    // Poco X3 NFC usually uses microvolts and microamps
    const voltageNow = parseInt(fs.readFileSync(`${basePath}/voltage_now`, 'utf8'));
    let currentNow = 0;
    try {
      currentNow = parseInt(fs.readFileSync(`${basePath}/current_now`, 'utf8'));
    } catch {
      // Fallback if current_now is not readable
    }

    const voltageV = voltageNow / 1000000;
    const currentmA = Math.abs(currentNow / 1000);
    const powerW = (voltageV * currentmA) / 1000; // P = V * I

    return {
      level: capacity,
      status,
      temp,
      voltage: Number(voltageV.toFixed(2)),
      current: Number(currentmA.toFixed(0)),
      power: Number(powerW.toFixed(2)),
      plugged: status === 'Charging' || status === 'Full'
    };
  } catch (e) {
    return parseDumpsysBattery(); // Fallback
  }
}

export function parseDumpsysBattery() {
  const dump = execSync('dumpsys battery').toString();
  const level = parseInt(dump.match(/level: (\d+)/)?.[1] || '0');
  const temp = parseInt(dump.match(/temperature: (\d+)/)?.[1] || '0') / 10;
  const voltage = parseInt(dump.match(/voltage: (\d+)/)?.[1] || '0') / 1000;
  const ac = dump.includes('AC powered: true');
  const usb = dump.includes('USB powered: true');
  
  return {
    level,
    status: ac || usb ? 'Charging' : 'Discharging',
    temp,
    voltage,
    current: 0,
    power: 0,
    plugged: ac || usb
  };
}

export function parseProcMeminfo() {
  const meminfo = fs.readFileSync('/proc/meminfo', 'utf8');
  const extract = (key: string) => parseInt(meminfo.match(new RegExp(`${key}:\\s+(\\d+) kB`))?.[1] || '0') / 1024; // MB
  
  const total = extract('MemTotal');
  const free = extract('MemFree');
  const available = extract('MemAvailable');
  const used = total - available;

  return { total, used, free, available };
}

export function cpuLoadFromProcStat() {
  const stat = fs.readFileSync('/proc/stat', 'utf8');
  const cpuLine = stat.split('\n')[0].split(/\s+/).slice(1).map(Number);
  
  const idle = cpuLine[3] + cpuLine[4]; // idle + iowait
  const total = cpuLine.reduce((acc, val) => acc + val, 0);
  
  const idleDelta = idle - lastCpuIdle;
  const totalDelta = total - lastCpuTotal;
  
  lastCpuIdle = idle;
  lastCpuTotal = total;
  
  const load = totalDelta === 0 ? 0 : 100 * (1 - idleDelta / totalDelta);
  return { load: Number(load.toFixed(1)) };
}

export function dfParse() {
  try {
    const df = execSync('df -k /data').toString().split('\n')[1];
    const parts = df.split(/\s+/);
    const total = parseInt(parts[1]) / 1024; // MB
    const used = parseInt(parts[2]) / 1024;
    const free = parseInt(parts[3]) / 1024;
    return { total, used, free };
  } catch {
    return { total: 0, used: 0, free: 0 };
  }
}

export function netDevParse() {
  const dev = fs.readFileSync('/proc/net/dev', 'utf8');
  const wlanLine = dev.split('\n').find(l => l.includes('wlan0'));
  let rxDelta = 0, txDelta = 0;
  
  if (wlanLine) {
    const parts = wlanLine.trim().split(/\s+/);
    const rx = parseInt(parts[1]);
    const tx = parseInt(parts[9]);
    
    const now = Date.now();
    const timeDelta = (now - lastNetTime) / 1000;
    
    if (lastRx !== 0 && timeDelta > 0) {
      rxDelta = (rx - lastRx) / timeDelta / 1024; // KB/s
      txDelta = (tx - lastTx) / timeDelta / 1024;
    }
    
    lastRx = rx;
    lastTx = tx;
    lastNetTime = now;
  }
  
  const interfaces = os.networkInterfaces();
  const ip = interfaces['wlan0']?.find(i => i.family === 'IPv4')?.address || 'Offline';

  return { rxDelta: Number(rxDelta.toFixed(1)), txDelta: Number(txDelta.toFixed(1)), ip };
}

export function collectSnapshot() {
  return {
    timestamp: Date.now(),
    battery: readSysfsBattery(),
    memory: parseProcMeminfo(),
    cpu: cpuLoadFromProcStat(),
    storage: dfParse(),
    network: netDevParse(),
    uptime: os.uptime(),
  };
}
