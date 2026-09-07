"use client";

import { PortalLayout, type NavItem } from "@/components/portal/portal-layout";
import { usePortalData } from "@/hooks/use-portal-data";
import { SignOutButton } from "@/components/sign-out-button";
import { useState, useEffect } from "react";
import {
  getDevices,
  addDevice,
  removeDevice,
  regeneratePin,
  MAX_DEVICE_COUNT,
  type Device,
} from "@/lib/device-store";

const TEACHER_NAV: NavItem[] = [
  { href: "/teach", label: "Dashboard", icon: "📊", description: "Class overview" },
  { href: "/teach/class", label: "My Class", icon: "🧒", description: "Roster & skills" },
  { href: "/teach/learners", label: "Manage Learners", icon: "👤", description: "Add & edit" },
  { href: "/teach/devices", label: "Devices", icon: "📱", description: "Set up tablets" },
  { href: "/teach/assign", label: "Assign Activities", icon: "📌", description: "Pick for class" },
  { href: "/teach/observations", label: "Observations", icon: "📝", description: "Record notes" },
  { href: "/teach/content", label: "Content Library", icon: "📚", description: "Activities" },
];

export default function DevicesPage() {
  const { data, loading } = usePortalData();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState("");
  const [newDeviceError, setNewDeviceError] = useState<string | null>(null);
  const [copiedPin, setCopiedPin] = useState<string | null>(null);

  useEffect(() => {
    setDevices(getDevices());
    setLoaded(true);
  }, []);

  function handleAddDevice() {
    if (!newDeviceName.trim()) return;
    const result = addDevice(newDeviceName.trim());
    if (typeof result === "string") {
      setNewDeviceError(result);
    } else {
      setDevices([...devices, result]);
      setNewDeviceName("");
      setShowAddForm(false);
      setNewDeviceError(null);
    }
  }

  function handleRemoveDevice(id: string) {
    if (confirm("Remove this device? The tablet will need a new PIN to access the app.")) {
      removeDevice(id);
      setDevices(devices.filter((d) => d.id !== id));
    }
  }

  function handleRegeneratePin(id: string) {
    if (confirm("Generate a new PIN for this device? The old PIN will stop working.")) {
      const updated = regeneratePin(id);
      if (updated) {
        setDevices(devices.map((d) => (d.id === id ? updated : d)));
      }
    }
  }

  function copyPin(pin: string) {
    navigator.clipboard?.writeText(pin);
    setCopiedPin(pin);
    setTimeout(() => setCopiedPin(null), 2000);
  }

  if (loading || !data || !loaded) {
    return (
      <PortalLayout navItems={TEACHER_NAV} brandLabel="Nenyere ECD" brandIcon="★" brandGradient="linear-gradient(135deg, #FF9F43, #FF6B35)" roleLabel="teacher" userName="Teacher">
        <div className="flex h-96 items-center justify-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-[#FF9F43]" />
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout navItems={TEACHER_NAV} brandLabel="Nenyere ECD" brandIcon="★" brandGradient="linear-gradient(135deg, #FF9F43, #FF6B35)" roleLabel="teacher" userName="Teacher">
      {/* Page header */}
      <div className="mb-6 rounded-2xl p-6 text-white shadow-lg" style={{ background: "linear-gradient(135deg, #FF9F43, #FF6B35)" }}>
        <h1 className="text-2xl font-bold">Device Management 📱</h1>
        <p className="mt-1 text-white/80">
          Register tablets for your classroom — {devices.length}/{MAX_DEVICE_COUNT} devices
        </p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md">
          <p className="text-sm text-slate-500">Registered Devices</p>
          <p className="mt-1 text-2xl font-bold text-slate-800">{devices.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md">
          <p className="text-sm text-slate-500">Available Slots</p>
          <p className="mt-1 text-2xl font-bold text-slate-800">{MAX_DEVICE_COUNT - devices.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md">
          <p className="text-sm text-slate-500">Total Learners</p>
          <p className="mt-1 text-2xl font-bold text-slate-800">{data.totalLearners}</p>
        </div>
      </div>

      {/* Add device button */}
      <div className="mb-6">
        {devices.length < MAX_DEVICE_COUNT ? (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
          >
            + Register New Device
          </button>
        ) : (
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
            Device limit reached. Remove an old device to add a new one.
          </p>
        )}
      </div>

      {/* Add device form */}
      {showAddForm && (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
          <h2 className="mb-4 text-lg font-bold text-slate-800">Register New Device</h2>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-700">Device Name</label>
              <input
                type="text"
                value={newDeviceName}
                onChange={(e) => setNewDeviceName(e.target.value)}
                placeholder="e.g. Tablet 1, iPad A, Corner Tablet"
                className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#FF9F43] focus:ring-2 focus:ring-[#FF9F43]/20"
                autoFocus
              />
            </div>
            <button
              onClick={handleAddDevice}
              disabled={!newDeviceName.trim()}
              className="rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-2.5 font-bold text-white shadow-md transition-all hover:scale-105 disabled:opacity-50"
            >
              Register
            </button>
            <button
              onClick={() => { setShowAddForm(false); setNewDeviceError(null); }}
              className="rounded-lg border border-slate-200 px-6 py-2.5 font-medium text-slate-600"
            >
              Cancel
            </button>
          </div>
          {newDeviceError && (
            <p className="mt-3 text-sm text-red-600">{newDeviceError}</p>
          )}
        </div>
      )}

      {/* Device list */}
      {devices.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <span className="text-5xl">📱</span>
          <h2 className="mt-4 text-lg font-bold text-slate-700">No devices registered yet</h2>
          <p className="mt-2 text-sm text-slate-500">
            Register a tablet to get a 4-digit PIN. Children enter the PIN on the tablet to access their learning activities.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {devices.map((device) => (
            <div key={device.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-800">📱 {device.name}</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Registered {new Date(device.registeredAt).toLocaleDateString()}
                  </p>
                  {device.lastUsedAt && (
                    <p className="text-xs text-slate-500">
                      Last used {new Date(device.lastUsedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${device.lastUsedAt ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                  {device.lastUsedAt ? "Active" : "Unused"}
                </span>
              </div>

              {/* PIN display */}
              <div className="mt-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 p-4 text-center">
                <p className="text-xs font-medium text-slate-500">Device PIN</p>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <span className="text-3xl font-bold tracking-widest text-[#FF9F43]">{device.pin}</span>
                  <button
                    onClick={() => copyPin(device.pin)}
                    className="rounded-lg bg-white px-2 py-1 text-xs font-medium text-slate-600 shadow-sm hover:bg-slate-50"
                  >
                    {copiedPin === device.pin ? "✓ Copied" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleRegeneratePin(device.id)}
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  🔄 New PIN
                </button>
                <button
                  onClick={() => handleRemoveDevice(device.id)}
                  className="flex-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  🗑 Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* How it works */}
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
        <h2 className="mb-4 text-lg font-bold text-slate-800">How Device Setup Works</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col items-center text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-lg font-bold text-amber-600">1</span>
            <p className="mt-2 text-sm font-medium text-slate-700">Register Device</p>
            <p className="mt-1 text-xs text-slate-500">Name each tablet and get a unique 4-digit PIN</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-lg font-bold text-orange-600">2</span>
            <p className="mt-2 text-sm font-medium text-slate-700">Open on Tablet</p>
            <p className="mt-1 text-xs text-slate-500">On the tablet, tap &ldquo;Launch Devices&rdquo; and enter the PIN</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-lg font-bold text-green-600">3</span>
            <p className="mt-2 text-sm font-medium text-slate-700">Children Play</p>
            <p className="mt-1 text-xs text-slate-500">Kids tap their avatar and start learning!</p>
          </div>
        </div>
      </div>

      <div className="mt-8 text-right">
        <SignOutButton />
      </div>
    </PortalLayout>
  );
}
