'use client';

import { motion } from 'framer-motion';
import { ParkingSlot } from '@/types/parking.types';
import { BarChart3, Square, Car, Zap, Shield } from 'lucide-react';

interface StatisticsProps {
  slots: ParkingSlot[];
}

export default function Statistics({ slots }: StatisticsProps) {
  const total = slots.length;
  const occupied = slots.filter(s => s.isOccupied).length;
  const available = total - occupied;
  const evSlots = slots.filter(s => s.isEVCharging).length;
  const coveredSlots = slots.filter(s => s.isCovered).length;
  const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;

  const stats = [
    { label: 'Total Slots', value: total, icon: Square, color: 'text-blue-400', bgColor: 'bg-blue-600/20' },
    { label: 'Available', value: available, icon: Car, color: 'text-green-400', bgColor: 'bg-green-600/20' },
    { label: 'Occupied', value: occupied, icon: Car, color: 'text-red-400', bgColor: 'bg-red-600/20' },
    { label: 'EV Charging', value: evSlots, icon: Zap, color: 'text-blue-400', bgColor: 'bg-blue-600/20' },
    { label: 'Covered', value: coveredSlots, icon: Shield, color: 'text-purple-400', bgColor: 'bg-purple-600/20' },
    { label: 'Occupancy', value: `${occupancyRate}%`, icon: BarChart3, color: 'text-yellow-400', bgColor: 'bg-yellow-600/20' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"
    >
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="glass-dark rounded-xl p-4 border border-white/10 glow-hover"
          >
            <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="font-display text-3xl font-bold text-white mb-1">
              {stat.value}
            </div>
            <div className="text-gray-400 text-sm">
              {stat.label}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
