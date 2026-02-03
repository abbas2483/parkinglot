'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Zap, Shield } from 'lucide-react';

interface AddSlotFormProps {
  onSlotAdded: () => void;
  onOutput: (message: string, type: 'success' | 'error' | 'info') => void;
}

export default function AddSlotForm({ onSlotAdded, onOutput }: AddSlotFormProps) {
  const [isCovered, setIsCovered] = useState(false);
  const [isEVCharging, setIsEVCharging] = useState(false);
  const [isNormalOpen, setIsNormalOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Ensure only one type is selected
  const handleTypeChange = (type: 'normal' | 'covered' | 'ev') => {
    if (type === 'normal') {
      setIsNormalOpen(true);
      setIsCovered(false);
      setIsEVCharging(false);
    } else if (type === 'covered') {
      setIsNormalOpen(false);
      setIsCovered(true);
      setIsEVCharging(false);
    } else if (type === 'ev') {
      setIsNormalOpen(false);
      setIsCovered(false);
      setIsEVCharging(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCovered, isEVCharging }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        onOutput(`Slot #${data.data.slotNo} added successfully!`, 'success');
        onSlotAdded();
        // Reset form to default
        setIsCovered(false);
        setIsEVCharging(false);
        setIsNormalOpen(true);
      } else {
        onOutput(data.message || 'Failed to add slot', 'error');
      }
    } catch {
      onOutput('Network error. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-white mb-2">Add New Parking Slot</h2>
        <p className="text-gray-400 text-sm">Manage your slots by adding new parking spaces with different features</p>
      </div>

      {/* Slot Type Selection */}
      <div className="space-y-4">
        {/* Normal/Open Parking Option */}
        <motion.label
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${
            isNormalOpen 
              ? 'bg-gradient-to-r from-gray-600/30 to-gray-500/30 border-2 border-gray-400' 
              : 'bg-white/5 border-2 border-white/10'
          }`}
        >
          <div className="flex items-center gap-3">
            <Plus className={`w-5 h-5 ${isNormalOpen ? 'text-gray-400' : 'text-gray-500'}`} />
            <div>
              <p className="text-white font-medium">Normal Open Parking</p>
              <p className="text-gray-400 text-sm">Standard outdoor parking space</p>
            </div>
          </div>
          <input
            type="radio"
            checked={isNormalOpen}
            onChange={() => handleTypeChange('normal')}
            name="parkingType"
            className="w-5 h-5 accent-gray-500"
          />
        </motion.label>

        {/* Covered Option */}
        <motion.label
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${
            isCovered 
              ? 'bg-gradient-to-r from-purple-600/30 to-purple-500/30 border-2 border-purple-400' 
              : 'bg-white/5 border-2 border-white/10'
          }`}
        >
          <div className="flex items-center gap-3">
            <Shield className={`w-5 h-5 ${isCovered ? 'text-purple-400' : 'text-gray-400'}`} />
            <div>
              <p className="text-white font-medium">Covered Parking</p>
              <p className="text-gray-400 text-sm">Protection from weather</p>
            </div>
          </div>
          <input
            type="radio"
            checked={isCovered}
            onChange={() => handleTypeChange('covered')}
            name="parkingType"
            className="w-5 h-5 accent-purple-500"
          />
        </motion.label>

        {/* EV Charging Option */}
        <motion.label
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${
            isEVCharging 
              ? 'bg-gradient-to-r from-blue-600/30 to-blue-500/30 border-2 border-blue-400' 
              : 'bg-white/5 border-2 border-white/10'
          }`}
        >
          <div className="flex items-center gap-3">
            <Zap className={`w-5 h-5 ${isEVCharging ? 'text-blue-400' : 'text-gray-400'}`} />
            <div>
              <p className="text-white font-medium">EV Charging Station</p>
              <p className="text-gray-400 text-sm">Electric vehicle compatible</p>
            </div>
          </div>
          <input
            type="radio"
            checked={isEVCharging}
            onChange={() => handleTypeChange('ev')}
            name="parkingType"
            className="w-5 h-5 accent-blue-500"
          />
        </motion.label>
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={isLoading}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed glow-hover"
      >
        {isLoading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            ⚙️
          </motion.div>
        ) : (
          <>
            <Plus className="w-5 h-5" />
            Add Parking Slot
          </>
        )}
      </motion.button>
    </form>
  );
}
