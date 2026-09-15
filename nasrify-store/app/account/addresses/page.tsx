"use client";

import React, { useState, useEffect, useCallback } from "react";

interface AddressRecord {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postalCode: string | null;
  isDefault: boolean;
}

export default function AccountAddressesPage(): React.JSX.Element {
  const [addresses, setAddresses] = useState<AddressRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressRecord | null>(null);

  // Form State
  const [label, setLabel] = useState("Home");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("Pakistan");
  const [postalCode, setPostalCode] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchAddresses = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/customer/addresses");
      if (res.ok) {
        const data = (await res.json()) as { addresses?: AddressRecord[] };
        setAddresses(data.addresses || []);
      }
    } catch (err) {
      console.error("Failed to load addresses:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const openCreateModal = () => {
    setEditingAddress(null);
    setLabel("Home");
    setFullName("");
    setPhone("");
    setAddress("");
    setCity("");
    setCountry("Pakistan");
    setPostalCode("");
    setIsDefault(addresses.length === 0);
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (addr: AddressRecord) => {
    setEditingAddress(addr);
    setLabel(addr.label);
    setFullName(addr.fullName);
    setPhone(addr.phone);
    setAddress(addr.address);
    setCity(addr.city);
    setCountry(addr.country || "Pakistan");
    setPostalCode(addr.postalCode || "");
    setIsDefault(addr.isDefault);
    setFormError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const payload = {
        label,
        fullName,
        phone,
        address,
        city,
        country,
        postalCode: postalCode || null,
        isDefault,
      };

      const url = editingAddress
        ? `/api/customer/addresses/${editingAddress.id}`
        : "/api/customer/addresses";
      const method = editingAddress ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error || "Failed to save address");
      }

      setModalOpen(false);
      fetchAddresses();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Error saving address");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await fetch(`/api/customer/addresses/${id}/default`, { method: "PUT" });
      fetchAddresses();
    } catch (err) {
      console.error("Set default failed:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      await fetch(`/api/customer/addresses/${id}`, { method: "DELETE" });
      fetchAddresses();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
        <div>
          <h1 className="text-2xl font-black text-[#3C0561] dark:text-white tracking-tight">
            Saved Addresses
          </h1>
          <p className="text-xs text-slate-500 dark:text-purple-300/80 mt-0.5">
            Manage your destination shipping addresses for expedited 1-click checkout
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-5 py-2.5 rounded-xl bg-[#960DF2] hover:bg-[#850bd8] text-white font-extrabold text-xs shadow-md shadow-purple-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>+ Add New Address</span>
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 rounded-3xl bg-purple-100/50 dark:bg-purple-950/40 animate-pulse" />
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-purple-100 dark:border-purple-900/40 bg-white dark:bg-[#1E0230] shadow-sm">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-900/60 text-[#960DF2] dark:text-[#EACFFC] mb-4">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
          </div>
          <h3 className="text-base font-extrabold text-[#3C0561] dark:text-white">No Saved Addresses</h3>
          <p className="text-xs text-slate-500 dark:text-purple-300/70 mt-1 mb-6 max-w-sm mx-auto">
            Save your home, office, or training facility address to speed up order checkouts.
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center px-6 py-2.5 rounded-xl bg-[#960DF2] hover:bg-[#850bd8] text-white font-extrabold text-xs shadow-md shadow-purple-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Add First Address &rarr;
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-6 rounded-3xl border relative shadow-sm transition flex flex-col justify-between ${
                addr.isDefault
                  ? "border-[#960DF2] bg-purple-50/30 dark:bg-[#2A0344]/50 ring-2 ring-[#960DF2]/25"
                  : "border-purple-100 dark:border-purple-900/40 bg-white dark:bg-[#1E0230]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 dark:bg-purple-900/60 text-[#960DF2] dark:text-[#EACFFC]">
                    {addr.label || "Home"}
                  </span>
                  {addr.isDefault && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-[#960DF2] text-white shadow-sm">
                      Default
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {addr.fullName}
                </h3>
                <p className="text-xs text-slate-500 dark:text-purple-300/70 mt-0.5">{addr.phone}</p>
                <p className="text-xs text-slate-600 dark:text-purple-200/90 mt-2.5 leading-relaxed">
                  {addr.address}
                </p>
                <p className="text-xs text-slate-600 dark:text-purple-200/90 font-semibold">
                  {addr.city}, {addr.country} {addr.postalCode ? `(${addr.postalCode})` : ""}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-purple-100 dark:border-purple-800/60 flex items-center justify-between text-xs">
                <div>
                  {!addr.isDefault && (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(addr.id)}
                      className="text-xs font-bold text-slate-500 hover:text-[#960DF2] dark:text-purple-300 dark:hover:text-white transition"
                    >
                      Set as Default
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => openEditModal(addr)}
                    className="font-bold text-[#960DF2] dark:text-[#EACFFC] hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(addr.id)}
                    className="font-bold text-rose-500 hover:text-rose-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#1E0230] border border-purple-200 dark:border-purple-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-purple-100 dark:border-purple-900/40">
              <h3 className="text-base font-black text-[#3C0561] dark:text-white">
                {editingAddress ? "Edit Saved Address" : "Add New Address"}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300">
                {formError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-purple-300 mb-1">
                    Label (e.g. Home, Gym)
                  </label>
                  <input
                    type="text"
                    required
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50/40 dark:bg-[#2A0344] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#960DF2]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-purple-300 mb-1">
                    Full Recipient Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50/40 dark:bg-[#2A0344] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#960DF2]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-purple-300 mb-1">
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0300-1234567"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50/40 dark:bg-[#2A0344] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#960DF2]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-purple-300 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House #, Street, Area"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50/40 dark:bg-[#2A0344] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#960DF2]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-purple-300 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Lahore, Karachi"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50/40 dark:bg-[#2A0344] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#960DF2]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-purple-300 mb-1">
                    Postal Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="e.g. 54000"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50/40 dark:bg-[#2A0344] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#960DF2]"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 rounded text-[#960DF2] border-purple-300 dark:border-purple-700 focus:ring-[#960DF2]"
                />
                <span>Set as default delivery address</span>
              </label>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-purple-900/40 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold bg-[#960DF2] hover:bg-[#850bd8] text-white rounded-xl shadow-md shadow-purple-500/20 transition disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
