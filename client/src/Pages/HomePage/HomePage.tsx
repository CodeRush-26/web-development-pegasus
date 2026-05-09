import { Link } from "react-router-dom";
import { ThemeSwitcher } from "@/components/CustomComponents/ThemeSwitcher";
import {
  Compass,
  Shield,
  Zap,
  AlertTriangle,
  ArrowRight,
  Menu,
  X,
} from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import { useState, useRef } from "react";

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const fleetRef = useRef(null);
  const securityRef = useRef(null);

  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const { scrollYProgress: fleetProgress } = useScroll({
    target: fleetRef,
    offset: ["start end", "end start"],
  });

  const { scrollYProgress: securityProgress } = useScroll({
    target: securityRef,
    offset: ["start end", "end start"],
  });

  const heroImageY = useTransform(heroProgress, [0, 1], [0, 100]);
  const fleetImageY = useTransform(fleetProgress, [0, 1], [50, -50]);
  const securityImageY = useTransform(securityProgress, [0, 1], [50, -50]);

  return (
    <div className="w-screen overflow-x-hidden min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Fixed Top Navigation - Clean and Professional */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--background)] border-b border-[var(--border)]">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8 py-4 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3"
          >
            <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center flex-shrink-0">
              <Compass className="w-5 h-5 text-[var(--primary-foreground)]" />
            </div>
            <span className="font-semibold text-lg tracking-tight">Fleet</span>
          </motion.div>

          <div className="flex items-center gap-4 md:gap-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="hidden md:flex items-center gap-8"
            >
              {["Dashboard", "About", "Contact"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-sm font-medium hover:text-[var(--primary)] transition-colors"
                >
                  {item}
                </a>
              ))}
            </motion.div>
            <ThemeSwitcher />
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden border-t border-[var(--border)] bg-[var(--card)]"
          >
            <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8 py-4 flex flex-col gap-4">
              {["Dashboard", "About", "Contact"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-sm font-medium hover:text-[var(--primary)] transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section - Clean and Professional */}
      <section
        className="relative pt-32 pb-16 md:pt-40 md:pb-24 px-4 md:px-6 lg:px-8 overflow-hidden mx-auto max-w-screen-2xl w-full"
        ref={heroRef}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div className="flex flex-col justify-center">
            {/* Status Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-block w-fit mb-6"
            >
              <div className="px-4 py-2 bg-[var(--primary)]/10 rounded-lg border border-[var(--primary)]/20 flex items-center gap-2">
                <div className="w-2 h-2 bg-[var(--primary)] rounded-full" />
                <span className="text-sm font-medium text-[var(--primary)]">
                  Real-time Fleet Management
                </span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-6">
                Command Your Fleet with Precision
              </h1>
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-[var(--muted-foreground)] mb-8 leading-relaxed max-w-lg"
            >
              Advanced maritime command center. Real-time vessel tracking,
              geofencing, crisis management, and fleet coordination all in one
              unified platform.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                to="/dashboard"
                className="px-8 py-4 bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold rounded-lg hover:bg-opacity-90 flex items-center justify-center gap-2 transition-all"
              >
                <Zap className="w-5 h-5" />
                Launch Dashboard
              </Link>
              <Link
                to="/register"
                className="px-8 py-4 border border-[var(--border)] font-semibold rounded-lg hover:bg-[var(--card)] transition-all flex items-center justify-center gap-2"
              >
                <Shield className="w-5 h-5" />
                Create Account
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-[var(--border)]"
            >
              {[
                { value: "99.9%", label: "Uptime" },
                { value: "<500ms", label: "Latency" },
                { value: "∞", label: "Scalability" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-[var(--primary)]">
                    {stat.value}
                  </div>
                  <div className="text-sm text-[var(--muted-foreground)] mt-2">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right - Parallax Image */}
          <motion.div
            className="hidden lg:block relative h-96 md:h-[500px]"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ y: heroImageY }}
          >
            <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1632745486688-e4d4cc4518f0?w=800&h=600&fit=crop"
                alt="Maritime Command Center"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section - Clean Grid */}
      <section className="py-16 md:py-24 px-4 md:px-6 lg:px-8 border-t border-[var(--border)] mx-auto max-w-screen-2xl w-full">
        <div>
          {/* Section Header */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Powerful Features
            </h2>
            <p className="text-[var(--muted-foreground)] max-w-2xl mx-auto text-lg">
              Everything you need for professional maritime command and control
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Compass,
                title: "Live Tracking",
                description:
                  "Real-time GPS positioning with sub-meter accuracy",
              },
              {
                icon: Shield,
                title: "Geofencing",
                description: "Intelligent zone management with instant alerts",
              },
              {
                icon: AlertTriangle,
                title: "Crisis Management",
                description:
                  "Instant distress analysis and response coordination",
              },
              {
                icon: Zap,
                title: "Live Sync",
                description: "Sub-second latency WebSocket updates",
              },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  className="p-6 bg-[var(--card)] rounded-xl border border-[var(--border)] hover:border-[var(--primary)] transition-colors"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <div className="w-12 h-12 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-[var(--muted-foreground)] text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Fleet Management Section */}
      <section
        className="py-16 md:py-24 px-4 md:px-6 lg:px-8 border-t border-[var(--border)] overflow-hidden mx-auto max-w-screen-2xl w-full"
        ref={fleetRef}
      >
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image Section - Parallax */}
            <motion.div
              className="relative rounded-2xl overflow-hidden shadow-xl h-96 md:h-[500px]"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              style={{ y: fleetImageY }}
            >
              <img
                src="https://images.unsplash.com/photo-1567521464027-f127ff144326?w=800&h=600&fit=crop"
                alt="Maritime Fleet Operations"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </motion.div>

            {/* Content Section */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Real-Time Fleet Control
              </h2>

              <p className="text-lg text-[var(--muted-foreground)] mb-8 leading-relaxed">
                Monitor vessel telemetry with precision. Track speed, fuel
                consumption, cargo status, and environmental conditions from one
                unified dashboard.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  "GPS positioning with sub-meter accuracy",
                  "Multi-vessel coordination and routing",
                  "Automated weather-based alerts",
                  "Historical data analysis and reporting",
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="w-6 h-6 bg-[var(--primary)] rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                    <span className="text-[var(--foreground)]">{item}</span>
                  </motion.div>
                ))}
              </div>

              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold rounded-lg hover:bg-opacity-90 transition-all"
              >
                Explore Features
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Enterprise Security Section */}
      <section
        className="py-16 md:py-24 px-4 md:px-6 lg:px-8 border-t border-[var(--border)] overflow-hidden mx-auto max-w-screen-2xl w-full"
        ref={securityRef}
      >
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Enterprise Security
              </h2>

              <p className="text-lg text-[var(--muted-foreground)] mb-8 leading-relaxed">
                Your fleet data is protected with military-grade encryption and
                role-based access control. Every command is logged and
                auditable.
              </p>

              <div className="space-y-4">
                {[
                  "End-to-end encryption for all communications",
                  "JWT-based authentication and 2FA support",
                  "Comprehensive audit logging",
                  "GDPR and maritime compliance ready",
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="w-6 h-6 bg-[var(--accent)] rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                    <span className="text-[var(--foreground)]">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Security Image - Parallax */}
            <motion.div
              className="relative rounded-2xl overflow-hidden shadow-xl h-96 md:h-[500px]"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              style={{ y: securityImageY }}
            >
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop"
                alt="Enterprise Security and Monitoring"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </motion.div>
          </div>
        </div>
      </section>
      {/* Final CTA Section - with Parallax Background */}
      <section className="relative py-24 md:py-32 px-4 md:px-6 lg:px-8 border-t border-[var(--border)] overflow-hidden mx-auto max-w-screen-2xl w-full">
        {/* Parallax Background Image */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <motion.img
            src="https://images.unsplash.com/photo-1498574336925-c6d647f08577?w=1600&h=600&fit=crop"
            alt="Ocean background"
            className="w-full h-full object-cover"
            style={{ opacity: 0.08 }}
          />
          <div
            className="absolute inset-0 bg-[var(--background)]"
            style={{ opacity: 0.9 }}
          />
        </div>

        <div className="text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Ready to Take Command?
            </h2>
            <p className="text-[var(--muted-foreground)] max-w-2xl mx-auto mb-10 text-lg">
              Join operators who trust Fleet Command for real-time maritime
              operations. Start managing your fleet with precision and
              confidence.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/dashboard"
                className="px-8 py-4 bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold rounded-lg hover:bg-opacity-90 inline-flex items-center justify-center gap-2 transition-all"
              >
                <Zap className="w-5 h-5" />
                Launch Dashboard
              </Link>
              <Link
                to="/register"
                className="px-8 py-4 border border-[var(--border)] font-semibold rounded-lg hover:bg-[var(--card)] inline-flex items-center justify-center gap-2 transition-all"
              >
                <Shield className="w-5 h-5" />
                Create Account
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-12 md:py-16 px-4 md:px-6 lg:px-8 bg-[var(--card)] mx-auto max-w-screen-2xl w-full">
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4">Fleet Command</h4>
              <p className="text-[var(--muted-foreground)] text-sm">
                Real-time maritime operations platform
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-[var(--muted-foreground)]">
                <li>
                  <a
                    href="#"
                    className="hover:text-[var(--primary)] transition-colors"
                  >
                    Dashboard
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[var(--primary)] transition-colors"
                  >
                    Documentation
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <p className="text-sm text-[var(--muted-foreground)]">
                operations@fleet.command
              </p>
            </div>
          </div>

          <div className="border-t border-[var(--border)] pt-8 text-center text-[var(--muted-foreground)] text-sm">
            <p>&copy; 2026 Fleet Command System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
