import { Link } from "react-router-dom";
import { Globe } from "@/components/ui/globe";
import { ThemeSwitcher } from "@/components/CustomComponents/ThemeSwitcher";
import { Compass, Shield, Zap, AlertTriangle, ArrowRight } from "lucide-react";
import { motion, useScroll, useTransform, useSpring } from "motion/react";
import { useRef } from "react";

export default function HomePage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });
  const springScrollProgress = useSpring(scrollYProgress, {
    damping: 30,
    stiffness: 100,
  });

  return (
    <div ref={containerRef} className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Fixed Top Navigation with Animated Underline */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--background)]/50 backdrop-blur-xl border-b border-[var(--border)]/30">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3"
          >
            <motion.div
              className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
            >
              <Compass className="w-5 h-5 text-white" />
            </motion.div>
            <span className="font-bold text-lg tracking-tight">Fleet</span>
          </motion.div>

          <div className="flex items-center gap-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="hidden md:flex items-center gap-8"
            >
              {["Dashboard", "About", "Contact"].map((item, i) => (
                <motion.div key={item} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
                  <a href="#" className="relative text-sm font-medium group">
                    {item}
                    <motion.span
                      className="absolute bottom-0 left-0 h-0.5 bg-[var(--primary)]"
                      initial={{ width: 0 }}
                      whileHover={{ width: "100%" }}
                      transition={{ duration: 0.3 }}
                    />
                  </a>
                </motion.div>
              ))}
            </motion.div>
            <ThemeSwitcher />
          </div>
        </div>
      </nav>

      {/* Hero Section - Full Screen Cinematic */}
      <section className="relative min-h-screen pt-20 px-4 overflow-hidden flex items-center justify-center">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 -z-10">
          <motion.div
            className="absolute top-0 -right-40 w-96 h-96 bg-[var(--primary)]/20 rounded-full blur-3xl"
            animate={{
              y: [0, 50, 0],
              x: [0, 30, 0],
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-0 -left-40 w-96 h-96 bg-[var(--accent)]/20 rounded-full blur-3xl"
            animate={{
              y: [0, -50, 0],
              x: [0, -30, 0],
            }}
            transition={{ duration: 8, repeat: Infinity, delay: 1 }}
          />
        </div>

        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-80px)]">
          {/* Left Content - Staggered Text Reveal */}
          <motion.div className="flex flex-col justify-center relative z-10">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-block w-fit mb-6"
            >
              <motion.div
                className="px-4 py-2 bg-[var(--primary)]/10 rounded-full border border-[var(--primary)]/20 flex items-center gap-2 cursor-pointer group"
                whileHover={{ backgroundColor: "var(--primary)/20" }}
              >
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-2 h-2 bg-[var(--primary)] rounded-full" />
                <span className="text-sm font-medium text-[var(--primary)]">Maritime Excellence</span>
              </motion.div>
            </motion.div>

            {/* Main Headline - Split Text Animation */}
            <div className="space-y-2 mb-6">
              {["Control", "the", "Waters"].map((word, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1 + i * 0.15 }}
                >
                  <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold leading-tight tracking-tight">
                    {i === 0 ? (
                      <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">{word}</span>
                    ) : i === 1 ? (
                      <span>{word}</span>
                    ) : (
                      <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--primary)] bg-clip-text text-transparent">{word}</span>
                    )}
                  </h1>
                </motion.div>
              ))}
            </div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-lg text-[var(--foreground-muted)] mb-8 leading-relaxed max-w-lg"
            >
              Real-time command and control for maritime operations. Monitor live vessel data, manage restricted zones, and respond instantly to critical events.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 mb-12"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/dashboard"
                  className="px-8 py-4 bg-[var(--primary)] text-white font-semibold rounded-lg shadow-lg shadow-[var(--primary)]/30 hover:shadow-[var(--primary)]/50 flex items-center justify-center gap-2 transition-all group"
                >
                  <Zap className="w-5 h-5" />
                  <span>Launch Command</span>
                  <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                    <ArrowRight className="w-4 h-4" />
                  </motion.span>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/register"
                  className="px-8 py-4 bg-[var(--card)] border border-[var(--border)] font-semibold rounded-lg hover:bg-[var(--secondary)] transition-all flex items-center justify-center gap-2"
                >
                  <Shield className="w-5 h-5" />
                  Create Account
                </Link>
              </motion.div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="grid grid-cols-3 gap-4"
            >
              {[
                { value: "15", label: "Active Ships" },
                { value: "1Hz", label: "Update Rate" },
                { value: "<500ms", label: "Latency" },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  className="p-4 bg-[var(--card)]/50 rounded-lg border border-[var(--border)]/30 backdrop-blur"
                  whileHover={{ y: -5, borderColor: "var(--primary)" }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <motion.div className="text-2xl font-bold text-[var(--primary)]" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.9 + i * 0.1 }}>
                    {stat.value}
                  </motion.div>
                  <div className="text-xs text-[var(--foreground-muted)] mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right - Globe with Parallax */}
          <motion.div
            className="relative h-[500px] md:h-[600px] hidden lg:block"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{
              y: useTransform(scrollYProgress, [0, 0.3], [0, 100]),
            }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-b from-[var(--primary)]/20 to-transparent rounded-3xl blur-2xl"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <Globe className="relative z-10" />
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-[var(--foreground-muted)]">Scroll to explore</span>
            <div className="w-1 h-6 border border-[var(--foreground-muted)] rounded-full flex justify-center">
              <motion.div className="w-0.5 h-1.5 bg-[var(--foreground-muted)] rounded-full" animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }} />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section - Scroll Animations */}
      <section className="py-32 px-4 border-b border-[var(--border)]/30 bg-gradient-to-b from-transparent via-[var(--primary)]/5 to-transparent">
        <div className="container mx-auto">
          {/* Section Header */}
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Mission Critical
              <motion.span className="block bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">
                Capabilities
              </motion.span>
            </h2>
            <p className="text-[var(--foreground-muted)] max-w-2xl mx-auto text-lg">Enterprise-grade tools for high-stakes operations</p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Compass,
                title: "Live Tracking",
                description: "Real-time GPS positioning with sub-meter accuracy",
                color: "blue",
              },
              {
                icon: Shield,
                title: "Geofencing",
                description: "Intelligent zone management with instant alerts",
                color: "red",
              },
              {
                icon: AlertTriangle,
                title: "Crisis Management",
                description: "Instant distress analysis and response coordination",
                color: "purple",
              },
              {
                icon: Zap,
                title: "Live Sync",
                description: "Sub-second latency WebSocket updates",
                color: "green",
              },
            ].map((feature, i) => {
              const Icon = feature.icon;
              const colorMap: { [key: string]: string } = {
                blue: "blue",
                red: "red",
                purple: "purple",
                green: "green",
              };
              const color = colorMap[feature.color];
              return (
                <motion.div
                  key={i}
                  className={`group bg-[var(--card)]/50 backdrop-blur p-8 rounded-2xl border border-[var(--border)]/30 cursor-pointer relative overflow-hidden`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  whileHover={{ y: -8, borderColor: "var(--primary)" }}
                >
                  {/* Gradient Background on Hover */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br from-${color}-500/10 to-transparent opacity-0 group-hover:opacity-100 -z-10`}
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                  />

                  <motion.div
                    className={`w-12 h-12 bg-${color}-100 dark:bg-${color}-900/30 text-${color}-600 dark:text-${color}-400 rounded-xl flex items-center justify-center mb-6`}
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Icon className="w-6 h-6" />
                  </motion.div>

                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-[var(--foreground-muted)] text-sm leading-relaxed">{feature.description}</p>

                  <motion.div
                    className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]"
                    initial={{ width: 0 }}
                    whileHover={{ width: "100%" }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Advanced Fleet Management Section */}
      <section className="py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <motion.div
            className="absolute top-1/2 right-0 w-96 h-96 bg-[var(--primary)]/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 6, repeat: Infinity }}
          />
        </div>

        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Image with Hover Animation */}
            <motion.div
              className="relative rounded-3xl overflow-hidden shadow-2xl"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              whileHover={{ scale: 1.02 }}
            >
              <motion.img
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop"
                alt="Maritime Fleet Operations"
                className="w-full h-auto object-cover"
              />
              <motion.div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </motion.div>

            {/* Content with Staggered List */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
            >
              <motion.h2 className="text-5xl md:text-6xl font-bold mb-8">
                Real-Time
                <motion.span className="block bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">
                  Fleet Control
                </motion.span>
              </motion.h2>

              <p className="text-lg text-[var(--foreground-muted)] mb-8 leading-relaxed">
                Monitor vessel telemetry with precision. Track speed, fuel consumption, cargo status, and environmental conditions from one unified dashboard.
              </p>

              <div className="space-y-4">
                {[
                  "GPS positioning with sub-meter accuracy",
                  "Multi-vessel coordination and routing",
                  "Automated weather-based alerts",
                  "Historical data analysis and reporting",
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex items-start gap-4 group cursor-pointer"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ x: 10 }}
                  >
                    <motion.div
                      className="w-6 h-6 bg-[var(--primary)] rounded-full flex items-center justify-center mt-1 flex-shrink-0"
                      whileHover={{ scale: 1.2 }}
                    >
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </motion.div>
                    <span className="text-[var(--foreground)]">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Enterprise Security Section */}
      <section className="py-32 px-4 border-y border-[var(--border)]/30 bg-gradient-to-b from-[var(--primary)]/5 to-transparent">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Content with Staggered List */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
            >
              <motion.h2 className="text-5xl md:text-6xl font-bold mb-8">
                Enterprise
                <motion.span className="block bg-gradient-to-r from-[var(--accent)] to-[var(--primary)] bg-clip-text text-transparent">
                  Security
                </motion.span>
              </motion.h2>

              <p className="text-lg text-[var(--foreground-muted)] mb-8 leading-relaxed">
                Your fleet data is protected with military-grade encryption and role-based access control. Every command is logged and auditable.
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
                    className="flex items-start gap-4 group cursor-pointer"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ x: 10 }}
                  >
                    <motion.div
                      className="w-6 h-6 bg-[var(--accent)] rounded-full flex items-center justify-center mt-1 flex-shrink-0"
                      whileHover={{ scale: 1.2 }}
                    >
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </motion.div>
                    <span className="text-[var(--foreground)]">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Image with Hover Animation */}
            <motion.div
              className="relative rounded-3xl overflow-hidden shadow-2xl"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              whileHover={{ scale: 1.02 }}
            >
              <motion.img
                src="https://images.unsplash.com/photo-1526374965328-7f5ae4e8b723?w=800&h=600&fit=crop"
                alt="Security and Command Center"
                className="w-full h-auto object-cover"
              />
              <motion.div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 px-4 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 -z-10">
          <motion.div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-[var(--primary)]/10 via-transparent to-transparent"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 6, repeat: Infinity }}
          />
        </div>

        <div className="container mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Ready to Take
              <motion.span className="block bg-gradient-to-r from-[var(--primary)] via-[var(--accent)] to-[var(--primary)] bg-clip-text text-transparent">
                Command?
              </motion.span>
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-[var(--foreground-muted)] max-w-2xl mx-auto mb-12 text-lg"
          >
            Join operators who trust Fleet Command for real-time maritime operations. Start managing your fleet with precision and confidence.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/dashboard"
                className="px-10 py-5 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white font-bold rounded-xl shadow-xl shadow-[var(--primary)]/30 hover:shadow-[var(--primary)]/50 inline-flex items-center justify-center gap-3 transition-all"
              >
                <Zap className="w-5 h-5" />
                Launch Dashboard
                <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                  <ArrowRight className="w-4 h-4" />
                </motion.span>
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/register"
                className="px-10 py-5 bg-[var(--card)] border-2 border-[var(--border)] font-bold rounded-xl hover:bg-[var(--secondary)] transition-all inline-flex items-center justify-center gap-3"
              >
                <Shield className="w-5 h-5" />
                Create Your Account
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)]/30 py-12 px-4 bg-[var(--card)]/50 backdrop-blur">
        <div className="container mx-auto">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div>
              <h4 className="font-bold mb-4">Fleet Command</h4>
              <p className="text-[var(--foreground-muted)] text-sm">Real-time maritime operations platform</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-[var(--foreground-muted)]">
                <li>
                  <a href="#" className="hover:text-[var(--primary)]">
                    Dashboard
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[var(--primary)]">
                    Documentation
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <p className="text-sm text-[var(--foreground-muted)]">operations@fleet.command</p>
            </div>
          </motion.div>

          <motion.div className="border-t border-[var(--border)]/30 pt-8 text-center text-[var(--foreground-muted)] text-sm" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <p>&copy; 2026 Fleet Command System. All rights reserved.</p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
