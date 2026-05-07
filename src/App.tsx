import { useLocation, Router } from "wouter";

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

export default function App() {
  return (
    <Router>
      <RoleSelect />
    </Router>
  );
}
