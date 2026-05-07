import { lazy, Suspense, useState, useCallback } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { AnimatePresence } from "framer-motion";
import SplashScreen from "@/components/SplashScreen";

const PassengerHome = lazy(() => import("@/pages/PassengerHome"));
const DriverHome = lazy(() => import("@/pages/DriverHome"));

function AppRoutes() {
  return (
    <Suspense fallback={<div className="fixed inset-0 bg-white" />}>
      <Switch>
        <Route path="/" component={PassengerHome} />
        <Route path="/driver" component={DriverHome} />
        <Route component={PassengerHome} />
      </Switch>
    </Suspense>
  );
}

export default function App() {
  const [splashDone, setSplashDone] = useState(false);

  const handleSplashDone = useCallback(() => {
    setSplashDone(true);
  }, []);

  return (
    <WouterRouter hook={useHashLocation}>
      <AppRoutes />

      <AnimatePresence>
        {!splashDone && (
          <SplashScreen onDone={handleSplashDone} />
        )}
      </AnimatePresence>
    </WouterRouter>
  );
}
