/**
 * AppContextBridge — reads the current userId from AuthContext
 * and passes it into AppProvider so that cart & favorites are
 * persisted separately per user account.
 */
import type { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { AppProvider } from "@/context/AppContext";

export default function AppContextBridge({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  // "guest" is used as the key when no user is logged in
  const userId = user?.id ?? "guest";
  return <AppProvider userId={userId}>{children}</AppProvider>;
}
