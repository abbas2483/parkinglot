'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info } from 'lucide-react';

interface OutputPanelProps {
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function OutputPanel({ message, type }: OutputPanelProps) {
  if (!message) return null;

  const config = {
    success: {
      icon: CheckCircle,
      color: 'text-green-400',
      bg: 'bg-green-600/20',
      border: 'border-green-500/50',
    },
    error: {
      icon: XCircle,
      color: 'text-red-400',
      bg: 'bg-red-600/20',
      border: 'border-red-500/50',
    },
    info: {
      icon: Info,
      color: 'text-blue-400',
      bg: 'bg-blue-600/20',
      border: 'border-blue-500/50',
    },
  };

  const { icon: Icon, color, bg, border } = config[type];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className={`mt-6 glass-dark rounded-xl p-4 border-2 ${border} ${bg}`}
      >
        <div className="flex items-start gap-3">
          <Icon className={`w-5 h-5 ${color} flex-shrink-0 mt-0.5`} />
          <div className="flex-1">
            <h3 className={`font-semibold ${color} mb-1`}>
              {type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Info'}
            </h3>
            <p className="text-gray-300 text-sm">{message}</p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
