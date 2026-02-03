'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Shield, Square, Sparkles, ArrowRight, AlertTriangle, X } from 'lucide-react';

interface QuickAssignProps {
  onOutput: (message: string, type: 'success' | 'error' | 'info') => void;
  onAssigned: () => void;
}

export default function QuickAssign({ onOutput, onAssigned }: QuickAssignProps) {
  const [selectedType, setSelectedType] = useState<'normal' | 'covered' | 'ev'>('normal');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [assignedSlot, setAssignedSlot] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const parkingTypes = [
    {
      id: 'normal' as const,
      icon: Square,
      label: 'Normal Parking',
      description: 'Standard open parking',
      color: 'gray',
      gradient: 'from-gray-600 to-gray-500',
      borderColor: 'border-gray-400',
      bgColor: 'bg-gray-600/20',
    },
    {
      id: 'covered' as const,
      icon: Shield,
      label: 'Covered Parking',
      description: 'Weather protected',
      color: 'purple',
      gradient: 'from-purple-600 to-purple-500',
      borderColor: 'border-purple-400',
      bgColor: 'bg-purple-600/20',
    },
    {
      id: 'ev' as const,
      icon: Zap,
      label: 'EV Charging',
      description: 'Electric vehicle ready',
      color: 'blue',
      gradient: 'from-blue-600 to-cyan-500',
      borderColor: 'border-blue-400',
      bgColor: 'bg-blue-600/20',
    },
  ];

  const handleQuickAssign = async () => {
    if (!vehicleNumber.trim()) {
      onOutput('Please enter your vehicle number', 'error');
      return;
    }

    setIsLoading(true);
    setShowSuccess(false);

    try {
      const response = await fetch('/api/park', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          needsEV: selectedType === 'ev',
          needsCover: selectedType === 'covered',
          vehicleNumber: vehicleNumber.trim(),
        }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        setAssignedSlot(data.data.slotNo);
        setShowSuccess(true);
        onOutput(
          `🎉 Success! Assigned Slot #${data.data.slotNo} for ${vehicleNumber}`,
          'success'
        );
        
        // Auto-hide success after 5 seconds
        setTimeout(() => {
          setShowSuccess(false);
          setVehicleNumber('');
          setAssignedSlot(null);
        }, 5000);

        onAssigned();
      } else {
        // No slots available - Show modal popup
        setErrorMessage(data.message || 'No preferred slot available');
        setShowErrorModal(true);
      }
    } catch {
      setErrorMessage('Network error occurred');
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedTypeData = parkingTypes.find((t) => t.id === selectedType)!;

  return (
    <>
      {/* Error Modal Popup */}
      <AnimatePresence>
        {showErrorModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setShowErrorModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-dark rounded-2xl p-8 max-w-md w-full border-2 border-red-500/50 relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowErrorModal(false)}
                className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-10 h-10 text-red-400" />
                </div>
              </div>

              {/* Title */}
              <h3 className="font-display text-2xl font-bold text-white text-center mb-3">
                No Slot Available
              </h3>

              {/* Error Message */}
              <p className="text-gray-300 text-center mb-6">
                {errorMessage}. There is no preferred slot available according to your preference.
              </p>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowErrorModal(false);
                    // Scroll to manual booking grid
                    document.getElementById('parking-grid')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Try Manual Booking
                </button>
                
                <button
                  onClick={() => setShowErrorModal(false)}
                  className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-colors"
                >
                  Contact Admin
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-dark rounded-2xl p-6 mb-8 border-2 border-purple-500/30"
      >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center"
        >
          <Sparkles className="w-6 h-6 text-white" />
        </motion.div>
        <div>
          <h2 className="font-display text-2xl font-bold text-white">Quick Auto-Assign</h2>
          <p className="text-gray-400 text-sm">Let AI find your perfect spot instantly!</p>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && assignedSlot && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="mb-6 bg-gradient-to-r from-green-600/30 to-emerald-600/30 border-2 border-green-500 rounded-xl p-6 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 10 }}
            className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <span className="text-4xl">✓</span>
          </motion.div>
          <h3 className="font-display text-2xl font-bold text-white mb-2">
            Slot Assigned!
          </h3>
          <p className="text-green-200 text-lg mb-1">
            Your vehicle <span className="font-bold">{vehicleNumber}</span>
          </p>
          <p className="text-green-200 text-lg">
            has been parked in <span className="font-display text-3xl font-bold text-white">Slot #{assignedSlot}</span>
          </p>
        </motion.div>
      )}

      {!showSuccess && (
        <>
          {/* Parking Type Selection */}
          <div className="mb-6">
            <label className="block text-white font-semibold mb-3 text-sm">
              Select Your Parking Preference
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {parkingTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedType === type.id;
                
                return (
                  <motion.button
                    key={type.id}
                    type="button"
                    onClick={() => setSelectedType(type.id)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`relative p-4 rounded-xl transition-all ${
                      isSelected
                        ? `bg-gradient-to-br ${type.gradient} border-2 ${type.borderColor} shadow-lg shadow-${type.color}-500/20`
                        : 'bg-white/5 border-2 border-white/10 hover:border-white/20'
                    }`}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="selectedType"
                        className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl"
                      />
                    )}
                    <div className="relative flex flex-col items-center text-center">
                      <Icon
                        className={`w-8 h-8 mb-2 ${
                          isSelected ? 'text-white' : 'text-gray-400'
                        }`}
                      />
                      <p className={`font-semibold text-sm ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                        {type.label}
                      </p>
                      <p className={`text-xs mt-1 ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                        {type.description}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Vehicle Number Input */}
          <div className="mb-6">
            <label className="block text-white font-semibold mb-2 text-sm">
              Vehicle Registration Number
            </label>
            <input
              type="text"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
              placeholder="e.g., ABC-1234"
              className="w-full bg-white/10 border-2 border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors uppercase font-mono text-lg"
              onKeyPress={(e) => e.key === 'Enter' && handleQuickAssign()}
            />
          </div>

          {/* Auto-Assign Button */}
          <motion.button
            type="button"
            onClick={handleQuickAssign}
            disabled={isLoading || !vehicleNumber.trim()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
              isLoading || !vehicleNumber.trim()
                ? 'bg-gray-600 cursor-not-allowed opacity-50'
                : `bg-gradient-to-r ${selectedTypeData.gradient} hover:shadow-xl hover:shadow-${selectedTypeData.color}-500/30`
            } text-white`}
          >
            {isLoading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-6 h-6 border-3 border-white border-t-transparent rounded-full"
                />
                <span>Finding Your Perfect Spot...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6" />
                <span>Auto-Assign Me a Spot!</span>
                <ArrowRight className="w-6 h-6" />
              </>
            )}
          </motion.button>

          {/* Helper Text */}
          <p className="text-center text-gray-400 text-sm mt-4">
            💡 Can&apos;t find the right spot? Try <span className="text-purple-400 font-semibold">manual selection</span> below
          </p>
        </>
      )}
      </motion.div>
    </>
  );
}
