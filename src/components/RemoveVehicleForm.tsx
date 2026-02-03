'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface RemoveVehicleFormProps {
  onVehicleRemoved: () => void;
  onOutput: (message: string, type: 'success' | 'error' | 'info') => void;
}

export default function RemoveVehicleForm({ onVehicleRemoved, onOutput }: RemoveVehicleFormProps) {
  const [slotNo, setSlotNo] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const slotNumber = parseInt(slotNo);
    
    if (isNaN(slotNumber) || slotNumber <= 0) {
      onOutput('Please enter a valid slot number', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotNo: slotNumber }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        onOutput(data.message, 'success');
        onVehicleRemoved();
        // Reset form
        setSlotNo('');
      } else {
        onOutput(data.message || 'Failed to remove vehicle', 'error');
      }
    } catch {
      onOutput('Network error. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="font-display text-2xl font-bold text-white mb-6">Remove Vehicle</h2>

      {/* Slot Number Input */}
      <div>
        <label htmlFor="slotNo" className="block text-gray-300 mb-2 font-medium">
          Slot Number
        </label>
        <input
          id="slotNo"
          type="number"
          min="1"
          value={slotNo}
          onChange={(e) => setSlotNo(e.target.value)}
          placeholder="Enter slot number"
          className="w-full bg-white/10 border-2 border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors"
          required
        />
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={isLoading}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed glow-hover"
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
            <X className="w-5 h-5" />
            Remove Vehicle
          </>
        )}
      </motion.button>

      <p className="text-gray-400 text-sm text-center">
        Enter the slot number to free up the parking space
      </p>
    </form>
  );
}
