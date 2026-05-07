import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, CheckCircle } from "lucide-react";

type Step = "intro" | "details" | "uploads" | "submitted";

interface FormData {
  name: string;
  phone: string;
  plate: string;
  licenseImg: string | null;
  vehicleImg: string | null;
  plateImg: string | null;
}

function UploadBox({
  label, value, onChange,
}: { label: string; value: string | null; onChange: (v: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onChange(url);
  }

  return (
    <button
      type="button"
      onClick={() => ref.current?.click()}
      className="w-full h-28 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors"
      style={{
        borderColor: value ? "rgba(37,99,235,0.5)" : "rgba(203,213,225,0.8)",
        background: value ? "rgba(239,246,255,0.7)" : "rgba(248,250,252,0.8)",
      }}
    >
      {value ? (
        <>
          <img src={value} alt="" className="h-16 w-full object-contain rounded-xl" />
        </>
      ) : (
        <>
          <span className="text-2xl">📷</span>
          <span className="text-[12px] font-medium text-slate-500">{label}</span>
        </>
      )}
      <input ref={ref} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
    </button>
  );
}

export default function DriverVerification() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<Step>("intro");
  const [form, setForm] = useState<FormData>({
    name: "", phone: "", plate: "", licenseImg: null, vehicleImg: null, plateImg: null,
  });

  function setField(key: keyof FormData, val: string | null) {
    setForm((p) => ({ ...p, [key]: val }));
  }

  function canProceedDetails() {
    return form.name.trim().length >= 2 && form.phone.trim().length >= 8 && form.plate.trim().length >= 4;
  }

  function canProceedUploads() {
    return form.licenseImg && form.vehicleImg && form.plateImg;
  }

  if (step === "submitted") {
    return (
      <div className="fixed inset-0 bg-[linear-gradient(180deg,#eff6ff_0%,#dbeafe_60%,#eff6ff_100%)] flex flex-col items-center justify-center px-6 text-center">
        <div className="flex flex-col items-center gap-5 animate-[fade-in_500ms_ease_both]">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-[26px] font-bold text-[#10213f] tracking-[-0.05em]">Application Received!</h1>
          <p className="text-[14px] text-slate-500 leading-relaxed max-w-[280px]">
            We'll review your details within <strong>24 hours</strong>. You'll get a WhatsApp message once approved.
          </p>
          <div className="mt-2 bg-white/80 border border-blue-100 rounded-2xl px-5 py-4 text-left w-full max-w-[300px]">
            <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-3">Your submission</div>
            <div className="space-y-2">
              <div className="flex justify-between text-[13px]">
                <span className="text-slate-500">Name</span>
                <span className="font-semibold text-[#10213f]">{form.name}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-slate-500">Phone</span>
                <span className="font-semibold text-[#10213f]">{form.phone}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-slate-500">Plate</span>
                <span className="font-semibold text-[#10213f] uppercase">{form.plate}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setLocation("/")}
            className="mt-2 px-8 py-3.5 rounded-full bg-[#2563eb] text-white text-[15px] font-semibold shadow-[0_4px_18px_rgba(37,99,235,0.35)]"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[linear-gradient(180deg,#eff6ff_0%,#f8fbff_100%)] flex flex-col">
      <div className="flex items-center gap-3 px-4 pt-[max(env(safe-area-inset-top,0px)+14px,20px)] pb-4">
        <button
          onClick={() => step === "intro" ? setLocation("/") : setStep(step === "uploads" ? "details" : "intro")}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/80 border border-slate-100 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-[#10213f]" />
        </button>
        <div>
          <div className="text-[17px] font-bold text-[#10213f]">Become a Driver</div>
          <div className="text-[11px] text-slate-400">
            {step === "intro" ? "How it works" : step === "details" ? "Step 1 of 2 — Your details" : "Step 2 of 2 — Upload photos"}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-8">
        {step === "intro" && (
          <div className="space-y-4 animate-[fade-in_360ms_ease_both]">
            <div className="rounded-3xl bg-white/90 border border-blue-100 p-5 shadow-sm">
              <div className="text-[13px] font-semibold text-[#1d4ed8] uppercase tracking-wider mb-4">Driver Verification — Phase 1</div>
              {[
                { icon: "📱", title: "Your name & phone", desc: "We use this to contact you for approval." },
                { icon: "🚗", title: "Vehicle number plate", desc: "Enter your plate manually — e.g. AS11BC1234" },
                { icon: "📷", title: "Upload 3 photos", desc: "Driving license, vehicle photo, and number plate photo." },
                { icon: "✅", title: "Manual approval", desc: "We review within 24 hours and notify you on WhatsApp." },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="flex gap-4 mb-4 last:mb-0">
                  <div className="text-2xl w-8 shrink-0">{icon}</div>
                  <div>
                    <div className="text-[14px] font-semibold text-[#10213f]">{title}</div>
                    <div className="text-[12px] text-slate-500 mt-0.5">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 text-[12px] text-amber-700 leading-relaxed">
              🔒 Your documents are only used for driver verification. We never share them with passengers.
            </div>
            <button
              onClick={() => setStep("details")}
              className="w-full py-4 rounded-2xl bg-[#2563eb] text-white text-[15px] font-semibold shadow-[0_4px_18px_rgba(37,99,235,0.30)]"
            >
              Start Application →
            </button>
          </div>
        )}

        {step === "details" && (
          <div className="space-y-4 animate-[fade-in_360ms_ease_both]">
            <div className="rounded-3xl bg-white/90 border border-blue-100 p-5 shadow-sm space-y-4">
              <div>
                <label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ranjit Das"
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 text-[15px] text-[#10213f] bg-white focus:outline-none focus:border-blue-400"
                />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">WhatsApp Number</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                  className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 text-[15px] text-[#10213f] bg-white focus:outline-none focus:border-blue-400"
                />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Vehicle Plate Number</label>
                <input
                  type="text"
                  placeholder="e.g. AS11BC1234"
                  value={form.plate}
                  onChange={(e) => setField("plate", e.target.value.toUpperCase())}
                  className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 text-[15px] font-mono text-[#10213f] bg-white focus:outline-none focus:border-blue-400 tracking-widest uppercase"
                />
                <div className="mt-1.5 text-[11px] text-slate-400">Assam format: AS 11 BC 1234</div>
              </div>
            </div>
            <button
              disabled={!canProceedDetails()}
              onClick={() => setStep("uploads")}
              className="w-full py-4 rounded-2xl text-[15px] font-semibold transition-all"
              style={{
                background: canProceedDetails() ? "#2563eb" : "#e2e8f0",
                color: canProceedDetails() ? "white" : "#94a3b8",
                boxShadow: canProceedDetails() ? "0 4px 18px rgba(37,99,235,0.30)" : "none",
              }}
            >
              Next — Upload Photos →
            </button>
          </div>
        )}

        {step === "uploads" && (
          <div className="space-y-4 animate-[fade-in_360ms_ease_both]">
            <div className="rounded-3xl bg-white/90 border border-blue-100 p-5 shadow-sm space-y-4">
              <UploadBox label="Driving License" value={form.licenseImg} onChange={(v) => setField("licenseImg", v)} />
              <UploadBox label="Vehicle Photo" value={form.vehicleImg} onChange={(v) => setField("vehicleImg", v)} />
              <UploadBox label="Number Plate Photo" value={form.plateImg} onChange={(v) => setField("plateImg", v)} />
            </div>
            <div className="text-[12px] text-slate-400 text-center">Tap each box to take a photo or choose from gallery</div>
            <button
              disabled={!canProceedUploads()}
              onClick={() => setStep("submitted")}
              className="w-full py-4 rounded-2xl text-[15px] font-semibold transition-all"
              style={{
                background: canProceedUploads() ? "#2563eb" : "#e2e8f0",
                color: canProceedUploads() ? "white" : "#94a3b8",
                boxShadow: canProceedUploads() ? "0 4px 18px rgba(37,99,235,0.30)" : "none",
              }}
            >
              Submit Application ✓
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
