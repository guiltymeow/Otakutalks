"use client";
import React from "react";
import { FaHome, FaFire, FaUser } from "react-icons/fa";
import ProfilePanel from "./profile";
import TopicPanel from "./Topics";
import Link from "next/link";

const SidePanel = () => {
  return (
    <aside className="w-[300px] h-screen p-4 border-r border-gray-300 bg-white sticky top-0 overflow-y-auto">
      {/* Profile Section */}
      <ProfilePanel />

      {/* Navigation Links */}
      <nav className="flex flex-col gap-2 mt-4">
        <Link href="/" className="text-[16px] font-regular pl-2 cursor-pointer flex items-center gap-2">
          <FaHome /> Home
        </Link>
        <Link href="/about" className="text-[16px] font-regular pl-2 cursor-pointer flex items-center gap-2">
          <FaUser /> Profile
        </Link>
        <h2 className="text-[16px] font-regular pl-2 cursor-pointer flex items-center gap-2">
          <FaFire /> Popular
        </h2>
      </nav>

      {/* Separator Line */}
      <hr className="my-4 border-gray-300" />

      {/* Topics Section */}
      <TopicPanel />
    </aside>
  );
};

export default SidePanel;
