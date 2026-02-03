'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Car, LogOut, Activity } from 'lucide-react';

interface ActivityLogEntry {
  id: string;
  type: 'park' | 'remove';
  slotNo: number;
  vehicleNumber?: string;
  timestamp: string;
}

export default function ActivityLog() {
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // Load activities from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('parking-activity-log');
    if (stored) {
      try {
        setActivities(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to load activity log:', error);
      }
    }
  }, []);

  // Helper function to add activity (can be called from parent)
  const addActivity = (type: 'park' | 'remove', slotNo: number, vehicleNumber?: string) => {
    const newActivity: ActivityLogEntry = {
      id: Date.now().toString(),
      type,
      slotNo,
      vehicleNumber,
      timestamp: new Date().toISOString(),
    };

    const updated = [newActivity, ...activities].slice(0, 50); // Keep last 50
    setActivities(updated);
    localStorage.setItem('parking-activity-log', JSON.stringify(updated));
  };

  // Expose addActivity to parent via window (for demo purposes)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      interface WindowWithActivity extends Window {
        addParkingActivity?: typeof addActivity;
      }
      (window as WindowWithActivity).addParkingActivity = addActivity;
      return () => {
        delete (window as WindowWithActivity).addParkingActivity;
      };
    }
  }, []);

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="glass-dark rounded-2xl p-6">
      {/* Header */}
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-600 to-yellow-600 rounded-xl flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-white">Activity Log</h2>
            <p className="text-sm text-gray-400">{activities.length} recent activities</p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </div>

      {/* Activity List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-6 space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
              {activities.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No activities yet</p>
                </div>
              ) : (
                activities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center gap-3 p-3 rounded-xl ${
                      activity.type === 'park'
                        ? 'bg-green-600/10 border border-green-500/20'
                        : 'bg-red-600/10 border border-red-500/20'
                    }`}
                  >
                    {/* Icon */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      activity.type === 'park'
                        ? 'bg-green-600/30'
                        : 'bg-red-600/30'
                    }`}>
                      {activity.type === 'park' ? (
                        <Car className="w-4 h-4 text-green-400" />
                      ) : (
                        <LogOut className="w-4 h-4 text-red-400" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">
                        {activity.type === 'park' ? 'Vehicle Parked' : 'Vehicle Removed'}
                      </p>
                      <p className="text-gray-400 text-xs">
                        Slot #{activity.slotNo}
                        {activity.vehicleNumber && ` • ${activity.vehicleNumber}`}
                      </p>
                    </div>

                    {/* Timestamp */}
                    <div className="text-xs text-gray-500">
                      {formatTime(activity.timestamp)}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
