import { lazy, Suspense, useState, useCallback } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { AnimatePresence } from "framer-motion";
import SplashScreen from "@/components/SplashScreen";

const PassengerHome = lazy(() => import("@/pages/PassengerHome"));
const DriverHome = lazy(() => import("@/pages/DriverHome"));

function RoleSelect() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-4 text-center">
        <h1 className="text-5xl font-bold tracking-tight">Phato</h1>

        <p className="text-gray-500">
          Smart local transport for passengers and drivers.
        </p>

        <button
          onClick={() => navigate("/passenger")}
          className="w-full rounded-2xl bg-black text-white py-4 text-lg font-semibold"
        >
          Continue as Passenger
        </button>

        <button
          onClick={() => navigate("/driver")}
          className="w-full rounded-2xl border border-black py-4 text-lg font-semibold"
        >
          Continue as Driver
        </button>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Suspense fallback={<div className="fixed inset-0 bg-white" />}>
      <Switch>
        <Route path="/" component={RoleSelect} />
        <Route path="/passenger" component={PassengerHome} />
        <Route path="/driver" component={DriverHome} />
        <Route component={RoleSelect} />
      </Switch>
    </Suspense>
  );
}

export default function App() {
  const [splashDone, setSplashDone] = useState(false);
  const handleSplashDone = useCallback(() => setSplashDone(true), []);

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
