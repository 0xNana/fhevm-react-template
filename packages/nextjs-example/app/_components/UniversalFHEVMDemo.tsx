"use client";

import { useState } from "react";
import { CounterDemo } from "./CounterDemo";
import { BankDemo } from "./BankDemo";
import VotingDemo from "./VotingDemo";

type DemoType = "counter" | "bank" | "voting";

/**
 * Universal FHEVM Demo - Main navigation component
 * 
 * This component provides a unified interface for all three FHEVM demos:
 * - Counter Demo (using Universal SDK)
 * - Bank Demo (confidential banking)
 * - Voting Demo (confidential voting)
 */
export function UniversalFHEVMDemo() {
  const [activeDemo, setActiveDemo] = useState<DemoType>("counter");

  const demos = [
    {
      id: "counter" as DemoType,
      title: "🔢 Counter",
      description: "Simple counter with Universal SDK",
      icon: "🔢"
    },  
    {
      id: "bank" as DemoType,
      title: "🏦 FHE Bank",
      description: "Confidential banking operations",
      icon: "🏦"
    },
    {
      id: "voting" as DemoType,
      title: "🗳️ FHE Voting",
      description: "Confidential voting system",
      icon: "🗳️"
    }
  ];

  const renderDemo = () => {
    switch (activeDemo) {
      case "counter":
        return <CounterDemo />;
      case "bank":
        return <BankDemo />;
      case "voting":
        return <VotingDemo />;
      default:
        return <CounterDemo />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Universal FHEVM SDK Demo
        </h1>
        <p className="text-xl text-gray-600 mb-2">
          Framework-agnostic SDK with React, Vue, and Node.js
        </p>
        
        {/* Video Link */}
        <div className="mt-6 mb-4">
          <a
            href="https://youtu.be/VRxe3VqMzYI"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            <span>🎥 Watch Video Presentation</span>
          </a>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-8">
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          {demos.map((demo) => (
            <button
              key={demo.id}
              onClick={() => setActiveDemo(demo.id)}
              className={`flex items-center space-x-3 px-6 py-4 rounded-lg border-2 transition-all duration-200 ${
                activeDemo === demo.id
                  ? "border-blue-500 bg-blue-50 text-blue-700 shadow-lg"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <span className="text-2xl">{demo.icon}</span>
              <div className="text-left">
                <div className="font-semibold">{demo.title}</div>
                <div className="text-sm opacity-75">{demo.description}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Active Demo Indicator */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-full">
            <span className="text-2xl">{demos.find(d => d.id === activeDemo)?.icon}</span>
            <span className="font-medium text-gray-700">
              {demos.find(d => d.id === activeDemo)?.title}
            </span>
          </div>
        </div>
      </div>

      {/* Demo Content */}
      <div className="min-h-[600px]">
        {renderDemo()}
      </div>

      {/* Footer */}
      <div className="mt-12 text-center">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            🚀 Universal FHEVM SDK
          </h3>
          <p className="text-gray-600 mb-4">
            Framework-agnostic confidential computing toolkit for React, Vue, and Node.js
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>React Hooks</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>Vue Composables</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span>Node.js CLI</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              <span>TypeScript First</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
