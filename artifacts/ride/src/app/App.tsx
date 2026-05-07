import { useState, useCallback } from "react";
import SplashScreen from "../components/SplashScreen";
import PassengerScreen from "../screens/PassengerScreen";
import DriverScreen from "../screens/DriverScreen";
import { getUserRole } from "../services/transport";

export default function App() {
  const [splashDone, setSplashDone] = useState(false);
  const [role, setRole] = useState<"passenger" | "driver">(getUserRole);

  const handleSplashDone = useCallback(() => setSplashDone(true), []);

  const handleBecomeDriver = useCallback(() => setRole("driver"), []);
  const handleBackToPassenger = useCallback(() => setRole("passenger"), []);

  return (
    <>
      {!splashDone && <SplashScreen onDone={handleSplashDone} />}
      {splashDone && role === "passenger" && (
        <PassengerScreen onBecomeDriver={handleBecomeDriver} />
      )}
      {splashDone && role === "driver" && (
        <DriverScreen onBackToPassenger={handleBackToPassenger} />
      )}
    </>
  );
}
