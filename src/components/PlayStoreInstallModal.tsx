import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PlayStoreInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PlayStoreInstallModal: React.FC<PlayStoreInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyPackage = () => {
    navigator.clipboard.writeText('com.mehmonajabeen.warriorarena');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl rounded-3xl bg-[#160629] border-2 border-purple-500/50 shadow-2xl shadow-purple-950/80 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header (White & Purple) */}
        <div className="p-5 bg-gradient-to-r from-[#2e1065] to-[#1a0833] border-b border-purple-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white text-purple-950 flex items-center justify-center text-3xl font-black shadow-lg shadow-white/30">
              📲
            </div>
            <div>
              <h2 className="text-2xl font-black text-white font-['Bungee'] tracking-wider">PLAY STORE & APP INSTALL</h2>
              <p className="text-xs text-purple-200">Playable on Mobile, Laptop, PC & Chromebook</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-purple-950 hover:bg-purple-900 border border-purple-600 text-white flex items-center justify-center font-bold text-lg transition"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-4 text-xs text-purple-100">
          {/* Creator Credentials Card (White & Purple) */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#2e1065] to-[#160529] border border-purple-500/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">👑</span>
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Warrior Arena</span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white text-purple-950 font-black">
                    OFFICIAL
                  </span>
                </div>
                <div className="text-xs text-purple-200 font-semibold mt-0.5">
                  Lead Game Architect & Creator: <span className="underline decoration-purple-400 font-bold text-white">Mehmona Jabeen</span>
                </div>
              </div>
            </div>
          </div>

          {/* 1. Direct In-App Instant Install Button */}
          <div className="p-4 rounded-2xl bg-[#120421] border border-purple-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>1-CLICK HOME SCREEN INSTALL</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-900 text-white border border-purple-500/50">
                  PWA Ready
                </span>
              </h3>
              <p className="text-purple-300 mt-1">
                Install as a full standalone app with offline support, zero browser address bar, and 60 FPS arcade performance.
              </p>
            </div>

            {isInstalled ? (
              <div className="px-4 py-2.5 rounded-xl bg-purple-950 text-white font-bold border border-white text-center whitespace-nowrap">
                ✓ Already Installed
              </div>
            ) : isInstallable ? (
              <button
                onClick={install}
                className="px-6 py-3 rounded-2xl bg-white text-purple-950 font-black text-sm uppercase tracking-wider hover:scale-105 active:scale-95 transition shadow-lg shadow-white/30 whitespace-nowrap"
              >
                INSTALL APP NOW
              </button>
            ) : isIOS ? (
              <div className="p-3 bg-[#1d0736] rounded-xl border border-purple-700 text-white text-[11px]">
                On iPhone/iPad: Tap <strong>Share (⎋)</strong> then tap <strong>Add to Home Screen (+)</strong>.
              </div>
            ) : (
              <div className="p-3 bg-[#1d0736] rounded-xl border border-purple-700 text-white text-center text-[11px]">
                Use browser menu (⋮) → "Install Warrior Arena"
              </div>
            )}
          </div>

          {/* 2. Google Play Store & Android APK Specification */}
          <div className="p-4 rounded-2xl bg-[#120421] border border-purple-800/60 flex flex-col gap-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>GOOGLE PLAY STORE PACKAGE SPECIFICATION</span>
              <span>📦</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
              <div className="p-3 bg-[#1d0736] rounded-xl border border-purple-800">
                <span className="text-purple-300">Application Title:</span>
                <div className="text-white font-bold text-xs mt-0.5">Warrior Arena</div>
              </div>

              <div className="p-3 bg-[#1d0736] rounded-xl border border-purple-800">
                <span className="text-purple-300">Developer & Publisher:</span>
                <div className="text-white font-bold text-xs mt-0.5">Mehmona Jabeen</div>
              </div>

              <div className="p-3 bg-[#1d0736] rounded-xl border border-purple-800 flex items-center justify-between">
                <div>
                  <span className="text-purple-300">Android Package ID:</span>
                  <div className="text-white font-mono font-bold text-xs mt-0.5">com.mehmonajabeen.warriorarena</div>
                </div>
                <button
                  onClick={handleCopyPackage}
                  className="px-2.5 py-1 bg-white hover:bg-purple-100 rounded text-[10px] text-purple-950 font-black"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <div className="p-3 bg-[#1d0736] rounded-xl border border-purple-800">
                <span className="text-purple-300">Android Architecture:</span>
                <div className="text-white font-bold text-xs mt-0.5">Trusted Web Activity (TWA) 64-bit</div>
              </div>
            </div>

            <div className="p-3 bg-[#18062e] rounded-xl border border-purple-800 text-[11px] leading-relaxed text-purple-200">
              <strong className="text-white">How to publish to Google Play:</strong>
              <p className="mt-1">
                Generate the signed Google Play APK / Android App Bundle (.aab) directly using <strong>PWABuilder.com</strong> or <strong>Google Bubblewrap CLI</strong> with package ID <code className="text-white font-bold">com.mehmonajabeen.warriorarena</code>.
              </p>
            </div>
          </div>

          {/* 3. Cross-Platform Compatibility Details */}
          <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
            <div className="p-3 bg-[#140526] rounded-2xl border border-purple-800">
              <span className="text-xl">📱</span>
              <div className="font-bold text-white mt-1">Mobile & Tablet</div>
              <div className="text-purple-300 text-[10px]">Arcade Touch Virtual D-Pad</div>
            </div>
            <div className="p-3 bg-[#140526] rounded-2xl border border-purple-800">
              <span className="text-xl">💻</span>
              <div className="font-bold text-white mt-1">Laptop & PC</div>
              <div className="text-purple-300 text-[10px]">Keyboard (WASD + J/K/U/I/L)</div>
            </div>
            <div className="p-3 bg-[#140526] rounded-2xl border border-purple-800">
              <span className="text-xl">🎮</span>
              <div className="font-bold text-white mt-1">Gamepads</div>
              <div className="text-purple-300 text-[10px]">USB / Bluetooth Gamepad API</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0e021a] border-t border-purple-800/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-white hover:bg-purple-100 text-purple-950 font-black text-xs transition"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
