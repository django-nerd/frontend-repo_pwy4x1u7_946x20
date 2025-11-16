import React from 'react'
import { Compass, MapPin, Rocket, Sparkles, ShoppingCart } from 'lucide-react'

export default function SmartCityShell({ children }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(1000px_600px_at_70%_0%,#0ea5e9_0%,transparent_60%),radial-gradient(800px_400px_at_0%_0%,#1d4ed8_0%,transparent_50%),linear-gradient(180deg,#020617_0%,#0b1220_100%)] text-white">
      <header className="sticky top-0 z-30 backdrop-blur bg-white/5 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 font-extrabold tracking-tight">
            <Rocket size={18} className="text-sky-300" />
            <span>CheapStop</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-sky-200">
            <div className="inline-flex items-center gap-2"><Sparkles size={16}/> Smart routes</div>
            <div className="inline-flex items-center gap-2"><Compass size={16}/> Nearby stores</div>
            <div className="inline-flex items-center gap-2"><ShoppingCart size={16}/> Basket pricing</div>
          </div>
        </div>
      </header>
      {children}
      <footer className="py-10 text-center text-sky-300/70 text-xs">
        Built for smart cities • CheapStop
      </footer>
    </div>
  )
}
