import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PLACES } from "../utils/corridor";
import type { Destination } from "../types";

interface Props {
  onDestinationSelect: (dest: Destination) => void;
  onMenuOpen: () => void;
  selectedDestination: Destination | null;
  onClear: () => void;
}

export default function SearchBar({
  onDestinationSelect,
  onMenuOpen,
  selectedDestination,
  onClear,
}: Props) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query.trim()
    ? PLACES.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    : PLACES;

  const handleSelect = (place: (typeof PLACES)[number]) => {
    onDestinationSelect({ name: place.name, position: place.position, placeId: place.id });
    setQuery(place.name);
    setFocused(false);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    setQuery("");
    onClear();
    setFocused(false);
    inputRef.current?.blur();
  };

  return (
    <div className="phato-search-wrap">
      <div className={`phato-search-bar ${focused ? "focused" : ""}`}>
        <svg className="phato-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
        </svg>

        <input
          ref={inputRef}
          type="text"
          className="phato-search-input"
          placeholder="Where to?"
          value={selectedDestination && !focused ? selectedDestination.name : query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            setFocused(true);
            if (selectedDestination) setQuery("");
          }}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
        />

        {(selectedDestination || query) && (
          <button className="phato-search-clear" onClick={handleClear} aria-label="Clear">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        )}

        <button className="phato-hamburger" onClick={onMenuOpen} aria-label="Menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="4" y1="7" x2="20" y2="7"/>
            <line x1="4" y1="12" x2="20" y2="12"/>
            <line x1="4" y1="17" x2="20" y2="17"/>
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {focused && (
          <motion.div
            className="phato-search-results"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            {filtered.map((place) => (
              <button
                key={place.id}
                className="phato-search-result-item"
                onMouseDown={() => handleSelect(place)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M20 10c0 6-8 13-8 13S4 16 4 10a8 8 0 1 1 16 0z"/>
                  <circle cx="12" cy="10" r="2" fill="currentColor"/>
                </svg>
                <span>{place.name}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
