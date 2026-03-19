import { useState } from "react";
import { useClerk } from "@clerk/react";

type Section = "main" | "profile" | "notifications" | "security" | "subscription" | "support";

function Toggle({
  checked,
  onChange,
  label,
  id,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  id: string;
}) {
  return (
    <label htmlFor={id} className="flex items-center justify-between cursor-pointer">
      <span className="text-[#475569] text-sm">{label}</span>
      <button
        id={id}
        role="switch"
        type="button"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={[
          "relative w-11 h-6 rounded-full transition-colors flex-shrink-0",
          checked ? "bg-[#00C9A7]" : "bg-[#CBD5E1]",
        ].join(" ")}
      >
        <span
          className={[
            "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200",
            checked ? "translate-x-5" : "translate-x-0.5",
          ].join(" ")}
        />
      </button>
    </label>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label="Go back" className="w-9 h-9 rounded-xl bg-white flex items-center justify-center hover:bg-[#F1F5F9] transition-colors">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>
  );
}

function InputField({
  label,
  id,
  type = "text",
  value,
  onChange,
}: {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[#475569] text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-[#F8FAFC] text-[#0F172A] text-sm rounded-xl px-4 py-3 border border-[#E2E8F0]"
      />
    </div>
  );
}

function ProfileSection({ onBack }: { onBack: () => void }) {
  const [firstName, setFirstName] = useState("Alex");
  const [lastName, setLastName] = useState("Chen");
  const [email, setEmail] = useState("alex.chen@example.com");

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <BackButton onClick={onBack} />
        <h1 className="text-[#0F172A] text-xl font-bold">Profile</h1>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <InputField label="First name" id="fn" value={firstName} onChange={setFirstName} />
        <InputField label="Last name" id="ln" value={lastName} onChange={setLastName} />
      </div>
      <InputField label="Email" id="email" type="email" value={email} onChange={setEmail} />
    </div>
  );
}

function NotificationsSection({ onBack }: { onBack: () => void }) {
  const [push, setPush] = useState(true);
  const [email, setEmail] = useState(true);
  const [sms, setSms] = useState(false);
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <BackButton onClick={onBack} />
        <h1 className="text-[#0F172A] text-xl font-bold">Notifications</h1>
      </div>
      <section className="bg-white rounded-2xl p-4 flex flex-col gap-4">
        <Toggle id="push" label="Push notifications" checked={push} onChange={setPush} />
        <Toggle id="email" label="Email" checked={email} onChange={setEmail} />
        <Toggle id="sms" label="SMS" checked={sms} onChange={setSms} />
      </section>
    </div>
  );
}

function SecuritySection({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <BackButton onClick={onBack} />
        <h1 className="text-[#0F172A] text-xl font-bold">Security</h1>
      </div>
      <section className="bg-white rounded-2xl p-5">
        <p className="text-[#475569] text-sm">Security settings are ready for integration.</p>
      </section>
    </div>
  );
}

function SubscriptionSection({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <BackButton onClick={onBack} />
        <h1 className="text-[#0F172A] text-xl font-bold">Subscription</h1>
      </div>
      <section className="bg-white rounded-2xl p-5">
        <p className="text-[#0F172A] text-lg font-semibold">Buffer Pro</p>
        <p className="text-[#475569] text-sm">$14.99/month</p>
      </section>
    </div>
  );
}

function SupportSection({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <BackButton onClick={onBack} />
        <h1 className="text-[#0F172A] text-xl font-bold">Help & Support</h1>
      </div>
      <section className="bg-white rounded-2xl p-5">
        <a href="mailto:support@mybuffer.ca" className="text-[#00C9A7] text-sm">
          support@mybuffer.ca
        </a>
      </section>
    </div>
  );
}

export function AccountScreen() {
  const [section, setSection] = useState<Section>("main");
  const { signOut } = useClerk();

  if (section === "profile") return <div className="px-4 py-5 max-w-2xl mx-auto w-full pb-24 lg:pb-6"><ProfileSection onBack={() => setSection("main")} /></div>;
  if (section === "notifications") return <div className="px-4 py-5 max-w-2xl mx-auto w-full pb-24 lg:pb-6"><NotificationsSection onBack={() => setSection("main")} /></div>;
  if (section === "security") return <div className="px-4 py-5 max-w-2xl mx-auto w-full pb-24 lg:pb-6"><SecuritySection onBack={() => setSection("main")} /></div>;
  if (section === "subscription") return <div className="px-4 py-5 max-w-2xl mx-auto w-full pb-24 lg:pb-6"><SubscriptionSection onBack={() => setSection("main")} /></div>;
  if (section === "support") return <div className="px-4 py-5 max-w-2xl mx-auto w-full pb-24 lg:pb-6"><SupportSection onBack={() => setSection("main")} /></div>;

  return (
    <div className="flex flex-col gap-5 px-4 py-5 max-w-2xl mx-auto w-full pb-24 lg:pb-6">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-[#00C9A7]/20 flex items-center justify-center text-[#00C9A7] text-2xl font-bold">A</div>
        <div>
          <p className="text-[#0F172A] font-semibold text-lg">Alex Chen</p>
          <p className="text-[#64748B] text-sm">alex.chen@example.com</p>
        </div>
      </div>

      <nav aria-label="Account sections">
        <ul className="bg-white rounded-2xl overflow-hidden divide-y divide-[#E2E8F0]">
          {[
            { id: "profile", label: "Profile", desc: "Name, email" },
            { id: "notifications", label: "Notifications", desc: "Push, email, SMS" },
            { id: "security", label: "Security", desc: "Password, passkey, 2FA" },
            { id: "subscription", label: "Subscription", desc: "Plan, billing, PAD" },
            { id: "support", label: "Help & Support", desc: "FAQ, contact" },
          ].map((item) => (
            <li key={item.id}>
              <button type="button" onClick={() => setSection(item.id as Section)} className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[#F1F5F9] transition-colors text-left">
                <div className="flex-1 min-w-0">
                  <p className="text-[#0F172A] text-sm font-medium">{item.label}</p>
                  <p className="text-[#64748B] text-xs">{item.desc}</p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <button type="button" onClick={() => void signOut()} className="w-full text-red-400 text-sm font-medium py-3 rounded-xl border border-red-500/20 hover:bg-red-500/10 transition-colors">
        Sign Out
      </button>
    </div>
  );
}
