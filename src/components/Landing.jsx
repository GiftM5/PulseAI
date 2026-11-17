import React from 'react'
import { motion } from 'framer-motion'
import { Heart, Activity, Zap, Smartphone, Brain, Shield, ArrowRight, ChevronRight } from 'lucide-react'

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const features = [
  { icon: Heart, title: 'Heart Rate', description: 'Real-time monitoring via smartphone camera' },
  { icon: Activity, title: 'SpO₂ Levels', description: 'Blood oxygen saturation tracking' },
  { icon: Zap, title: 'HRV Analysis', description: 'Heart rate variability insights' },
  { icon: Brain, title: 'AI Predictions', description: 'Early risk detection with machine learning' },
  { icon: Smartphone, title: 'No Wearables', description: 'Just your smartphone — no extra devices' },
  { icon: Shield, title: 'Health Insights', description: 'Actionable recommendations for better health' },
]

const Landing = ({ onGetStarted, onOpenClinic, onOpenLearn, onOpenLogin, user }) => {
  return (
    <div className="relative min-h-[calc(100vh-5rem)] flex flex-col justify-center overflow-hidden">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.06]"
        style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)' }}
      />

      <motion.div
        className="relative z-10 max-w-5xl mx-auto px-4 py-16 text-center"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div variants={fadeUp} className="flex justify-center mb-8">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-dark-300 font-medium tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            AI-Powered Health Monitoring
          </span>
        </motion.div>

        {/* Logo + Title */}
        <motion.div variants={fadeUp} className="flex items-center justify-center gap-4 mb-6">
          <motion.img
            src="/pulse-icon.svg"
            alt="PulseAI"
            className="w-14 h-14"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <h1 className="text-6xl md:text-8xl font-bold text-white tracking-tight" style={{ letterSpacing: '-0.03em' }}>
            PulseAI
          </h1>
        </motion.div>

        <motion.p variants={fadeUp} className="text-lg md:text-xl text-dark-400 max-w-2xl mx-auto leading-relaxed mb-12 text-balance">
          Next-generation health monitoring that empowers you to track vital signs using just your smartphone.
          AI-powered insights detect risks before they become critical.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-20">
          {user ? (
            <>
              <motion.button
                onClick={onGetStarted}
                className="btn-primary flex items-center gap-2 text-base px-8 py-3.5"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Open Dashboard <ArrowRight className="w-4 h-4" />
              </motion.button>
              <motion.button
                onClick={onOpenClinic}
                className="btn-ghost flex items-center gap-2 text-base px-8 py-3.5"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                AI Clinic <ChevronRight className="w-4 h-4" />
              </motion.button>
            </>
          ) : (
            <>
              <motion.button
                onClick={onOpenLogin}
                className="btn-primary flex items-center gap-2 text-base px-8 py-3.5"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </motion.button>
              <motion.button
                onClick={onOpenLearn}
                className="btn-ghost text-base px-8 py-3.5"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Learn More
              </motion.button>
            </>
          )}
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={stagger}
        >
          {features.map((feature, i) => (
            <motion.div
              key={i}
              className="glass-card-hover p-6 rounded-xl text-left group"
              variants={fadeUp}
              whileHover={{ y: -4 }}
            >
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors duration-300 shrink-0">
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                  <p className="text-sm text-dark-400 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer note */}
        <motion.p variants={fadeUp} className="mt-12 text-xs text-dark-600 tracking-wide">
          No wearables required &nbsp;·&nbsp; Real-time monitoring &nbsp;·&nbsp; AI-powered insights
        </motion.p>
      </motion.div>
    </div>
  )
}

export default Landing
