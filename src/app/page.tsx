'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ParkingSlot } from '@/types/parking.types';
import { Zap, Shield } from 'lucide-react';
import HeroSection from '@/components/HeroSection';
import AddSlotForm from '@/components/AddSlotForm';
import ParkVehicleForm from '@/components/ParkVehicleForm';
import RemoveVehicleForm from '@/components/RemoveVehicleForm';
import SlotGrid from '@/components/SlotGrid';
import Statistics from '@/components/Statistics';
import OutputPanel from '@/components/OutputPanel';
import ActivityLog from '@/components/ActivityLog';
import QuickAssign from '@/components/QuickAssign';
import { initializeParkingLot } from '@/services/parking-lot-initializer';

/**
 * 🏠 Home Page - The Control Center
 * 
 * This is mission control! Everything happens here:
 * - See all 40 parking spots at a glance
 * - Book a spot with one click
 * - Add new parking spaces
 * - Check live statistics
 * 
 * We use React hooks (useState, useEffect) to keep everything in sync.
 * When you book a spot, the grid updates instantly - no page refresh needed!
 */
export default function Home() {
  // State management - keeping track of everything that changes
  const [slots, setSlots] = useState<ParkingSlot[]>([]);  // All our parking spots
  const [outputMessage, setOutputMessage] = useState<string>('');  // Messages to show users
  const [outputType, setOutputType] = useState<'success' | 'error' | 'info'>('info');  // Message type
  const [activeTab, setActiveTab] = useState<'add' | 'park' | 'remove'>('add');  // Which tab is selected
  const [showBookingModal, setShowBookingModal] = useState(false);  // Show/hide booking popup
  const [selectedSlot, setSelectedSlot] = useState<(ParkingSlot & { id: string }) | null>(null);  // Which slot was clicked
  const [vehicleNumberInput, setVehicleNumberInput] = useState('');  // User's license plate

  // Fetch all parking slots from our database
  // This runs every time we need fresh data (after booking, adding, removing)
  const fetchSlots = async () => {
    try {
      const response = await fetch('/api/slots');
      const data = await response.json();
      if (data.status === 'success') {
        setSlots(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch slots:', error);
    }
  };

  // Initialize parking lot on first load
  // This creates all 40 parking spots automatically if they don't exist yet!
  useEffect(() => {
    const initialize = async () => {
      try {
        const result = await initializeParkingLot();
        if (result.success && result.count === 40) {
          handleOutput(result.message, 'success');
        }
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };

    initialize();
    fetchSlots();
  }, []);  // Empty array means "run this once when the page loads"

  // Show messages to users (success, error, or info)
  // Messages auto-disappear after 5 seconds - no manual closing needed!
  const handleOutput = (message: string, type: 'success' | 'error' | 'info') => {
    setOutputMessage(message);
    setOutputType(type);
    
    // Auto-clear after 5 seconds so users aren't confused by old messages
    setTimeout(() => {
      setOutputMessage('');
    }, 5000);
  };

  const handleSlotAdded = () => {
    fetchSlots();
  };

  const handleVehicleParked = () => {
    fetchSlots();
  };

  const handleVehicleRemoved = () => {
    fetchSlots();
  };

  const handleSlotClick = (slot: ParkingSlot & { id: string }) => {
    if (!slot.isOccupied) {
      setSelectedSlot(slot);
      setVehicleNumberInput(''); // Reset input when opening modal
      setShowBookingModal(true);
    }
  };

  const handleQuickBook = async () => {
    if (!selectedSlot || !vehicleNumberInput.trim()) {
      handleOutput('Please enter a vehicle number', 'error');
      return;
    }

    try {
      const response = await fetch('/api/park', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          slotNo: selectedSlot.slotNo,
          vehicleNumber: vehicleNumberInput.trim(),
          needsEV: selectedSlot.isEVCharging,
          needsCover: selectedSlot.isCovered
        }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        handleOutput(`Vehicle ${vehicleNumberInput} parked in slot ${selectedSlot.slotNo}`, 'success');
        setShowBookingModal(false);
        setVehicleNumberInput('');
        setSelectedSlot(null);
        fetchSlots();
      } else {
        handleOutput(data.message || 'Failed to book slot', 'error');
      }
    } catch {
      handleOutput('Network error. Please try again.', 'error');
    }
  };

  return (
    <div className="min-h-screen animated-gradient p-6 md:p-8">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          className="absolute top-20 left-20 w-96 h-96 bg-purple-500 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Hero Section */}
        <HeroSection />

        {/* Statistics */}
        <Statistics slots={slots} />

        {/* Quick Auto-Assign Section */}
        <QuickAssign onOutput={handleOutput} onAssigned={handleVehicleParked} />

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Left Column - Forms */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="glass-dark rounded-2xl p-6 glow-hover">
              {/* Tab Navigation */}
              <div className="flex gap-2 mb-6 bg-black/20 p-2 rounded-xl">
                {[
                  { id: 'add', label: 'Add Slot', icon: '+' },
                  { id: 'park', label: 'Park Vehicle', icon: '🚗' },
                  { id: 'remove', label: 'Remove', icon: '✕' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'add' | 'park' | 'remove')}
                    className="relative flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-colors"
                  >
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 text-white flex items-center justify-center gap-2">
                      <span>{tab.icon}</span>
                      <span className="hidden sm:inline">{tab.label}</span>
                    </span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                {activeTab === 'add' && (
                  <motion.div
                    key="add"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <AddSlotForm onSlotAdded={handleSlotAdded} onOutput={handleOutput} />
                  </motion.div>
                )}
                {activeTab === 'park' && (
                  <motion.div
                    key="park"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ParkVehicleForm onVehicleParked={handleVehicleParked} onOutput={handleOutput} />
                  </motion.div>
                )}
                {activeTab === 'remove' && (
                  <motion.div
                    key="remove"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <RemoveVehicleForm onVehicleRemoved={handleVehicleRemoved} onOutput={handleOutput} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Output Panel */}
            <OutputPanel message={outputMessage} type={outputType} />
          </motion.div>

          {/* Right Column - Slot Grid */}
          <motion.div
            id="parking-grid"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <SlotGrid slots={slots} onSlotClick={handleSlotClick} />
          </motion.div>
        </div>

        {/* Activity Log */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-8"
        >
          <ActivityLog />
        </motion.div>

        {/* Quick Booking Modal */}
        <AnimatePresence>
          {showBookingModal && selectedSlot && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
              onClick={() => setShowBookingModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="glass-dark rounded-2xl p-8 max-w-md w-full border-2 border-white/20"
              >
                <h2 className="font-display text-2xl font-bold text-white mb-4">
                  Book Slot #{selectedSlot.slotNo}
                </h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex gap-2">
                    {selectedSlot.isEVCharging && (
                      <span className="px-3 py-1 bg-blue-600/30 border border-blue-500/50 rounded-lg text-blue-300 text-sm flex items-center gap-1">
                        <Zap className="w-4 h-4" /> EV Charging
                      </span>
                    )}
                    {selectedSlot.isCovered && (
                      <span className="px-3 py-1 bg-purple-600/30 border border-purple-500/50 rounded-lg text-purple-300 text-sm flex items-center gap-1">
                        <Shield className="w-4 h-4" /> Covered
                      </span>
                    )}
                  </div>
                  
                  {selectedSlot.distanceFromEntry && (
                    <p className="text-gray-400 text-sm">
                      Distance from entry: {selectedSlot.distanceFromEntry}m
                    </p>
                  )}

                  <div>
                    <label className="block text-gray-300 mb-2 font-medium">
                      Vehicle Registration Number *
                    </label>
                    <input
                      type="text"
                      value={vehicleNumberInput}
                      onChange={(e) => setVehicleNumberInput(e.target.value.toUpperCase())}
                      placeholder="e.g., ABC-1234"
                      className="w-full bg-white/10 border-2 border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors uppercase"
                      autoFocus
                      onKeyPress={(e) => e.key === 'Enter' && handleQuickBook()}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowBookingModal(false);
                      setVehicleNumberInput('');
                      setSelectedSlot(null);
                    }}
                    className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleQuickBook}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-green-500/20"
                  >
                    Book Now
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center text-gray-400 text-sm mt-12"
        >
          <p>Built with Next.js, React, TypeScript & Framer Motion</p>
        </motion.footer>
      </div>
    </div>
  );
}
