import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ProcessingAnimation = ({ onComplete, hasResult }) => {
    const [textIndex, setTextIndex] = useState(0);
    const messages = [
        "Analyzing Facial Structure...",
        "Measuring Symmetry...",
        "Evaluating Market Fit...",
        "Calculating Potential..."
    ];

    useEffect(() => {
        const textInterval = setInterval(() => {
            setTextIndex((prev) => (prev + 1) % messages.length);
        }, 1500);

        return () => clearInterval(textInterval);
    }, []);

    useEffect(() => {
        if (hasResult) {
            onComplete();
            return;
        }

        const timeout = setTimeout(() => {
            if (!hasResult) {
                console.warn("ProcessingAnimation timed out without result");
                onComplete();
            }
        }, 15000);

        return () => clearTimeout(timeout);
    }, [hasResult, onComplete]);

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center bg-stone-50 overflow-hidden">
            {/* Minimalist Scan Line */}
            <motion.div
                className="absolute w-full h-[1px] bg-stone-900/20"
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 3, ease: "linear", repeat: Infinity }}
            />

            <div className="z-10 text-center px-6">
                <div className="mb-8">
                    <div className="w-16 h-16 border border-stone-800 rounded-full mx-auto flex items-center justify-center animate-pulse">
                        <div className="w-12 h-12 bg-stone-800 rounded-full" />
                    </div>
                </div>

                <h3 className="font-serif text-2xl mb-2 text-stone-900">Processing</h3>

                <div className="h-6 overflow-hidden relative">
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={textIndex}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-stone-500 font-sans text-sm tracking-wide uppercase"
                        >
                            {messages[textIndex]}
                        </motion.p>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default ProcessingAnimation;
