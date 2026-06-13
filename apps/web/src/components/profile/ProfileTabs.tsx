"use client";

import { useState } from "react";
import type { FullUser } from "@/app/profile/page";
import AccountSettingsTab from "./AccountSettingsTab";
import SecurityTab from "./SecurityTab";
import DangerZone from "./DangerZone";

const tabs = ["Account settings", "Security"] as const;
type Tab = (typeof tabs)[number];

export default function ProfileTabs({
  user,
  onUserUpdate,
}: {
  user: FullUser;
  onUserUpdate: (user: FullUser) => void;
}) {
  const [active, setActive] = useState<Tab>("Account settings");

  return (
    <div>
      <div className="flex gap-1 border-b border-blue-500/15 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`px-1 py-2.5 text-sm border-b-2 transition-colors ${
              active === tab
                ? "text-blue-400 border-blue-400"
                : "text-gray-500 border-transparent hover:text-gray-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {active === "Account settings" && (
        <>
          <AccountSettingsTab user={user} onUserUpdate={onUserUpdate} />
          <div className="border-t border-blue-500/10 my-6" />
          <DangerZone />
        </>
      )}

      {active === "Security" && <SecurityTab />}
    </div>
  );
}