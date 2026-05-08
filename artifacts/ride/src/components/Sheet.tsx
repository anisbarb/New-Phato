import { motion, AnimatePresence } from "framer-motion";

interface Props {
  open: boolean;
  onClose?: () => void;
  title?: string;
  children: React.ReactNode;
  peek?: boolean;
}

export default function Sheet({ open, onClose, title, children, peek }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {onClose && !peek && (
            <motion.div
              className="phato-sheet-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
            />
          )}
          <motion.div
            className="phato-sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <div className="phato-sheet-handle" />
            {title && (
              <div className="phato-sheet-header">
                <span className="phato-sheet-title">{title}</span>
                {onClose && (
                  <button className="phato-sheet-close" onClick={onClose} aria-label="Close">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            )}
            <div className="phato-sheet-content">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
