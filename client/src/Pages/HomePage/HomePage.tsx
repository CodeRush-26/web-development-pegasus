import { Link } from "react-router-dom";
import { Globe } from "@/components/ui/globe";
import { ThemeSwitcher } from "@/components/CustomComponents/ThemeSwitcher";
import { Compass, Shield, Zap, AlertTriangle } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Fixed Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border)]">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">Fleet Command</span>
          </div>
          <ThemeSwitcher />
        </div>
      </nav>

      {/* Hero Section with Globe */}
      <section className="relative min-h-screen pt-20 px-4 overflow-hidden bg-gradient-to-b from-[var(--background)] via-[var(--background)] to-[var(--secondary)]/30 dark:to-[var(--secondary)]/10">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 -right-40 w-80 h-80 bg-[var(--primary)]/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-40 -left-40 w-80 h-80 bg-[var(--accent)]/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-80px)]">
          {/* Left Content */}
          <div className="flex flex-col justify-center">
            <div className="inline-block w-fit mb-6">
              <div className="px-4 py-2 bg-[var(--primary)]/10 rounded-full border border-[var(--primary)]/20 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[var(--primary)]" />
                <span className="text-sm font-medium text-[var(--primary)]">Maritime Command Center</span>
              </div>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">
              Control the Waters
            </h1>

            <p className="text-lg text-[var(--foreground-muted)] mb-8 leading-relaxed max-w-lg">
              A real-time command and control platform for maritime operations in the Strait of Hormuz. Monitor 15 cargo ships, manage restricted zones, and respond to distress alerts with AI-powered intelligence.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link
                to="/dashboard"
                className="px-8 py-4 bg-[var(--primary)] text-white font-semibold rounded-lg hover:bg-[var(--primary)]/90 transition-all shadow-lg shadow-[var(--primary)]/30 hover:shadow-[var(--primary)]/50 flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5" />
                Open Command Center
              </Link>
              <Link
                to="/register"
                className="px-8 py-4 bg-[var(--card)] border border-[var(--border)] font-semibold rounded-lg hover:bg-[var(--secondary)] transition-all text-center"
              >
                Create Account
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-3xl font-bold text-[var(--primary)]">15</div>
                <div className="text-sm text-[var(--foreground-muted)]">Active Ships</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[var(--primary)]">1Hz</div>
                <div className="text-sm text-[var(--foreground-muted)]">Update Rate</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[var(--primary)]">&lt;500ms</div>
                <div className="text-sm text-[var(--foreground-muted)]">Latency</div>
              </div>
            </div>
          </div>

          {/* Right - Globe */}
          <div className="relative h-[500px] md:h-[600px] hidden lg:block">
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--primary)]/20 to-transparent rounded-3xl blur-2xl"></div>
            <Globe className="relative z-10" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 border-b border-[var(--border)] bg-[var(--secondary)]/50 dark:bg-[var(--secondary)]/10">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Mission Critical Features</h2>
            <p className="text-[var(--foreground-muted)] max-w-2xl mx-auto">
              Enterprise-grade capabilities for high-stakes maritime operations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="bg-[var(--card)] p-8 rounded-xl border border-[var(--border)] shadow-sm hover:shadow-lg hover:border-[var(--primary)]/50 transition-all group">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Live Tracking</h3>
              <p className="text-[var(--foreground-muted)] text-sm">
                Real-time position, speed, and heading data for all 15 vessels
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[var(--card)] p-8 rounded-xl border border-[var(--border)] shadow-sm hover:shadow-lg hover:border-[var(--primary)]/50 transition-all group">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Geofencing</h3>
              <p className="text-[var(--foreground-muted)] text-sm">
                Draw restricted zones and get automatic breach detection alerts
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[var(--card)] p-8 rounded-xl border border-[var(--border)] shadow-sm hover:shadow-lg hover:border-[var(--primary)]/50 transition-all group">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">AI Crisis Analysis</h3>
              <p className="text-[var(--foreground-muted)] text-sm">
                LLM-powered distress message parsing and severity prioritization
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-[var(--card)] p-8 rounded-xl border border-[var(--border)] shadow-sm hover:shadow-lg hover:border-[var(--primary)]/50 transition-all group">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Real-Time Sync</h3>
              <p className="text-[var(--foreground-muted)] text-sm">
                WebSocket-powered updates with sub-second latency across all clients
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Image Section - Maritime Operations */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1578574494640-8f5fcbdc0e98?w=600&h=400&fit=crop"
                alt="Maritime Fleet Operations"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
            </div>

            {/* Content */}
            <div>
              <h2 className="text-4xl font-bold mb-6">Advanced Fleet Management</h2>
              <p className="text-[var(--foreground-muted)] mb-6 text-lg">
                Monitor vessel telemetry in real-time with our sophisticated command center. Track speed, fuel consumption, cargo status, and environmental conditions all from one unified dashboard.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[var(--primary)] rounded-full"></div>
                  <span>GPS positioning with sub-meter accuracy</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[var(--primary)] rounded-full"></div>
                  <span>Multi-vessel coordination and routing</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[var(--primary)] rounded-full"></div>
                  <span>Automated weather-based alerts</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[var(--primary)] rounded-full"></div>
                  <span>Historical data analysis and reporting</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-24 px-4 bg-[var(--secondary)]/50 dark:bg-[var(--secondary)]/10 border-b border-[var(--border)]">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div>
              <h2 className="text-4xl font-bold mb-6">Enterprise Security</h2>
              <p className="text-[var(--foreground-muted)] mb-6 text-lg">
                Your fleet data is protected with military-grade encryption and role-based access control. Every command is logged and auditable.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[var(--primary)] rounded-full"></div>
                  <span>End-to-end encryption for all communications</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[var(--primary)] rounded-full"></div>
                  <span>JWT-based authentication and 2FA support</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[var(--primary)] rounded-full"></div>
                  <span>Comprehensive audit logging</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[var(--primary)] rounded-full"></div>
                  <span>GDPR and maritime compliance ready</span>
                </li>
              </ul>
            </div>

            {/* Image */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1526374965328-7f5ae4e8b723?w=600&h=400&fit=crop"
                alt="Security and Command Center"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-transparent to-[var(--primary)]/5">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Take Command?</h2>
          <p className="text-[var(--foreground-muted)] max-w-2xl mx-auto mb-12 text-lg">
            Join the operational network and start managing your fleet with precision, intelligence, and confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/dashboard"
              className="px-10 py-4 bg-[var(--primary)] text-white font-bold rounded-lg hover:bg-[var(--primary)]/90 transition-all shadow-xl shadow-[var(--primary)]/30 inline-flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5" />
              Access Dashboard
            </Link>
            <Link
              to="/register"
              className="px-10 py-4 bg-[var(--card)] border border-[var(--border)] font-bold rounded-lg hover:bg-[var(--secondary)] transition-all inline-flex items-center justify-center gap-2"
            >
              <Shield className="w-5 h-5" />
              Sign Up Now
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-12 px-4 bg-[var(--secondary)]/30 dark:bg-[var(--secondary)]/10">
        <div className="container mx-auto text-center text-[var(--foreground-muted)] text-sm">
          <p>&copy; 2026 Fleet Command System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
            <div>
              <div className="text-4xl font-bold text-[var(--primary)] mb-2">15</div>
              <div className="text-sm text-[var(--foreground-muted)] uppercase tracking-wider">Active Ships</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[var(--primary)] mb-2">1Hz</div>
              <div className="text-sm text-[var(--foreground-muted)] uppercase tracking-wider">Update Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[var(--primary)] mb-2">&lt;500ms</div>
              <div className="text-sm text-[var(--foreground-muted)] uppercase tracking-wider">Latency</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[var(--primary)] mb-2">24/7</div>
              <div className="text-sm text-[var(--foreground-muted)] uppercase tracking-wider">Monitoring</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Take Command?</h2>
          <p className="text-[var(--foreground-muted)] max-w-2xl mx-auto mb-10">
            Join the operational network and start managing your fleet with 
            precision and intelligence.
          </p>
          <Link
            to="/dashboard"
            className="px-10 py-4 bg-[var(--primary)] text-white font-bold rounded-lg hover:bg-[var(--primary)]/90 inline-block transition-all shadow-xl shadow-[var(--primary)]/20"
          >
            Access Dashboard
          </Link>
        </div>
      </section>
    </div>
  );
}
