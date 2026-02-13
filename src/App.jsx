import React from 'react';
import Scanner from './components/Scanner';

function App() {
  return (
    <div className="min-h-screen bg-stone-100 flex flex-col font-sans text-stone-900">
      {/* Navigation / Brand */}
      <nav className="p-6 flex justify-center">
        <span className="font-serif text-2xl font-bold tracking-tighter text-stone-900">
          AGENCY <span className="italic font-light">SCOUT</span>
        </span>
      </nav>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-start pt-8 pb-12 px-4">

        {/* Hero Section */}
        <div className="text-center mb-12 max-w-xl mx-auto">
          <h1 className="font-serif text-5xl md:text-6xl mb-6 leading-tight text-stone-900">
            Your Face is <br /> <span className="italic text-stone-600">Your Portfolio.</span>
          </h1>
          <p className="font-sans text-stone-500 uppercase tracking-widest text-xs font-semibold mb-8">
            AI-Powered Analysis for Models 30+
          </p>

          <div className="inline-block border-b-2 border-stone-900 pb-1 cursor-pointer hover:opacity-70 transition-opacity">
            <span className="font-serif text-xl italic">Scan for Market Potential &darr;</span>
          </div>
        </div>

        {/* Scanner Component */}
        <Scanner />

      </main>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-12 px-6 text-center mt-auto w-full">
        <div className="max-w-md mx-auto">
          <p className="font-serif text-xl italic mb-4 text-stone-200">Agency Scout</p>
          <p className="text-xs uppercase tracking-widest leading-relaxed opacity-60">
            Evaluation provided by Agency Scout AI. <br />
            We are not a modeling agency and do not guarantee work.
          </p>
          <div className="mt-8 text-[10px] text-stone-600">
            &copy; 2026 Agency Scout. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
