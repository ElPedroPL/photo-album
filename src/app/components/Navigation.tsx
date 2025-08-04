"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link 
              href="/" 
              className={`text-xl font-bold ${
                isActive("/") ? "text-blue-600" : "text-gray-800"
              } hover:text-blue-600 transition-colors`}
            >
              Photo Album
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive("/") 
                  ? "bg-blue-100 text-blue-700" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              } transition-colors`}
            >
              Galeria
            </Link>
            
            {session ? (
              <>
                <Link
                  href="/upload"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive("/upload") 
                      ? "bg-blue-100 text-blue-700" 
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  } transition-colors`}
                >
                  Dodaj zdjęcie
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  Wyloguj
                </button>
                <span className="text-sm text-gray-500">
                  {session.user?.name || session.user?.email}
                </span>
              </>
            ) : (
              <Link
                href="/login"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive("/login") 
                    ? "bg-blue-100 text-blue-700" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                } transition-colors`}
              >
                Zaloguj
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 