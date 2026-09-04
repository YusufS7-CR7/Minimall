import { useApp } from "@/context/AppContext";

export default function Toast() {
  const { toastMessage } = useApp();

  if (!toastMessage) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 bg-gray-900/95 text-white px-5 py-3 rounded-2xl shadow-xl backdrop-blur-md border border-white/10 text-sm font-medium animate-in fade-in slide-in-from-bottom-3 duration-200 pointer-events-none"
    >
      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
      <span>{toastMessage}</span>
    </div>
  );
}
