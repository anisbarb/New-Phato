import { motion, AnimatePresence } from "framer-motion";

interface Props {
  open: boolean;
  onClose: () => void;
  role: "passenger" | "driver";
  onBecomeDriver: () => void;
  onBackToPassenger: () => void;
}

const IconMap = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
  </svg>
);
const IconClock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const IconStar = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const IconBell = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
const IconSettings = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
  </svg>
);
const IconHelp = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const IconInfo = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
const IconCar = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1L2 11v5h3" />
    <circle cx="6.5" cy="16.5" r="2.5" /><circle cx="16.5" cy="16.5" r="2.5" />
  </svg>
);
const IconUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const IconChevron = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const NAV_ITEMS = [
  { id: "map", icon: <IconMap />, label: "Map" },
  { id: "trips", icon: <IconClock />, label: "Trip History" },
  { id: "saved", icon: <IconStar />, label: "Saved Places" },
  { id: "notifs", icon: <IconBell />, label: "Notifications" },
  { id: "settings", icon: <IconSettings />, label: "Settings" },
  { id: "help", icon: <IconHelp />, label: "Help" },
  { id: "about", icon: <IconInfo />, label: "About Phato" },
];

export default function Sidebar({ open, onClose, role, onBecomeDriver, onBackToPassenger }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="phato-sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
          />
          <motion.div
            className="phato-sidebar"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
          >
            <div className="phato-sidebar-header">
              <div className="phato-sidebar-avatar">
                <IconUser />
              </div>
              <div className="phato-sidebar-profile">
                <span className="phato-sidebar-name">
                  {role === "driver" ? "Driver Mode" : "Traveller"}
                </span>
                <span className="phato-sidebar-role">
                  {role === "driver" ? "Active" : "Passenger"}
                </span>
              </div>
              <button className="phato-sidebar-close" onClick={onClose} aria-label="Close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="phato-sidebar-nav">
              {NAV_ITEMS.map((item) => (
                <button key={item.id} className="phato-sidebar-item" onClick={onClose}>
                  <span className="phato-sidebar-item-icon">{item.icon}</span>
                  <span className="phato-sidebar-item-label">{item.label}</span>
                  <span className="phato-sidebar-item-chevron"><IconChevron /></span>
                </button>
              ))}
            </nav>

            <div className="phato-sidebar-footer">
              {role === "passenger" ? (
                <button className="phato-sidebar-driver-btn" onClick={onBecomeDriver}>
                  <IconCar />
                  <span>Become a Driver</span>
                </button>
              ) : (
                <button className="phato-sidebar-passenger-btn" onClick={onBackToPassenger}>
                  <IconUser />
                  <span>Back to Passenger</span>
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
