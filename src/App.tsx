/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Scissors, 
  Calendar, 
  Clock, 
  Phone, 
  User, 
  Check, 
  ChevronRight, 
  X, 
  ClipboardList,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Service, Barber, Appointment } from "./types";
import { SERVICES, BARBERS, TIME_SLOTS, getServiceIcon } from "./constants";

// --- Persistent Storage Hook ---
function useStorage<T>(key: string, defaultValue: T): [T, (val: T) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const set = useCallback(
    (val: T) => {
      setState(val);
      try {
        localStorage.setItem(key, JSON.stringify(val));
      } catch {}
    },
    [key]
  );

  return [state, set];
}

// --- Utilities ---
const today = () => new Date().toISOString().split("T")[0];
const fmtDate = (d: string) => new Date(d + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
const fmtTime = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return `${h > 12 ? h - 12 : h || 12}:${m.toString().padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
};

export default function App() {
  const [appointments, setAppointments] = useStorage<Appointment[]>("barberpro_appointments", []);
  const [activeTab, setActiveTab] = useState<"book" | "appointments">("book");
  const [toast, setToast] = useState<{ show: boolean; msg: string }>({ show: false, msg: "" });

  // Booking state
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedBarberId, setSelectedBarberId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // Appointments filter
  const [filter, setFilter] = useState<"upcoming" | "past" | "all">("upcoming");

  const showToast = (msg: string) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: "" }), 3000);
  };

  const isSlotBooked = (date: string, time: string, barberId: string | null) => {
    return appointments.some(
      (a) => a.date === date && a.time === time && (!barberId || !a.barberId || a.barberId === barberId)
    );
  };

  const canBook = useMemo(() => 
    !!selectedServiceId && !!selectedDate && !!selectedTime && name.trim().length > 0 && phone.trim().length >= 7,
  [selectedServiceId, selectedDate, selectedTime, name, phone]);

  const bookAppointment = () => {
    if (!canBook || !selectedServiceId || !selectedTime) return;
    
    const apt: Appointment = {
      id: Date.now(),
      name: name.trim(),
      phone: phone.trim(),
      serviceId: selectedServiceId,
      barberId: selectedBarberId,
      date: selectedDate,
      time: selectedTime,
      createdAt: new Date().toISOString(),
    };
    
    setAppointments([...appointments, apt]);
    showToast("🎉 Appointment booked! See you soon.");
    
    // Reset
    setSelectedServiceId(null);
    setSelectedBarberId(null);
    setSelectedDate("");
    setSelectedTime(null);
    setName("");
    setPhone("");
  };

  const cancelAppointment = (id: number) => {
    setAppointments(appointments.filter((a) => a.id !== id));
    showToast("Appointment cancelled.");
  };

  // Step progress calculation
  const currentStep = useMemo(() => {
    if (!selectedServiceId) return 0;
    if (!selectedDate || !selectedTime) return 1;
    if (!name || !phone) return 2;
    return 3;
  }, [selectedServiceId, selectedDate, selectedTime, name, phone]);

  const steps = ["Service", "Details", "Customer"];

  // Filtered appointments
  const now = today();
  const filteredApts = useMemo(() => {
    return appointments
      .filter((a) => {
        if (filter === "upcoming") return a.date >= now;
        if (filter === "past") return a.date < now;
        return true;
      })
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  }, [appointments, filter, now]);

  const currentService = SERVICES.find((s) => s.id === selectedServiceId);
  const currentBarber = BARBERS.find((b) => b.id === selectedBarberId);

  return (
    <div className="flex flex-col min-h-screen bg-cream selection:bg-gold selection:text-ink">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between h-20 px-6 sm:px-12 bg-ink border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center text-ink shadow-lg shadow-gold/20">
            <Scissors className="w-6 h-6" />
          </div>
          <div className="font-serif text-2xl font-black text-cream tracking-tight">
            Barber<span className="text-gold">Pro</span>
          </div>
        </div>
        
        <nav className="flex items-center bg-white/5 p-1 rounded-full border border-white/10">
          <button 
            onClick={() => setActiveTab("book")}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              activeTab === "book" ? "bg-gold text-ink shadow-md" : "text-mid hover:text-cream"
            }`}
          >
            New Booking
          </button>
          <button 
            onClick={() => setActiveTab("appointments")}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 relative ${
              activeTab === "appointments" ? "bg-gold text-ink shadow-md" : "text-mid hover:text-cream"
            }`}
          >
            My Schedule
            {appointments.filter(a => a.date >= now).length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-accent text-[10px] text-white items-center justify-center font-bold">
                  {appointments.filter(a => a.date >= now).length}
                </span>
              </span>
            )}
          </button>
        </nav>
      </header>

      <main className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === "book" ? (
            <motion.div 
              key="book"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-[1fr_420px] h-full overflow-y-auto lg:overflow-hidden"
            >
              {/* Left Side: Booking Wizard */}
              <div className="p-8 lg:p-12 overflow-y-auto bg-warm/30 lg:h-[calc(100vh-80px)]">
                {/* Step Indicators */}
                <div className="flex items-center justify-between mb-12 max-w-2xl mx-auto px-4">
                  {steps.map((s, i) => (
                    <div key={s} className="flex items-center flex-1 last:flex-none">
                      <div className="flex flex-col items-center gap-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 border-2 ${
                          i < currentStep 
                            ? "bg-red-accent border-red-accent text-white" 
                            : i === currentStep 
                            ? "bg-ink border-ink text-white" 
                            : "bg-white border-border-custom text-mid"
                        }`}>
                          {i < currentStep ? <Check className="w-5 h-5" /> : i + 1}
                        </div>
                        <span className={`text-[10px] uppercase tracking-widest font-bold ${
                          i <= currentStep ? "text-ink" : "text-mid"
                        }`}>
                          {s}
                        </span>
                      </div>
                      {i < steps.length - 1 && (
                        <div className={`flex-1 h-[2px] mx-4 -mt-6 transition-all duration-700 ${
                          i < currentStep ? "bg-red-accent" : "bg-border-custom"
                        }`} />
                      )}
                    </div>
                  ))}
                </div>

                <div className="max-w-4xl mx-auto space-y-16">
                  {/* Section 1: Services */}
                  <section>
                    <div className="mb-8">
                      <span className="text-xs font-bold uppercase tracking-[0.2em] text-red-accent">Step 1</span>
                      <h2 className="font-serif text-3xl font-bold mt-1">Select a Service</h2>
                      <p className="text-mid text-sm mt-2">Choose the treatment you deserve today.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                      {SERVICES.map((s) => (
                        <motion.button
                          whileHover={{ y: -4 }}
                          whileTap={{ scale: 0.98 }}
                          key={s.id}
                          onClick={() => { setSelectedServiceId(s.id); setSelectedTime(null); }}
                          className={`relative group p-6 rounded-2xl border-2 text-left transition-all duration-300 ${
                            selectedServiceId === s.id 
                              ? "bg-white border-red-accent shadow-xl shadow-red-accent/5" 
                              : "bg-white border-border-custom hover:border-red-accent/30 hover:shadow-lg"
                          }`}
                        >
                          {selectedServiceId === s.id && (
                            <div className="absolute top-4 right-4 bg-red-accent text-white p-1 rounded-full">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                          <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center transition-colors ${
                            selectedServiceId === s.id ? "bg-red-accent text-white" : "bg-warm text-ink"
                          }`}>
                            {getServiceIcon(s.icon)}
                          </div>
                          <h3 className="font-bold text-lg">{s.label}</h3>
                          <p className="text-xs text-mid mb-4 line-clamp-1">{s.desc}</p>
                          <div className="flex items-center justify-between pt-4 border-t border-border-custom">
                            <span className="font-bold text-red-accent text-xl">${s.price}</span>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-mid flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {s.duration} MIN
                            </span>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </section>

                  {/* Section 2: Barber */}
                  {selectedServiceId && (
                    <motion.section
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="mb-8">
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-red-accent">Step 2 (Optional)</span>
                        <h2 className="font-serif text-3xl font-bold mt-1">Pick a Master</h2>
                        <p className="text-mid text-sm mt-2">Our specialists are here to make you look your best.</p>
                      </div>
                      <div className="flex flex-wrap gap-4">
                        <motion.button
                          whileHover={{ y: -2 }}
                          onClick={() => setSelectedBarberId(null)}
                          className={`flex items-center gap-4 px-6 py-4 rounded-xl border-2 transition-all min-w-[200px] ${
                            !selectedBarberId 
                              ? "bg-white border-red-accent shadow-lg shadow-red-accent/5 font-bold" 
                              : "bg-white border-border-custom text-mid hover:border-red-accent/30"
                          }`}
                        >
                          <div className="w-10 h-10 rounded-full bg-warm flex items-center justify-center text-ink">
                            <Sparkles className="w-5 h-5" />
                          </div>
                          <div className="text-left">
                            <div className="text-sm font-bold">Any Professional</div>
                            <div className="text-[10px] text-mid tracking-tight uppercase">Best Availability</div>
                          </div>
                        </motion.button>
                        {BARBERS.map((b) => (
                          <motion.button
                            whileHover={{ y: -2 }}
                            key={b.id}
                            onClick={() => { setSelectedBarberId(b.id); setSelectedTime(null); }}
                            className={`flex items-center gap-4 px-6 py-4 rounded-xl border-2 transition-all min-w-[200px] ${
                              selectedBarberId === b.id 
                                ? "bg-white border-red-accent shadow-lg shadow-red-accent/5 font-bold" 
                                : "bg-white border-border-custom text-mid hover:border-red-accent/30"
                            }`}
                          >
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                              style={{ backgroundColor: b.color }}
                            >
                              {b.avatar}
                            </div>
                            <div className="text-left">
                              <div className="text-sm font-bold">{b.name}</div>
                              <div className="text-[10px] text-mid tracking-tight uppercase">{b.specialty}</div>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </motion.section>
                  )}

                  {/* Section 3: Date & Time */}
                  {selectedServiceId && (
                    <motion.section
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="mb-8">
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-red-accent">Step 3</span>
                        <h2 className="font-serif text-3xl font-bold mt-1">When should we expect you?</h2>
                        <p className="text-mid text-sm mt-2">Select a date and available time slot.</p>
                      </div>
                      <div className="space-y-8">
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="relative group">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-mid group-focus-within:text-red-accent transition-colors" />
                            <input
                              type="date"
                              min={today()}
                              value={selectedDate}
                              onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime(null); }}
                              className="pl-12 pr-6 py-4 rounded-xl border-2 border-border-custom bg-white appearance-none outline-none focus:border-red-accent transition-all text-sm font-bold min-w-[260px]"
                            />
                          </div>
                        </div>

                        <AnimatePresence>
                          {selectedDate && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-4"
                            >
                              {TIME_SLOTS.map((t) => {
                                const booked = isSlotBooked(selectedDate, t, selectedBarberId);
                                return (
                                  <button
                                    key={t}
                                    disabled={booked}
                                    onClick={() => setSelectedTime(t)}
                                    className={`py-3 rounded-lg text-xs font-bold tracking-tighter transition-all duration-200 border-2 ${
                                      booked 
                                        ? "bg-warm/50 text-mid/30 border-warm cursor-not-allowed line-through" 
                                        : selectedTime === t 
                                        ? "bg-ink border-ink text-white scale-105 shadow-lg" 
                                        : "bg-white border-border-custom text-ink hover:border-red-accent"
                                    }`}
                                  >
                                    {fmtTime(t)}
                                  </button>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.section>
                  )}
                </div>
              </div>

              {/* Right Side: Order Summary & Form */}
              <aside className="bg-ink text-cream p-10 flex flex-col lg:h-[calc(100vh-80px)] overflow-y-auto">
                <h2 className="font-serif text-2xl text-gold mb-10 flex items-center gap-3">
                  <ClipboardList className="w-6 h-6" /> Your Journey
                </h2>

                <div className="space-y-6 flex-1">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-4 border-b border-white/5">
                      <span className="text-xs uppercase tracking-widest text-mid font-bold">Service</span>
                      <span className="text-sm font-medium flex items-center gap-2">
                        {currentService ? (
                          <><div className="text-gold">{getServiceIcon(currentService.icon)}</div> {currentService.label}</>
                        ) : (
                          <span className="text-white/20 italic">Select service...</span>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-4 border-b border-white/5">
                      <span className="text-xs uppercase tracking-widest text-mid font-bold">Barber</span>
                      <span className="text-sm font-medium">
                        {currentBarber ? currentBarber.name : (selectedServiceId ? "Best professional" : "—")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-4 border-b border-white/5">
                      <span className="text-xs uppercase tracking-widest text-mid font-bold">Scheduled</span>
                      <div className="text-right">
                        <span className="block text-sm font-medium">
                          {selectedDate ? fmtDate(selectedDate) : <span className="text-white/20 italic">Select date...</span>}
                        </span>
                        <span className="block text-xs text-gold font-bold">
                          {selectedTime ? fmtTime(selectedTime) : ""}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 pb-4 flex justify-between items-end border-t border-gold/20">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.2em] text-mid font-bold mb-1">Estimated Total</div>
                      <div className="font-serif text-5xl font-black text-gold">
                        {currentService ? `$${currentService.price}` : "—"}
                      </div>
                    </div>
                    {currentService && (
                      <div className="text-white/40 text-[10px] uppercase tracking-widest text-right">
                        Inc. VAT &<br />Complimentary Drink
                      </div>
                    )}
                  </div>

                  <div className="space-y-6 pt-10">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-mid">Full Name</label>
                      <input 
                        placeholder="John Wick"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-sm focus:border-gold outline-none transition-all placeholder:text-white/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-mid">Contact Number</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                        <input 
                          type="tel"
                          placeholder="+1 234 567 890"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-5 py-4 text-sm focus:border-gold outline-none transition-all placeholder:text-white/10"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-12">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={!canBook}
                    onClick={bookAppointment}
                    className={`w-full py-5 rounded-2xl font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all duration-300 ${
                      canBook 
                        ? "bg-red-accent text-white shadow-xl shadow-red-accent/20 hover:bg-red-dark cursor-pointer" 
                        : "bg-white/5 text-mid cursor-not-allowed"
                    }`}
                  >
                    {canBook ? (
                      <>Confirm Experience <ChevronRight className="w-5 h-5" /></>
                    ) : (
                      "Complete Booking Details"
                    )}
                  </motion.button>
                  <p className="text-center text-[10px] text-white/20 mt-4 uppercase tracking-[0.1em]">
                    Instant confirmation • Cancel anytime up to 2h before
                  </p>
                </div>
              </aside>
            </motion.div>
          ) : (
            /* Appointments Tab */
            <motion.div 
              key="appointments"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-5xl mx-auto px-6 py-12 w-full overflow-y-auto h-[calc(100vh-80px)]"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12">
                <div>
                  <h1 className="font-serif text-4xl font-bold tracking-tight">Your Schedule</h1>
                  <p className="text-mid mt-2">Manage your upcoming and past grooming sessions.</p>
                </div>
                <div className="flex p-1 bg-warm rounded-xl border border-border-custom">
                  {(["upcoming", "past", "all"] as const).map((f) => (
                    <button 
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                        filter === f ? "bg-ink text-white shadow-md" : "text-mid hover:text-ink"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {filteredApts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-3xl border-2 border-dashed border-border-custom">
                  <div className="w-20 h-20 bg-warm rounded-full flex items-center justify-center mb-6">
                    <Calendar className="w-10 h-10 text-mid opacity-30" />
                  </div>
                  <h3 className="font-bold text-xl">No Sessions Found</h3>
                  <p className="text-mid text-sm mt-2 max-w-xs">You don't have any appointments in your {filter} list yet.</p>
                  <button 
                    onClick={() => setActiveTab("book")}
                    className="mt-8 text-red-accent font-bold uppercase tracking-widest text-xs hover:underline"
                  >
                    Start your transformation now →
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredApts.map((a) => {
                    const s = SERVICES.find((sv) => sv.id === a.serviceId);
                    const b = BARBERS.find((br) => br.id === a.barberId);
                    const isUpcoming = a.date >= now;
                    
                    return (
                      <motion.div 
                        layout
                        key={a.id} 
                        className="bg-white rounded-3xl p-8 border-2 border-border-custom hover:border-red-accent/30 transition-all flex flex-col sm:flex-row justify-between items-start gap-6 group"
                      >
                        <div className="space-y-4 flex-1">
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-warm rounded-full text-[10px] font-bold uppercase tracking-wider text-mid">
                            {isUpcoming ? <span className="w-1.5 h-1.5 rounded-full bg-red-accent animate-pulse" /> : null}
                            {isUpcoming ? "Confirmed" : "Completed"}
                          </div>
                          <div>
                            <h4 className="font-serif text-2xl font-bold tracking-tight">{a.name}</h4>
                            <div className="flex items-center gap-2 text-red-accent font-bold text-sm mt-1">
                              {s ? getServiceIcon(s.icon) : null}
                              {s?.label}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-x-6 gap-y-2 pt-4 border-t border-border-custom">
                            <div className="flex items-center gap-2 text-xs font-medium text-mid">
                              <Calendar className="w-4 h-4" /> {fmtDate(a.date)}
                            </div>
                            <div className="flex items-center gap-2 text-xs font-medium text-mid text-gold">
                              <Clock className="w-4 h-4" /> {fmtTime(a.time)}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] text-white font-bold opacity-80`} style={{ backgroundColor: b?.color || '#1a1009' }}>
                              {b?.avatar || "?"}
                            </div>
                            <span className="text-xs font-bold text-ink/60">
                              With {b?.name || "Professional"}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 self-stretch sm:self-auto min-w-[100px]">
                          <div className="text-2xl font-serif font-black text-ink mb-auto">${s?.price}</div>
                          {isUpcoming && (
                            <button 
                              onClick={() => cancelAppointment(a.id)}
                              className="w-full sm:w-auto px-4 py-2 border-2 border-border-custom rounded-xl text-[10px] font-bold uppercase tracking-widest text-mid hover:border-red-accent hover:text-red-accent transition-all"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Toast Notification */}
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 transform ${
        toast.show ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
      }`}>
        <div className="bg-ink text-gold px-8 py-4 rounded-2xl shadow-2xl border-l-4 border-gold flex items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-gold animate-ping" />
          <span className="text-sm font-bold tracking-wide">{toast.msg}</span>
        </div>
      </div>
    </div>
  );
}

