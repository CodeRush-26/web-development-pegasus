import { useState } from "react";
import {
  Mail,
  Twitter,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import useUserStore from "@/store/userStore";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Dashboard", href: "/dashboard" },
  { name: "Fleet Map", href: "/dashboard" },
  { name: "Directives", href: "/dashboard" },
  { name: "FAQ", href: "#" },
];

const socialLinks = [
  {
    name: "Mail",
    href: "#",
    icon: Mail,
  },
  {
    name: "Twitter",
    href: "#",
    icon: Twitter,
  },
  {
    name: "FaceBook",
    href: "#",
    icon: Facebook,
  },
  {
    name: "Instagram",
    href: "#",
    icon: Instagram,
  },
  {
    name: "LinkedIn",
    href: "#",
    icon: Linkedin,
  },
  {
    name: "YouTube",
    href: "#",
    icon: Youtube,
  },
];

export default function Footer() {
  const [activeModal, setActiveModal] = useState<"privacy" | "terms" | null>(
    null
  );
  activeModal;

  return (
    <footer className="bg-[var(--background)] text-[var(--foreground)] border-t border-[var(--border)]">
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-extrabold flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
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
              <span className="text-[var(--primary)]">Fleet Command</span>
            </h3>
            <p className="text-[var(--foreground-muted)] max-w-sm">
              Real-time fleet command system for critical maritime operations.
              Monitor, route, and safeguard your assets.
            </p>
          </div>

          {/* Navigation Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[var(--foreground-muted)]/60">
              Navigation
            </h4>
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          {/* Contact Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[var(--foreground-muted)]/60">
              Contact
            </h4>
            <div className="flex flex-col space-y-2">
              <a
                href="mailto:ops@fleetcommand.io"
                className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
              >
                Operational Support
              </a>
              <a
                href="#"
                className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
              >
                Command Center
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-[var(--border)]">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-[var(--foreground-muted)]">
              © {new Date().getFullYear()} Fleet Command. All rights reserved.
            </p>

            {/* Social Icons */}
            <div className="flex items-center space-x-4 my-4 md:my-0">
              {socialLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-[var(--foreground-muted)] hover:text-[var(--gaming-purple)] transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </a>
              ))}
            </div>

            <div className="flex space-x-6">
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
                    onClick={() => setActiveModal("privacy")}
                  >
                    Privacy Policy
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-[var(--background)] text-[var(--foreground)] border border-[var(--border)]">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold mb-6">
                      Privacy Policy
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 text-sm">
                    <p className="text-[var(--foreground-muted)]">
                      Effective Date: May 8, 2026
                    </p>

                    <section>
                      <h3 className="text-lg font-semibold mb-2">
                        1. Introduction
                      </h3>
                      <p className="text-white/80">
                        Welcome to CodeRush. Your privacy is important to us.
                        This Privacy Policy explains how we collect, use,
                        disclose, and safeguard your information when you visit
                        our website FleetCommand.io or interact with us via email or
                        other channels.
                      </p>
                      <p className="text-white/80 mt-2">
                        By accessing or using our services, you agree to the
                        terms of this policy.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-2">
                        2. Information We Collect
                      </h3>
                      <p className="text-white/80 mb-2">
                        We may collect the following types of personal
                        information:
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-white/80">
                        <li>
                          Contact Information: Name, email address, and other
                          information you voluntarily provide via forms or
                          newsletter signups.
                        </li>
                        <li>
                          Usage Data: Information about your interaction with
                          the site (e.g., IP address, browser type, pages
                          visited, time spent).
                        </li>
                        <li>
                          Cookies and Tracking: We use cookies to personalize
                          content, analyze traffic, and improve our services.
                        </li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-2">
                        3. How We Use Your Information
                      </h3>
                      <p className="text-white/80 mb-2">
                        We use your information to:
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-white/80">
                        <li>Provide and improve our services.</li>
                        <li>
                          Respond to inquiries or provide customer support.
                        </li>
                        <li>
                          Send newsletters, updates, or marketing materials
                          (only if you opt in).
                        </li>
                        <li>
                          Monitor and analyze usage to enhance your experience.
                        </li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-2">
                        4. Sharing Your Information
                      </h3>
                      <p className="text-white/80">
                        We do not sell your personal information. We may share
                        data with trusted service providers who help operate our
                        site or business, under confidentiality agreements.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-2">
                        5. Your Rights
                      </h3>
                      <p className="text-white/80 mb-2">
                        Depending on your location, you may have the right to:
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-white/80">
                        <li>
                          Access the personal information we hold about you.
                        </li>
                        <li>Request correction or deletion of your data.</li>
                        <li>Withdraw consent to marketing communications.</li>
                      </ul>
                      <p className="text-white/80 mt-2">
                        To exercise your rights, contact us at
                        support@coderush.com.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-2">
                        6. Data Retention
                      </h3>
                      <p className="text-white/80">
                        We retain your data only as long as necessary to fulfill
                        the purposes described in this policy unless a longer
                        retention period is required or permitted by law.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-2">
                        7. Security
                      </h3>
                      <p className="text-white/80">
                        We take reasonable technical and organizational measures
                        to protect your personal information against loss,
                        misuse, or unauthorized access.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-2">
                        8. Third-Party Links
                      </h3>
                      <p className="text-white/80">
                        Our site may contain links to external sites. We are not
                        responsible for the privacy practices or content of such
                        third parties.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-2">
                        9. Updates to This Policy
                      </h3>
                      <p className="text-white/80">
                        We may update this policy occasionally. The updated
                        version will be posted on this page with a revised
                        effective date.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-2">
                        10. Contact Us
                      </h3>
                      <p className="text-white/80">
                        If you have any questions about this Privacy Policy,
                        please contact:
                      </p>
                      <p className="text-white/80 mt-2">
                        Email: support@coderush.com
                      </p>
                    </section>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <button
                    className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
                    onClick={() => setActiveModal("terms")}
                  >
                    Terms of Service
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-[var(--background)] text-[var(--foreground)] border border-[var(--border)]">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold mb-6">
                      Terms of Service
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 text-sm">
                    <p className="text-white/80">
                      Effective Date: May 8, 2026
                    </p>

                    <section>
                      <h3 className="text-lg font-semibold mb-2">
                        1. Acceptance of Terms
                      </h3>
                      <p className="text-white/80">
                        By accessing or using FleetCommand.io ("Site"), you agree to
                        be bound by these Terms of Service ("Terms"). If you do
                        not agree, do not use the Site.
                      </p>
                      <p className="text-white/80 mt-2">
                        We reserve the right to update or modify these Terms at
                        any time without prior notice. Your continued use of the
                        Site constitutes acceptance of any changes.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-2">
                        2. Services Provided
                      </h3>
                      <p className="text-white/80 mb-2">
                        CodeRush offers gaming platform services, educational
                        content, and marketing strategy services, including but
                        not limited to:
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-white/80">
                        <li>Game tracking and achievement management</li>
                        <li>Social gaming features and friend connections</li>
                        <li>Gaming profile customization</li>
                      </ul>
                      <p className="text-white/80 mt-2">
                        We reserve the right to modify or discontinue any part
                        of the services at any time.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-2">
                        3. Intellectual Property
                      </h3>
                      <p className="text-white/80">
                        All content on this Site—including text, images, logos,
                        graphics, downloads, and materials—is the property of
                        CodeRush or its content suppliers and is protected by
                        international copyright laws.
                      </p>
                      <p className="text-white/80 mt-2">
                        You may not copy, reproduce, republish, or distribute
                        any content without explicit written permission from us.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-2">
                        4. User Conduct
                      </h3>
                      <p className="text-white/80 mb-2">
                        By using the Site, you agree:
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-white/80">
                        <li>Not to use the Site for any unlawful purpose.</li>
                        <li>
                          Not to attempt to gain unauthorized access to any part
                          of the Site or its systems.
                        </li>
                        <li>
                          Not to misuse forms or email contacts for spam or
                          phishing attempts.
                        </li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-2">
                        5. Payments and Refunds
                      </h3>
                      <p className="text-white/80">
                        Any payments made for services, digital products, or
                        subscriptions are governed by the specific terms
                        provided at the point of purchase. Refund policies (if
                        applicable) will also be outlined there.
                      </p>
                      <p className="text-white/80 mt-2">
                        For questions regarding payments or cancellations,
                        please email support@coderush.com.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-2">
                        6. Disclaimer
                      </h3>
                      <p className="text-white/80">
                        This Site and its content are provided "as is" without
                        warranties of any kind. We do not guarantee any specific
                        results from the use of our services or information.
                      </p>
                      <p className="text-white/80 mt-2">
                        CodeRush is not liable for any indirect, incidental, or
                        consequential damages resulting from your use of the
                        Site.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-2">
                        7. Links to Third Parties
                      </h3>
                      <p className="text-white/80">
                        The Site may contain links to third-party websites. We
                        are not responsible for the content, policies, or
                        practices of any external websites.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-2">
                        8. Governing Law
                      </h3>
                      <p className="text-white/80">
                        These Terms are governed by and construed in accordance
                        with the laws of the United States, where CodeRush
                        operates, without regard to conflict of law principles.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-2">9. Contact</h3>
                      <p className="text-white/80">
                        If you have any questions about these Terms, please
                        contact:
                      </p>
                      <p className="text-white/80 mt-2">Email: support@coderush.com</p>
                    </section>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
