import React from 'react';
import Scanner from './components/Scanner';

function App() {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        <Scanner />
      </div>

      {/* Footer */}
      <footer className="relative z-10 text-center pb-8 px-4">
        <p className="text-gray-600 text-xs font-medium">
          Evaluation provided by Agency Scout AI.
          <br />We are not a modeling agency and do not guarantee work.
        </p>
        <p className="text-gray-700 text-xs mt-2">&copy; 2026 AGENCY SCOUT</p>
      </footer>
    </div>
  );
}

export default App;
