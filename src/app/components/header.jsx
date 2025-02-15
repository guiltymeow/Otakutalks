"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiMoreHorizontal, FiSearch } from "react-icons/fi";
import { auth } from "../../lib/firebase"; // Ensure the correct import path
import { signOut, onAuthStateChanged } from "firebase/auth";

export default function Header() {
    const [search, setSearch] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [showLogoutPrompt, setShowLogoutPrompt] = useState(false);
    const router = useRouter();
    const menuRef = useRef(null);

    useEffect(() => {
        // Listen for auth state changes
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        return () => unsubscribe(); // Cleanup on unmount
    }, []);

    // Handle Logout
    const handleLogout = useCallback(async () => {
        await signOut(auth);
        setUser(null);
        setShowLogoutPrompt(false);
        router.push("/login"); // Redirect to login page
    }, [router]);

    // Close logout prompt when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowLogoutPrompt(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const hints = ["Fantasy", "Mystery", "Sci-Fi", "Romance", "Adventure"];

    return (
        <header className="w-full flex items-center justify-between bg-white py-2.5 px-4 shadow-md fixed top-0 left-0 z-50">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
                <Image src="/logo/OtakuTalklogo.jpg" alt="Logo" width={50} height={50} className="rounded-full" />
                <h1 className="text-[26px] font-bold text-orange-500 font-archivo">OtakuTalk's</h1>
            </div>

            {/* Search Bar */}
            <div className="relative w-1/3">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search..."
                    className="w-full p-1.5 pl-10 border border-gray-300 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 h-[75%] font-archivo"
                />
                {search && (
                    <ul className="absolute bg-white border border-gray-300 w-full mt-1 rounded-lg shadow-lg font-archivo">
                        {hints
                            .filter((hint) => hint.toLowerCase().includes(search.toLowerCase()))
                            .map((hint, index) => (
                                <li key={index} className="p-2 hover:bg-gray-200 cursor-pointer">
                                    {hint}
                                </li>
                            ))}
                    </ul>
                )}
            </div>

            {/* Login/Logout Button and More Menu */}
            <div className="flex items-center space-x-4">
                {user ? (
                    <div className="relative" ref={menuRef}>
                        <button
                            className="px-5 py-1.5 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition h-[75%] font-archivo"
                            onClick={() => setShowLogoutPrompt(!showLogoutPrompt)}
                        >
                            {user.displayName || "Logged In"}
                        </button>

                        {/* Logout Confirmation Popup */}
                        {showLogoutPrompt && (
                            <div className="absolute right-0 mt-2 bg-white border border-gray-300 w-60 rounded-lg shadow-lg p-3 font-archivo">
                                <p className="text-center text-gray-700">You are already logged in. Do you want to log out?</p>
                                <div className="flex justify-center gap-2 mt-3">
                                    <button className="px-4 py-1 bg-gray-300 rounded-md" onClick={() => setShowLogoutPrompt(false)}>Cancel</button>
                                    <button className="px-4 py-1 bg-red-500 text-white rounded-md" onClick={handleLogout}>Logout</button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <Link href="/login">
                        <button className="px-5 py-1.5 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition h-[75%] font-archivo">
                            Log In
                        </button>
                    </Link>
                )}

                {/* More Menu */}
                <div className="relative">
                    <FiMoreHorizontal size={24} className="cursor-pointer" onClick={() => setMenuOpen(!menuOpen)} />
                    {menuOpen && (
                        <ul className="absolute right-0 mt-2 bg-white border border-gray-300 w-48 rounded-lg shadow-lg font-archivo">
                            <li
                                className="p-2 hover:bg-gray-200 cursor-pointer"
                                onClick={() => router.push("/login?signup=true")}
                            >
                                Log In/Sign Up
                            </li>
                            <li className="p-2 hover:bg-gray-200 cursor-pointer">Collectibles Avatar</li>
                            <li className="p-2 hover:bg-gray-200 cursor-pointer">Donate</li>
                        </ul>
                    )}
                </div>
            </div>
        </header>
    );
}
