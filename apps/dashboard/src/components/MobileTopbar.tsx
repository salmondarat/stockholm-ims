"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Sidebar from "./Sidebar";

export default function MobileTopbar({
  user,
}: {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
}) {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const pathname = usePathname();
  return (
    <>
      <div className="md:hidden sticky top-0 z-40 bg-white/90 backdrop-blur border-b px-3 py-2 flex items-center justify-between">
        <button
          className="h-9 w-9 grid place-items-center rounded-md bg-[#280299] text-white active:translate-y-px"
          aria-label="Open navigation"
          onClick={() => setOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link href="/app" className="font-semibold">
          Dashboard
        </Link>
        {/* Profile button */}
        <button
          className="h-9 w-9 grid place-items-center rounded-full bg-gray-200 overflow-hidden"
          aria-label="Open profile menu"
          onClick={() => setProfileOpen(true)}
        >
          {user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt="avatar"
              className="h-9 w-9 object-cover"
            />
          ) : (
            <span className="text-sm font-semibold text-gray-700">
              {(user?.name || user?.email || "?").charAt(0).toUpperCase()}
            </span>
          )}
        </button>
      </div>

      {open && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-72 shadow-2xl">
            <div className="h-full bg-[#280299] text-white relative">
              <button
                className="absolute right-3 top-3 h-9 w-9 grid place-items-center rounded-md hover:bg-white/10"
                aria-label="Close navigation"
                onClick={() => setOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
              {/* reuse Sidebar markup by rendering it and hiding desktop-only wrapper */}
              <div className="pt-12 px-0">
                {/* Reuse Sidebar in mobile variant */}
                <Sidebar variant="mobile" user={user} />
              </div>
            </div>
          </div>
        </div>
      )}

      {profileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setProfileOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-72 shadow-2xl">
            <div className="h-full bg-white text-gray-900 relative">
              <button
                className="absolute right-3 top-3 h-9 w-9 grid place-items-center rounded-md hover:bg-gray-100"
                aria-label="Close profile"
                onClick={() => setProfileOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
              <div className="pt-12 px-4 space-y-2">
                <div className="flex items-center gap-3">
                  {user?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.image}
                      alt="avatar"
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-200 grid place-items-center text-gray-700 font-bold">
                      {(user?.name || user?.email || "?")
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="font-medium">{user?.name ?? "Profile"}</div>
                    <div className="text-sm text-gray-500">
                      {user?.email ?? "Signed in"}
                    </div>
                  </div>
                </div>
                <div className="mt-2 border-t pt-2 space-y-1">
                  <Link
                    href="/app/profile"
                    className="block rounded-md px-3 py-2 hover:bg-gray-100"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/app/settings"
                    className="block rounded-md px-3 py-2 hover:bg-gray-100"
                  >
                    Settings
                  </Link>
                  <Link
                    href="/app/help"
                    className="block rounded-md px-3 py-2 hover:bg-gray-100"
                  >
                    Help
                  </Link>
                  <form method="post" action="/api/auth/signout">
                    <input type="hidden" name="callbackUrl" value="/" />
                    <button
                      className="w-full text-left rounded-md px-3 py-2 hover:bg-gray-100"
                      type="submit"
                    >
                      Logout
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
