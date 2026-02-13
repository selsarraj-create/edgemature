import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Scanner from './components/Scanner';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <div className="min-h-screen bg-black text-white relative overflow-hidden">
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
              <Scanner />
            </div>
            <footer className="relative z-10 text-center pb-8 px-4">
              <p className="text-gray-600 text-xs font-medium">
                Evaluation provided by Agency Scout AI.
                <br />We are not a modeling agency and do not guarantee work.
              </p>
              <p className="text-gray-700 text-xs mt-2">&copy; 2026 AGENCY SCOUT</p>
            </footer>
          </div>
        } />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
