"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";
import { clearAuth, getUser, StoredUser } from "@/lib/auth";




export default function Navbar() {
  const [user, setUser] = useState<StoredUser | null>(null);
  const router = useRouter();

  useEffect(() => {
    setUser(getUser());
  }, []);

  const handleLogout = () => {
    clearAuth();
    setUser(null);
    router.push("/");
  };

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-blue-500/10">
      <span className="text-sm tracking-widest text-blue-400 uppercase">TerrainQuest</span>
      <div className="hidden md:flex gap-6 text-sm text-gray-400">
        <a href="#features" className="hover:text-gray-200 transition-colors">Features</a>
        <a href="#how-it-works" className="hover:text-gray-200 transition-colors">How it works</a>
        <a href="#leaderboard" className="hover:text-gray-200 transition-colors">Leaderboard</a>
      </div>

      {user ? (
        <ProfileDropdown user={user} onLogout={handleLogout} />
      ) : (
        <div className="flex gap-3">
          <Link
            href="/login"
            className="text-sm text-gray-300 hover:text-white px-4 py-2 transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="text-sm font-medium bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Get started
          </Link>
        </div>
      )}
    </nav>
  );
}



import { useRef } from "react";
import { LayoutDashboard, User, LogOut, Route } from "lucide-react";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
function ProfileDropdown({
  user,
  onLogout,
}: {
  user: StoredUser;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

 const items = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Activities", href: "/activities", icon: Route },
    { label: "Profile", href: "/profile", icon: User },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-9 h-9 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-sm font-medium text-blue-400 hover:bg-blue-500/20 transition-colors overflow-hidden"
      >
        {user.avatarUrl ? (
          <img src={`${API_URL}${user.avatarUrl}`} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          user.username.slice(0, 2).toUpperCase()
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-[#161B24] border border-blue-500/20 rounded-xl shadow-lg overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-blue-500/10">
            <p className="text-sm font-medium text-gray-200 truncate">{user.username}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>

          <div className="py-1">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-blue-500/10 hover:text-white transition-colors"
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            ))}
          </div>

          <div className="border-t border-blue-500/10 py-1">
            <button
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}