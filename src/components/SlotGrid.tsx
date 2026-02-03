'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ParkingSlot } from '@/types/parking.types';
import { Car, Zap, Shield, Square, Search, Filter } from 'lucide-react';

interface SlotGridProps {
  slots: ParkingSlot[];
  onSlotClick?: (slot: ParkingSlot & { id: string }) => void;
}

export default function SlotGrid({ slots, onSlotClick }: SlotGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'occupied'>('all');
  const [filterEV, setFilterEV] = useState(false);
  const [filterCovered, setFilterCovered] = useState(false);

  const handleSlotClick = (slot: ParkingSlot & { id: string }) => {
    if (onSlotClick && !slot.isOccupied) {
      onSlotClick(slot);
    }
  };

  // Filtered and searched slots
  const filteredSlots = useMemo(() => {
    return slots.filter(slot => {
      // Search filter (slot number or vehicle number)
      const matchesSearch = searchTerm === '' || 
        slot.slotNo.toString().includes(searchTerm) ||
        (slot.vehicleNumber && slot.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()));

      // Status filter
      const matchesStatus = filterStatus === 'all' ||
        (filterStatus === 'available' && !slot.isOccupied) ||
        (filterStatus === 'occupied' && slot.isOccupied);

      // EV filter
      const matchesEV = !filterEV || slot.isEVCharging;

      // Covered filter
      const matchesCovered = !filterCovered || slot.isCovered;

      return matchesSearch && matchesStatus && matchesEV && matchesCovered;
    });
  }, [slots, searchTerm, filterStatus, filterEV, filterCovered]);

  if (slots.length === 0) {
    return (
      <div className="glass-dark rounded-2xl p-12 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Square className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <h3 className="font-display text-xl text-gray-400 mb-2">No Parking Slots</h3>
          <p className="text-gray-500">Add your first parking slot to get started</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="glass-dark rounded-2xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-white">Parking Slots</h2>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Filter className="w-4 h-4" />
          <span>{filteredSlots.length} of {slots.length}</span>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl p-4">
        <p className="text-gray-300 text-sm leading-relaxed">
          💡 <span className="font-semibold text-white">To book your slot:</span> Click on any available slot (green) and enter your vehicle details to reserve it instantly.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by slot number or vehicle number..."
            className="w-full bg-white/10 border-2 border-white/20 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {/* Status Filter */}
          <button
            type="button"
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filterStatus === 'all'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('available')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filterStatus === 'available'
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            🟢 Available
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('occupied')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filterStatus === 'occupied'
                ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            🔴 Occupied
          </button>

          {/* Feature Filters */}
          <button
            type="button"
            onClick={() => setFilterEV(!filterEV)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              filterEV
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            <Zap className="w-4 h-4" />
            EV Only
          </button>
          <button
            type="button"
            onClick={() => setFilterCovered(!filterCovered)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              filterCovered
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            <Shield className="w-4 h-4" />
            Covered Only
          </button>
        </div>
      </div>
      
      {/* Slot Grid */}
      {filteredSlots.length === 0 ? (
        <div className="text-center py-12">
          <Search className="w-12 h-12 mx-auto mb-3 text-gray-500" />
          <p className="text-gray-400">No slots match your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-8 gap-3">
          <AnimatePresence>
            {filteredSlots.map((slot, index) => {
              const slotWithId = slot as ParkingSlot & { id: string };
              return (
              <motion.div
                key={slot.slotNo}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2, delay: index * 0.01 }}
                whileHover={{ scale: 1.1, y: -3 }}
                onClick={() => handleSlotClick(slotWithId)}
                className={`relative aspect-square p-2 rounded-lg border-2 transition-all ${!slot.isOccupied ? 'cursor-pointer' : 'cursor-not-allowed'} ${
                  slot.isOccupied
                    ? 'bg-red-600/30 border-red-500 shadow-red-500/20'
                    : 'bg-green-600/30 border-green-500 shadow-green-500/20 glow-hover'
                } shadow-lg`}
                title={`Slot #${slot.slotNo} - ${slot.isOccupied ? 'Occupied' : 'Click to book'}${slot.vehicleNumber ? ' • ' + slot.vehicleNumber : ''}${slot.distanceFromEntry ? ' • ' + slot.distanceFromEntry + 'm' : ''}`}
              >
                {/* Slot Number */}
                <div className="font-display text-base font-bold text-white text-center mb-1">
                  {slot.slotNo}
                </div>

                {/* Status Indicator Dot */}
                <div className="flex justify-center mb-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${slot.isOccupied ? 'bg-red-400' : 'bg-green-400'} animate-pulse`} />
                </div>

                {/* Feature Icons Row */}
                <div className="flex justify-center gap-1 items-center">
                  {slot.isEVCharging && (
                    <div className="w-4 h-4 bg-blue-500/40 rounded flex items-center justify-center">
                      <Zap className="w-2.5 h-2.5 text-blue-300" strokeWidth={3} />
                    </div>
                  )}
                  {slot.isCovered && (
                    <div className="w-4 h-4 bg-purple-500/40 rounded flex items-center justify-center">
                      <Shield className="w-2.5 h-2.5 text-purple-300" strokeWidth={3} />
                    </div>
                  )}
                </div>

                {/* Car Icon for Occupied */}
                {slot.isOccupied && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute top-1 right-1"
                  >
                    <Car className="w-3 h-3 text-red-300" strokeWidth={2.5} />
                  </motion.div>
                )}

                {/* Distance Badge */}
                {slot.distanceFromEntry && !slot.isOccupied && (
                  <div className="absolute bottom-1 right-1 bg-black/50 rounded px-1 text-[8px] text-gray-300">
                    {slot.distanceFromEntry}m
                  </div>
                )}
              </motion.div>
            );})}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
