import { useRef, useState } from "react";
import { CheckCircle2, User, CarFront } from "lucide-react";
import BottomSheet from "@/components/common/BottomSheet";
import { supabase, supabaseConfigured } from "@/lib/supabase";

interface Props {
  open: boolean;
  onClose: () => void;
  onApprovalPending: () => void;
}

interface FormData {
  fullName: string;
  phone: string;
  vehicleNumber: string;
  driverPhoto: string | null;
  vehiclePhoto: string | null;
}

function PhotoUploadField({
  label, value, onChange, icon,
}: {
  label: string;
  value: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: React.ReactNode;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-medium text-slate-500 uppercase tracking-wide">{label}</label>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="h-24 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 active:bg-slate-50 transition-colors overflow-hidden"
      >
        {value ? (
          <img src={value} alt={label} className="w-full h-full object-cover" />
        ) : (
          <>
            {icon}
            <span className="text-[13px] text-slate-400">Tap to upload</span>
          </>
        )}
      </button>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onChange} />
    </div>
  );
}

export default function DriverRegisterSheet({ open, onClose, onApprovalPending }: Props) {
  const [form, setForm] = useState<FormData>({ fullName: "", phone: "", vehicleNumber: "", driverPhoto: null, vehiclePhoto: null });
  const [step, setStep] = useState<"form" | "loading" | "success">("form");
  const [error, setError] = useState<string | null>(null);

  function handlePhotoUpload(field: "driverPhoto" | "vehiclePhoto") {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => setForm((f) => ({ ...f, [field]: reader.result as string }));
      reader.readAsDataURL(file);
      e.target.value = "";
    };
  }

  async function handleSubmit() {
    if (!form.fullName.trim()) return setError("Enter your full name");
    if (!form.phone.trim() || form.phone.replace(/\D/g, "").length < 10) return setError("Enter a valid phone number");
    if (!form.vehicleNumber.trim()) return setError("Enter vehicle number");
    if (!form.driverPhoto) return setError("Upload your photo");
    if (!form.vehiclePhoto) return setError("Upload your vehicle photo");

    setError(null);
    setStep("loading");

    try {
      if (!supabaseConfigured || !supabase) {
        throw new Error("Database not configured — contact support");
      }

      const { error: dbError } = await supabase.from("driver_applications").insert({
        name: form.fullName.trim(),
        phone: form.phone.trim(),
        vehicle_number: form.vehicleNumber.trim().toUpperCase(),
        driver_photo_base64: form.driverPhoto,
        vehicle_photo_base64: form.vehiclePhoto,
        submitted_at: new Date().toISOString(),
        status: "pending",
        // Anis reviews all applications in Supabase dashboard
        // To approve: set status = 'approved' manually
        // Driver cannot access /driver route until approved
      });

      if (dbError) throw dbError;

      localStorage.setItem("phato_user_role", "pending");
      localStorage.setItem("phato_driver_application", JSON.stringify({
        name: form.fullName,
        phone: form.phone,
        vehicleNumber: form.vehicleNumber,
        submittedAt: new Date().toISOString(),
      }));

      setStep("success");
      onApprovalPending();
    } catch (err) {
      setStep("form");
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(msg);
    }
  }

  function handleVehicleNumber(val: string) {
    setForm((f) => ({ ...f, vehicleNumber: val.toUpperCase() }));
  }

  return (
    <BottomSheet open={open} onClose={step === "loading" ? () => {} : onClose} title="Drive with Phato">
      {step === "loading" && (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="w-10 h-10 border-2 border-[#2563eb] border-t-transparent rounded-full animate-spin" />
          <p className="text-[14px] text-slate-400">Submitting your application...</p>
        </div>
      )}

      {step === "success" && (
        <div className="flex flex-col items-center justify-center h-full px-8 text-center gap-5 min-h-[360px]">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" strokeWidth={2} />
          </div>
          <div>
            <p className="text-[18px] font-semibold text-[#0f172a]">Application Submitted</p>
            <p className="text-[14px] text-slate-400 mt-2 leading-relaxed">
              We'll review your details and call you within 24 hours.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full h-12 rounded-2xl text-white text-[15px] font-semibold"
            style={{ background: "#2563eb" }}
          >
            Done
          </button>
        </div>
      )}

      {step === "form" && (
        <div className="px-5 py-4 flex flex-col gap-5 pb-10">
          <div className="rounded-xl bg-blue-50 px-4 py-3">
            <p className="text-[13px] text-blue-700 leading-relaxed">
              Phato is not Uber. You stay independent. We just help passengers find you.
              Drivers are manually approved within 24 hours.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-slate-500 uppercase tracking-wide">Full Name</label>
            <input
              className="h-12 rounded-xl border border-slate-200 px-4 text-[15px] text-[#0f172a] bg-white outline-none focus:border-[#2563eb] transition-colors"
              placeholder="Your full name"
              value={form.fullName}
              onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-slate-500 uppercase tracking-wide">Phone Number</label>
            <input
              className="h-12 rounded-xl border border-slate-200 px-4 text-[15px] text-[#0f172a] bg-white outline-none focus:border-[#2563eb] transition-colors"
              placeholder="+91 XXXXX XXXXX"
              type="tel"
              inputMode="tel"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-slate-500 uppercase tracking-wide">Vehicle Number</label>
            <input
              className="h-12 rounded-xl border border-slate-200 px-4 text-[15px] font-mono text-[#0f172a] bg-white outline-none focus:border-[#2563eb] transition-colors"
              placeholder="AS01AB1234"
              value={form.vehicleNumber}
              onChange={(e) => handleVehicleNumber(e.target.value)}
            />
          </div>

          <PhotoUploadField
            label="Your Photo"
            value={form.driverPhoto}
            onChange={handlePhotoUpload("driverPhoto")}
            icon={<User className="w-5 h-5 text-slate-400" strokeWidth={2} />}
          />

          <PhotoUploadField
            label="Vehicle Photo"
            value={form.vehiclePhoto}
            onChange={handlePhotoUpload("vehiclePhoto")}
            icon={<CarFront className="w-5 h-5 text-slate-400" strokeWidth={2} />}
          />

          {error && <p className="text-[13px] text-red-500 text-center">{error}</p>}

          <button
            onClick={handleSubmit}
            className="w-full h-12 rounded-2xl text-white text-[15px] font-semibold active:scale-[0.98] transition-transform"
            style={{ background: "#2563eb", boxShadow: "0 4px 14px rgba(37,99,235,0.35)" }}
          >
            Apply to Drive
          </button>
        </div>
      )}
    </BottomSheet>
  );
}
