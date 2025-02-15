"use client";
import Header from "../components/header";
import SidePanel from "../components/sidepanel";
import Postedit from "./userpost";

export default function about() {
  return (
    <main className="flex flex-col md:flex-row items-start min-h-screen p-6 bg-white font-sans">
      {/* Header */}
      <Header />
      <div className="flex w-full md:w-[85%] lg:w-[80%] mt-10 space-x-4">
        {/* Left Side: Side Panel (Moved 20px Left) */}
        <div className="w-1/3 ml-[-20px]">
          <SidePanel />
        </div>

        {/* Right Side: Trending Posts */}
        <div className="w-2/3 mt-8 ">
          <Postedit />
        </div>
      </div>
    </main>
  );
}
