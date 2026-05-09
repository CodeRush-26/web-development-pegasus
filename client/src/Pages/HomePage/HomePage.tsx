import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pt-16">
      {/* Hero Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-[var(--background)] to-[var(--secondary)]">
        <div className="container mx-auto text-center">
          <div className="inline-block p-3 bg-[var(--primary)]/10 rounded-full mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[var(--primary)]"
            >
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            Fleet Command System
          </h1>
          <p className="text-[var(--foreground-muted)] text-xl max-w-3xl mx-auto mb-10 leading-relaxed">
            A real-time command and control platform for maritime operations in the
            Strait of Hormuz. Monitor 15 cargo ships, manage zones, and respond to
            distress alerts with AI-powered insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/dashboard"
              className="px-8 py-4 bg-[var(--primary)] text-white font-semibold rounded-lg hover:bg-[var(--primary)]/90 transition-all shadow-lg shadow-[var(--primary)]/20"
            >
              Open Command Center
            </Link>
            <Link
              to="/register"
              className="px-8 py-4 bg-[var(--card)] border border-[var(--border)] font-semibold rounded-lg hover:bg-[var(--secondary)] transition-all"
            >
              Register Account
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 border-y border-[var(--border)]">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Mission Critical Features</h2>
            <p className="text-[var(--foreground-muted)] max-w-2xl mx-auto">
              Our system provides sub-second latency and precise geospatial tracking
              for high-stakes maritime environments.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[var(--card)] p-8 rounded-xl border border-[var(--border)] shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V10a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v10Z"/><path d="M2 14h20"/><path d="m6 14 3-3 3 3"/><path d="m15 14 3-3 3 3"/></svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Live Fleet Tracking</h3>
              <p className="text-[var(--foreground-muted)]">
                Real-time ship simulator with 1Hz tick rate. Monitor position, speed, 
                heading, and fuel status for the entire fleet.
              </p>
            </div>
            <div className="bg-[var(--card)] p-8 rounded-xl border border-[var(--border)] shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Geofencing & Alerts</h3>
              <p className="text-[var(--foreground-muted)]">
                Draw restricted zones on the map. Automatic breach detection and 
                proximity warnings keep your fleet safe.
              </p>
            </div>
            <div className="bg-[var(--card)] p-8 rounded-xl border border-[var(--border)] shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10H12V2Z"/><path d="M12 12 2.1 11.7"/><path d="m12 12 4.3 9"/><path d="m12 12 9-4.3"/></svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">AI Crisis Analysis</h3>
              <p className="text-[var(--foreground-muted)]">
                Intelligent parsing of distress messages using LLMs to prioritize
                responses based on severity and injury reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-4 bg-[var(--secondary)]/50">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
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
