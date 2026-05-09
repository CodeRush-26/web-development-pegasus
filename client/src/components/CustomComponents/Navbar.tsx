import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Menu, X, ExternalLink, User, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import useUserStore from "@/store/userStore";

interface NavLink {
  name: string;
  href: string;
  isExternal?: boolean;
}

const navLinks: NavLink[] = [
  { name: "Home", href: "/" },
  { name: "Dashboard", href: "/dashboard" },
  { name: "Fleet Map", href: "/dashboard" },
  { name: "Directives", href: "/dashboard" },
];

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useUserStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      // Update active section based on scroll position
      const sections = navLinks.map((link) =>
        link.href.startsWith("#") ? link.href.substring(1) : ""
      );
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        if (!section) continue;
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close profile menu when clicking outside
  useEffect(() => {
    //@ts-ignore
    const handleClickOutside = (event) => {
      if (
        isProfileMenuOpen &&
        !event.target.closest(".profile-menu-container")
      ) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileMenuOpen]);

  // Lock body scroll when sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  const scrollToSection = (href: string) => {
    if (href.startsWith("#")) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        setIsSidebarOpen(false);
      }
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsProfileMenuOpen(false);
    navigate("/");
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
          isScrolled
            ? "bg-[var(--background)]/90 backdrop-blur-md border-b border-[var(--border)]"
            : "bg-transparent"
        )}
      >
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <a
                onClick={() => {
                  scrollTo(0, 0);
                }}
                href="/"
                className="text-2xl font-bold text-[var(--foreground)] flex items-center gap-2"
              >
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
                Fleet Command
              </a>
            </div>

            <div className="hidden md:block">
              <div className="flex items-center space-x-8">
                {navLinks.map((link) =>
                  link.isExternal ? (
                    <a
                      key={link.name}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "flex items-center gap-1 text-sm font-medium transition-colors hover:text-[var(--foreground)]",
                        activeSection === link.href.substring(1)
                          ? "text-[var(--foreground)]"
                          : "text-[var(--foreground-muted)]"
                      )}
                    >
                      {link.name}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <button
                      key={link.name}
                      onClick={() => scrollToSection(link.href)}
                      className={cn(
                        "text-sm font-medium transition-colors hover:text-[var(--foreground)]",
                        activeSection === link.href.substring(1)
                          ? "text-[var(--foreground)]"
                          : "text-[var(--foreground-muted)]"
                      )}
                    >
                      {link.name}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="flex items-center">
              {user ? (
                <div className="relative profile-menu-container">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-2 text-[var(--foreground)]"
                  >
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                    )}
                    <span className="hidden md:block text-sm font-medium">
                      {user.name}
                    </span>
                  </button>

                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-[var(--card)] rounded-md shadow-lg py-1 z-50 border border-[var(--border)]">
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--accent)]/10"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        Dashboard
                      </Link>

                      {user.role === "admin" && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--accent)]/10"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          Admin Dashboard
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--accent)]/10"
                      >
                        <div className="flex items-center">
                          <LogOut className="h-4 w-4 mr-2" />
                          Logout
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-[var(--foreground)] hover:text-[var(--foreground-muted)]"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="hidden md:block rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium transition-colors text-white hover:bg-[var(--primary)]/90"
                  >
                    Register
                  </Link>
                </div>
              )}
              <button
                onClick={toggleSidebar}
                className="md:hidden ml-4 text-[var(--foreground)] p-1 rounded-md hover:bg-[var(--accent)]/10"
                aria-label="Toggle navigation menu"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={closeSidebar}
              aria-hidden="true"
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-[280px] bg-[var(--background)]/90 backdrop-blur-md z-50 md:hidden overflow-y-auto border-l border-[var(--border)]"
            >
              <div className="flex flex-col h-full p-6">
                <div className="flex justify-end mb-8">
                  <button
                    onClick={closeSidebar}
                    className="text-[var(--foreground)] p-1 rounded-md hover:bg-[var(--accent)]/10"
                    aria-label="Close navigation menu"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <nav className="flex flex-col space-y-6 mb-8">
                  {navLinks.map((link) =>
                    link.isExternal ? (
                      <a
                        key={link.name}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "flex items-center gap-2 text-lg font-medium transition-colors hover:text-[var(--foreground)] py-2",
                          activeSection === link.href.substring(1)
                            ? "text-[var(--foreground)]"
                            : "text-[var(--foreground-muted)]"
                        )}
                      >
                        {link.name}
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    ) : (
                      <button
                        key={link.name}
                        onClick={() => scrollToSection(link.href)}
                        className={cn(
                          "text-left text-lg font-medium transition-colors hover:text-[var(--foreground)] py-2",
                          activeSection === link.href.substring(1)
                            ? "text-[var(--foreground)]"
                            : "text-[var(--foreground-muted)]"
                        )}
                      >
                        {link.name}
                      </button>
                    )
                  )}

                  {/* Auth links for mobile */}
                  {user ? (
                    <>
                      <Link
                        to="/dashboard"
                        className="text-left text-lg font-medium text-[var(--foreground-muted)] hover:text-[var(--foreground)] py-2"
                        onClick={closeSidebar}
                      >
                        Dashboard
                      </Link>

                      {user.role === "admin" && (
                        <Link
                          to="/admin"
                          className="text-left text-lg font-medium text-[var(--foreground-muted)] hover:text-[var(--foreground)] py-2"
                          onClick={closeSidebar}
                        >
                          Admin Dashboard
                        </Link>
                      )}

                      <button
                        onClick={() => {
                          handleLogout();
                          closeSidebar();
                        }}
                        className="text-left text-lg font-medium text-[var(--foreground-muted)] hover:text-[var(--foreground)] py-2 flex items-center gap-2"
                      >
                        <LogOut className="h-5 w-5" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="text-left text-lg font-medium text-[var(--foreground-muted)] hover:text-[var(--foreground)] py-2"
                        onClick={closeSidebar}
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        className="text-left text-lg font-medium text-[var(--foreground-muted)] hover:text-[var(--foreground)] py-2"
                        onClick={closeSidebar}
                      >
                        Register
                      </Link>
                    </>
                  )}
                </nav>

                {!user && (
                  <div className="mt-auto pb-8">
                    <Link
                      to="/register"
                      className="block w-full text-center rounded-lg bg-[var(--primary)] px-4 py-3 text-sm font-medium transition-colors text-white hover:bg-[var(--primary)]/90"
                      onClick={closeSidebar}
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
