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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            Saved Addresses
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Manage your delivery addresses for rapid checkout
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2 rounded-xl bg-[#18C729] text-black font-extrabold text-xs hover:bg-[#15af24] shadow-md shadow-[#18C729]/20 transition flex items-center gap-1.5"
        >
          <span>+ Add Address</span>
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 rounded-3xl bg-zinc-200 dark:bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#080e0a]">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-white/5 text-zinc-400 mb-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white">No Saved Addresses</h3>
          <p className="text-xs text-zinc-500 mt-1 mb-4">
            Save your home or office address to save time during checkout.
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-[#18C729] text-black font-bold text-xs hover:bg-[#15af24]"
          >
            Add First Address &rarr;
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-5 rounded-3xl border relative shadow-sm transition flex flex-col justify-between ${
                addr.isDefault
                  ? "border-[#18C729] bg-white dark:bg-[#080e0a] ring-1 ring-[#18C729]/30"
                  : "border-zinc-200 dark:border-white/10 bg-white dark:bg-[#080e0a]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-zinc-100 dark:bg-white/10 text-zinc-800 dark:text-zinc-200">
                    {addr.label || "Home"}
                  </span>
                  {addr.isDefault && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#18C729]/20 text-[#18C729]">
                      Default
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                  {addr.fullName}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">{addr.phone}</p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 line-clamp-2">
                  {addr.address}
                </p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  {addr.city}, {addr.country} {addr.postalCode ? `(${addr.postalCode})` : ""}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-white/5 flex items-center justify-between text-xs">
                <div>
                  {!addr.isDefault && (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(addr.id)}
                      className="text-zinc-500 hover:text-[#18C729] font-medium"
                    >
                      Set as Default
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => openEditModal(addr)}
                    className="font-bold text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(addr.id)}
                    className="font-bold text-red-600 hover:text-red-700"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c140e] p-6 sm:p-8 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-white/5">
              <h2 className="text-lg font-black text-zinc-900 dark:text-white">
                {editingAddress ? "Edit Saved Address" : "Add New Address"}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-black dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-500/10 text-red-500 text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Label
                  </label>
                  <select
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 text-xs text-zinc-900 dark:text-white"
                  >
                    <option value="Home">Home</option>
                    <option value="Office">Office</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Recipient name"
                    className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 text-xs text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0300-1234567"
                    className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 text-xs text-zinc-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Karachi, Lahore, etc."
                    className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 text-xs text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Street Address *
                </label>
                <textarea
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House/Apartment #, Street, Area"
                  className="w-full p-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 text-xs text-zinc-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    disabled
                    value={country}
                    className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-white/10 text-xs text-zinc-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="Optional"
                    className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 text-xs text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-300 text-[#18C729] focus:ring-[#18C729]"
                  />
                  Set as default shipping address
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-white/10 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#18C729] text-black font-extrabold text-xs hover:bg-[#15af24] shadow-md shadow-[#18C729]/20 transition disabled:opacity-50"
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
