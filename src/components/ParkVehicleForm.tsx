'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Car, Zap, Shield } from 'lucide-react';

interface ParkVehicleFormProps {
  onVehicleParked: () => void;
  onOutput: (message: string, type: 'success' | 'error' | 'info') => void;
}

export default function ParkVehicleForm({ onVehicleParked, onOutput }: ParkVehicleFormProps) {
  const [needsEV, setNeedsEV] = useState(false);
  const [needsCover, setNeedsCover] = useState(false);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate vehicle number
    if (!vehicleNumber.trim()) {
      onOutput('Please enter a vehicle registration number', 'error');
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await fetch('/api/park', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ needsEV, needsCover, vehicleNumber: vehicleNumber.trim() }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        onOutput(data.message, 'success');
        onVehicleParked();
        // Reset form
        setNeedsEV(false);
        setNeedsCover(false);
        setVehicleNumber('');
      } else {
        onOutput(data.message || 'No slot available', 'error');
      }
    } catch {
      onOutput('Network error. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="font-display text-2xl font-bold text-white mb-6">Park Your Vehicle</h2>

      {/* Vehicle Number Input */}
      <div>
        <label htmlFor="vehicleNumber" className="block text-gray-300 mb-2 font-medium">
          Vehicle Registration Number *
        </label>
        <input
          id="vehicleNumber"
          type="text"
          value={vehicleNumber}
          onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
          placeholder="e.g., ABC-1234 or XYZ9876"
          className="w-full bg-white/10 border-2 border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors uppercase"
          required
        />
      </div>

      {/* Vehicle Requirements */}
      <div className="space-y-4">
        {/* EV Requirement */}
        <motion.label
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${
            needsEV 
              ? 'bg-gradient-to-r from-blue-600/30 to-blue-500/30 border-2 border-blue-400' 
              : 'bg-white/5 border-2 border-white/10'
          }`}
        >
          <div className="flex items-center gap-3">
            <Zap className={`w-5 h-5 ${needsEV ? 'text-blue-400' : 'text-gray-400'}`} />
            <div>
              <p className="text-white font-medium">Electric Vehicle</p>
              <p className="text-gray-400 text-sm">Requires charging station</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={needsEV}
            onChange={(e) => setNeedsEV(e.target.checked)}
            className="w-5 h-5 accent-blue-500"
          />
        </motion.label>

        {/* Cover Requirement */}
        <motion.label
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${
            needsCover 
              ? 'bg-gradient-to-r from-purple-600/30 to-purple-500/30 border-2 border-purple-400' 
              : 'bg-white/5 border-2 border-white/10'
          }`}
        >
          <div className="flex items-center gap-3">
            <Shield className={`w-5 h-5 ${needsCover ? 'text-purple-400' : 'text-gray-400'}`} />
            <div>
              <p className="text-white font-medium">Covered Parking</p>
              <p className="text-gray-400 text-sm">Weather protection needed</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={needsCover}
            onChange={(e) => setNeedsCover(e.target.checked)}
            className="w-5 h-5 accent-purple-500"
          />
        </motion.label>
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={isLoading}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed glow-hover"
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
            <Car className="w-5 h-5" />
            Find & Park Vehicle
          </>
        )}
      </motion.button>

      <p className="text-gray-400 text-sm text-center">
        System will allocate the nearest available slot matching your requirements
      </p>
    </form>
  );
}
