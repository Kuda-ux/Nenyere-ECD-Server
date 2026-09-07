/**
 * Device store — manages classroom tablet devices in localStorage.
 * Teacher registers devices (up to 20) from the dashboard.
 * Each device gets a short PIN code that children enter to access the learner picker.
 */

const DEVICES_KEY = "nenyere_devices";
const ACTIVE_DEVICE_KEY = "nenyere_active_device";
const MAX_DEVICES = 20;

export interface Device {
  id: string;
  name: string;
  pin: string;
  registeredAt: string;
  lastUsedAt: string | null;
  learnerIds: string[];
}

function generatePin(): string {
  const digits = "0123456789";
  let pin = "";
  for (let i = 0; i < 4; i++) {
    pin += digits[Math.floor(Math.random() * digits.length)];
  }
  return pin;
}

function loadDevices(): Device[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DEVICES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveDevices(devices: Device[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(DEVICES_KEY, JSON.stringify(devices));
}

export function getDevices(): Device[] {
  return loadDevices();
}

export function getDeviceById(id: string): Device | undefined {
  return loadDevices().find((d) => d.id === id);
}

export function getDeviceByPin(pin: string): Device | undefined {
  return loadDevices().find((d) => d.pin === pin);
}

export function addDevice(name: string, learnerIds: string[] = []): Device | string {
  const devices = loadDevices();
  if (devices.length >= MAX_DEVICES) {
    return `Maximum of ${MAX_DEVICES} devices reached. Remove an old device to add a new one.`;
  }
  const pin = generatePin();
  // Ensure unique PIN
  let attempts = 0;
  while (devices.some((d) => d.pin === pin) && attempts < 100) {
    attempts++;
  }
  const device: Device = {
    id: crypto.randomUUID(),
    name,
    pin,
    registeredAt: new Date().toISOString(),
    lastUsedAt: null,
    learnerIds,
  };
  devices.push(device);
  saveDevices(devices);
  return device;
}

export function updateDevice(id: string, updates: Partial<Omit<Device, "id" | "pin" | "registeredAt">>): Device | undefined {
  const devices = loadDevices();
  const idx = devices.findIndex((d) => d.id === id);
  if (idx === -1) return undefined;
  devices[idx] = { ...devices[idx], ...updates };
  saveDevices(devices);
  return devices[idx];
}

export function removeDevice(id: string): boolean {
  const devices = loadDevices();
  const filtered = devices.filter((d) => d.id !== id);
  if (filtered.length === devices.length) return false;
  saveDevices(filtered);
  return true;
}

export function regeneratePin(id: string): Device | undefined {
  const devices = loadDevices();
  const idx = devices.findIndex((d) => d.id === id);
  if (idx === -1) return undefined;
  const newPin = generatePin();
  devices[idx].pin = newPin;
  saveDevices(devices);
  return devices[idx];
}

export function recordDeviceUsage(id: string) {
  updateDevice(id, { lastUsedAt: new Date().toISOString() });
}

export function setActiveDevice(deviceId: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACTIVE_DEVICE_KEY, deviceId);
}

export function getActiveDeviceId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACTIVE_DEVICE_KEY);
}

export function clearActiveDevice() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACTIVE_DEVICE_KEY);
}

export const MAX_DEVICE_COUNT = MAX_DEVICES;
