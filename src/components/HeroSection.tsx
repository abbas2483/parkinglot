'use client';

import { motion } from 'framer-motion';
import { ParkingSquare, Zap, Shield, TrendingUp, Clock, MapPin } from 'lucide-react';

/**
 * 🎨 Hero Section - The Welcome Mat
 * 
 * This is the first thing people see when they open the app!
 * We want to make a great first impression with smooth animations,
 * feature highlights, and a clear message: "Parking just got easier!"
 * 
 * Fun fact: Those floating background gradients? They never stop moving!
 * Creates a living, breathing feel to the page. ✨
 */
export default function HeroSection() {
  // The cool features we're proud to show off
  const features = [
    {
      icon: Clock,
      title: 'Real-Time Tracking',
      description: 'Monitor slot availability instantly',
    },
    {
      icon: Zap,
      title: 'Smart Allocation',
      description: 'AI-powered nearest slot matching',
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Cloud-based data persistence',
    },
    {
      icon: TrendingUp,
      title: 'Live Analytics',
      description: 'Occupancy rates & statistics',
    },
  ];

  return (
    <section className="relative overflow-hidden py-20 mb-16">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-purple-600/10 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-blue-600/10 to-transparent rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto text-center">
        {/* Main Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="inline-flex mb-8"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur-xl opacity-50"
            />
            <div className="relative glass-dark p-6 rounded-2xl">
              <ParkingSquare className="w-20 h-20 text-purple-400" strokeWidth={1.5} />
            </div>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-display text-6xl md:text-8xl font-bold mb-6 leading-tight"
        >
          <span className="gradient-text">Smart Parking</span>
          <br />
          <span className="text-white">Reimagined</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-gray-300 text-xl md:text-2xl mb-4 max-w-3xl mx-auto font-light leading-relaxed"
        >
          Revolutionary parking lot management powered by intelligent algorithms
          and real-time cloud synchronization
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-gray-400 text-lg mb-12 max-w-2xl mx-auto"
        >
          Automatically allocate the nearest available slot matching your vehicle&apos;s
          requirements. EV charging, covered parking, and instant availability—all
          managed seamlessly.
        </motion.p>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="glass-dark p-6 rounded-xl border border-white/10 glow-hover"
              >
                <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Icon className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-white font-semibold mb-2 text-sm md:text-base">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-xs md:text-sm">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Stats Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="mt-12 glass-dark p-6 rounded-2xl border border-white/10 inline-flex items-center gap-6"
        >
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-400" />
            <span className="text-white font-semibold">Cloud-Powered</span>
          </div>
          <div className="w-px h-6 bg-white/20" />
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span className="text-white font-semibold">Real-Time Sync</span>
          </div>
          <div className="w-px h-6 bg-white/20" />
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <span className="text-white font-semibold">Smart Analytics</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
