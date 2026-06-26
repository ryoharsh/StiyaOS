import type { WifiNetwork, NetworkStatus, ConnectionResult } from './types/network';

const wifiListContainer = document.getElementById('wifi-list') as HTMLUListElement;
const ethernetStatusEl = document.getElementById('ethernet-status') as HTMLSpanElement;
const wifiStatusEl = document.getElementById('wifi-status') as HTMLSpanElement;
const disconnectBtn = document.getElementById('btn-disconnect') as HTMLButtonElement;

async function updateDashboard(): Promise<void> {
  const status: NetworkStatus = await window.networkAPI.getStatus();

  ethernetStatusEl.innerText = status.ethernetConnected ? 'Connected (Wired)' : 'Disconnected';

  if (status.wifiConnected) {
    wifiStatusEl.innerText = `Connected to ${status.activeSsid} (${status.signalStrength}%)`;
    disconnectBtn.style.display = 'inline-block';
  } else {
    wifiStatusEl.innerText = 'Disconnected';
    disconnectBtn.style.display = 'none';
  }
}

async function scanNetworks(): Promise<void> {
  wifiListContainer.innerHTML = '<li>Scanning for available networks...</li>';

  try {
    const networks: WifiNetwork[] = await window.networkAPI.scanWifi();
    wifiListContainer.innerHTML = ''; 

    networks.forEach((net) => {
      const li = document.createElement('li');
      
      const title = document.createElement('strong');
      title.innerText = `${net.ssid} (${net.signal}%) ${net.isKnown ? '🔒' : '🔓'}`;
      
      const connectBtn = document.createElement('button');
      connectBtn.innerText = 'Connect';
      connectBtn.addEventListener('click', () => handleConnect(net.ssid));

      li.appendChild(title);
      li.appendChild(connectBtn);
      wifiListContainer.appendChild(li);
    });
  } catch (err) {
    wifiListContainer.innerHTML = '<li>Error running Wi-Fi scan.</li>';
  }
}

async function handleConnect(ssid: string): Promise<void> {
  const password = prompt(`Enter password for ${ssid}:`);
  if (password === null) return; 

  const result: ConnectionResult = await window.networkAPI.connectWifi(ssid, password);
  if (result.success) {
    alert(`Successfully joined ${ssid}`);
    updateDashboard();
  } else {
    alert(`Failed to connect: ${result.error}`);
  }
}

disconnectBtn.addEventListener('click', async () => {
  const result: ConnectionResult = await window.networkAPI.disconnectWifi();
  if (result.success) {
    updateDashboard();
  }
});

// Run on startup & set loops
window.addEventListener('DOMContentLoaded', () => {
  updateDashboard();
  scanNetworks();
  
  // Continuous dashboard polling every 6 seconds
  setInterval(updateDashboard, 6000);
});