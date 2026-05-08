import { useState, useCallback } from "react";
import Splash from "./components/Splash";
import Passenger from "./pages/Passenger";
import Driver from "./pages/Driver";
import { getUserRole } from "./lib/transport";

export default function App() {
  const [splashDone, setSplashDone] = useState(false);
  const [role, setRole] = useState<"passenger" | "driver">(getUserRole);

  const handleSplashDone = useCallback(() => setSplashDone(true), []);
  const handleBecomeDriver = useCallback(() => setRole("driver"), []);
  const handleBackToPassenger = useCallback(() => setRole("passenger"), []);

  return (
    <>
      {!splashDone && <Splash onDone={handleSplashDone} />}
      {splashDone && role === "passenger" && (
        <Passenger onBecomeDriver={handleBecomeDriver} />
      )}
      {splashDone && role === "driver" && (
        <Driver onBackToPassenger={handleBackToPassenger} />
      )}
    </>
  );
}
