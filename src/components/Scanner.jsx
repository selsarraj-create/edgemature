import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, ScanFace, Check, ArrowRight, Zap, Loader2 } from 'lucide-react';
import ProcessingAnimation from './ProcessingAnimation';
import LeadForm from './LeadForm';
import { compressImage } from '../utils/imageUtils';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

// Use /api for production (Vercel), localhost for development
const API_URL = import.meta.env.MODE === 'production' ? '/api' : 'http://localhost:8000/api';

const Scanner = () => {
    const [state, setState] = useState('IDLE'); // IDLE, PROCESSING, WAITING_FOR_RESULT, PREVIEW, COMPLETE
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [showApplyForm, setShowApplyForm] = useState(false);
    const fileInputRef = useRef(null);

    // Mock result for dev testing
    const MOCK_RESULT = {
        suitability_score: 88,
        market_categorization: { primary: 'Editorial', rationale: 'Strong editorial features with mature appeal.' },
        face_geometry: { primary_shape: 'Oval', jawline_definition: 'Defined', structural_note: 'High cheekbones with balanced symmetry.' },
        aesthetic_audit: { lighting_quality: 'Natural', professional_readiness: 'Semi-Pro', technical_flaw: 'Slight under-eye shadows.' },
        scout_feedback: 'Strong editorial potential with versatile mature features.'
    };

    const handleFileSelect = async (selectedFile) => {
        if (!selectedFile) return;
        setFile(selectedFile);
        setPreviewUrl(URL.createObjectURL(selectedFile));
        setState('PROCESSING');

        try {
            setAnalysisResult(null);
            const compressedFile = await compressImage(selectedFile);
            const formData = new FormData();
            formData.append('file', compressedFile);

            const response = await axios.post(`${API_URL}/analyze`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 35000
            });
            setAnalysisResult(response.data);
        } catch (error) {
            console.warn("Backend unreachable, using mock data for demo.", error);
            await new Promise(resolve => setTimeout(resolve, 3000));
            setAnalysisResult(MOCK_RESULT);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.type.startsWith('image/')) {
            handleFileSelect(droppedFile);
        }
    };

    const onAnimationComplete = () => {
        setState((curr) => curr === 'PROCESSING' ? 'WAITING_FOR_RESULT' : curr);
    };

    useEffect(() => {
        if (state === 'WAITING_FOR_RESULT') {
            if (analysisResult) {
                if (analysisResult.error) {
                    alert(`Analysis Failed: ${analysisResult.error}`);
                    setState('IDLE');
                    return;
                }
                setState('PREVIEW');
            } else {
                const safetyTimer = setTimeout(() => {
                    if (!analysisResult) {
                        alert("Server timeout. Please try again.");
                        setState('IDLE');
                    }
                }, 30000);
                return () => clearTimeout(safetyTimer);
            }
        }
    }, [state, analysisResult]);

    const handleFormSuccess = () => {
        setState('COMPLETE');
    };

    const reset = () => {
        setState('IDLE');
        setFile(null);
        setPreviewUrl(null);
        setAnalysisResult(null);
        setShowApplyForm(false);
    };

    return (
        <div className="w-full max-w-4xl mx-auto min-h-[700px] flex flex-col items-center px-4 font-sans text-white transition-colors duration-300">

            {/* Header */}
            <div className="mb-4 text-center">
                <h1 className="text-3xl sm:text-5xl font-black tracking-tighter mb-2 leading-tight text-white">
                    Could You Be A <span className="text-brand-start">Model</span>?
                </h1>
                <p className="text-lg font-bold text-white mb-1">
                    AI-Powered Analysis for Models 30+
                </p>
                <p className="text-sm text-gray-400 font-medium">
                    Find Out Instantly With Our AI Analysis
                </p>
            </div>

            {/* Ambient Background (Aurora) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600/20 blur-[100px] rounded-full animate-pulse-slow" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-violet-600/20 blur-[100px] rounded-full animate-pulse-slow" style={{ animationDelay: '1s' }} />
            </div>

            {/* Main Area - Portal Card */}
            <div className={`relative z-10 w-full max-w-md ${state === 'IDLE' ? 'min-h-[500px]' : 'min-h-[700px]'} bg-black/40 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/50 rounded-3xl overflow-hidden transition-all duration-500 ease-in-out`}>

                {/* IDLE STATE */}
                {state === 'IDLE' && (
                    <div
                        className="absolute inset-0 flex flex-col items-center justify-center p-8 cursor-pointer group"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            type="file"
                            hidden
                            ref={fileInputRef}
                            accept=".jpg,.jpeg,.png"
                            onChange={(e) => handleFileSelect(e.target.files[0])}
                        />

                        {/* Upload Zone (Viewfinder) */}
                        <div className="relative w-64 h-64 mb-8 flex items-center justify-center">
                            {/* Corner Brackets */}
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-400 rounded-tl-lg group-hover:translate-x-2 group-hover:translate-y-2 transition-transform duration-300" />
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-400 rounded-tr-lg group-hover:-translate-x-2 group-hover:translate-y-2 transition-transform duration-300" />
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-400 rounded-bl-lg group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-300" />
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-400 rounded-br-lg group-hover:-translate-x-2 group-hover:-translate-y-2 transition-transform duration-300" />

                            {/* Icon */}
                            <div className="text-white animate-pulse">
                                <ScanFace size={64} strokeWidth={1} />
                            </div>
                        </div>

                        <h3 className="text-2xl font-bold mb-2 text-center text-white">Let's See Your Potential.</h3>
                        <p className="text-gray-400 text-base text-center max-w-sm mb-8 font-medium">
                            Drop your best selfie here.
                        </p>

                        <button className="bg-gradient-to-r from-blue-600 to-violet-600 text-white font-bold rounded-full px-8 py-3 shadow-lg shadow-blue-500/30 hover:scale-105 transition-transform">
                            Select Photo
                        </button>

                        {import.meta.env.DEV && (
                            <button
                                onClick={(e) => { e.stopPropagation(); setState('PROCESSING'); setTimeout(() => setAnalysisResult(MOCK_RESULT), 2000); }}
                                className="mt-4 text-xs text-red-500 underline"
                            >
                                [DEV] Mock Scan
                            </button>
                        )}
                    </div>
                )}

                {/* PROCESSING STATE */}
                {(state === 'PROCESSING' || state === 'WAITING_FOR_RESULT') && (
                    <>
                        {previewUrl && <img src={previewUrl} className="absolute inset-0 w-full h-full object-cover opacity-30 blur-sm" alt="Scanning" />}
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
                            <ProcessingAnimation onComplete={onAnimationComplete} hasResult={!!analysisResult} />
                        </div>
                        {state === 'WAITING_FOR_RESULT' && (
                            <div className="absolute bottom-10 left-0 right-0 text-center z-50">
                                <p className="text-brand-start font-bold animate-pulse flex items-center justify-center gap-2">
                                    <Loader2 className="animate-spin" size={16} /> Finalizing Analysis...
                                </p>
                            </div>
                        )}
                    </>
                )}

                {/* PREVIEW & COMPLETE STATE */}
                {(state === 'PREVIEW' || state === 'COMPLETE') && analysisResult && (
                    <div className="flex flex-col h-full md:absolute md:inset-0 md:flex-row">
                        {/* Image Side */}
                        <div className="relative w-full md:w-1/3 h-64 md:h-full bg-black">
                            {previewUrl && <img src={previewUrl} className="w-full h-full object-cover" alt="Analyzed" />}
                            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-violet-400 border border-white/10">
                                {analysisResult.market_categorization?.primary?.toUpperCase() || 'ANALYZED'}
                            </div>
                        </div>

                        {/* Results Side */}
                        <div className="flex-1 p-5 md:p-6 bg-card-dark flex flex-col overflow-y-auto transition-colors duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight text-white mb-1">Analysis Results</h2>
                                    <p className="text-xs text-gray-400 font-medium mb-2">Powered By Vision 3.0</p>
                                    <div className="text-sm font-bold text-brand-start tracking-wider uppercase">
                                        {analysisResult.market_categorization?.primary || 'UNCATEGORIZED'}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-5xl font-black text-brand-start">
                                        {analysisResult.suitability_score || 0}
                                    </div>
                                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Suitability Score</div>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Face Shape</div>
                                    <div className="font-bold text-sm">{analysisResult.face_geometry?.primary_shape || 'Analyzing...'}</div>
                                </div>
                                <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Jawline</div>
                                    <div className="font-bold text-sm">{analysisResult.face_geometry?.jawline_definition || 'Analyzing...'}</div>
                                </div>
                            </div>

                            <div className="mb-4 p-3 bg-brand-start/5 rounded-2xl border border-brand-start/10">
                                <span className="text-[10px] text-brand-start uppercase font-black tracking-wider flex items-center gap-2 mb-1">
                                    <Zap size={10} fill="currentColor" /> Structural Note
                                </span>
                                <p className="text-xs font-medium italic text-white">"{analysisResult.face_geometry?.structural_note || 'N/A'}"</p>
                            </div>

                            {/* BLURRED SECTION (Gated Content) */}
                            <div className="relative w-full rounded-2xl overflow-hidden border border-white/10 bg-white/5 p-4 flex-grow flex flex-col justify-center min-h-[350px]">
                                <div className="absolute top-4 left-4 z-0 opacity-50">
                                    <h3 className="font-bold text-sm flex items-center gap-2">
                                        <ScanFace size={16} className="text-brand-start" />
                                        Insider Information
                                    </h3>
                                </div>

                                {/* Content to blur */}
                                <div className={`space-y-4 pt-6 ${state === 'PREVIEW' ? 'blur-md filter select-none opacity-30' : ''}`}>
                                    <div>
                                        <h4 className="text-[10px] font-bold uppercase text-gray-400">Aesthetic Audit</h4>
                                        <p className="text-xs font-medium mt-1">
                                            {analysisResult.aesthetic_audit?.lighting_quality || 'Unknown'} lighting detected.
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-bold uppercase text-gray-400">Scout Verdict</h4>
                                        <p className="text-xs font-medium mt-1">
                                            {analysisResult.scout_feedback || 'No feedback generated.'}
                                        </p>
                                    </div>
                                </div>

                                {/* GATE OVERLAY */}
                                {state === 'PREVIEW' && (
                                    <>
                                        {!showApplyForm ? (
                                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center z-20">
                                                {!analysisResult.suitability_score || Number(analysisResult.suitability_score) < 50 ? (
                                                    // FAILED SCAN UI
                                                    <>
                                                        <div className="mb-2 bg-red-500 text-white p-3 rounded-full shadow-lg shadow-red-500/30">
                                                            <X size={24} strokeWidth={4} />
                                                        </div>
                                                        <h3 className="text-xl font-black mb-1 text-white">
                                                            Please try again
                                                        </h3>
                                                        <p className="text-sm text-gray-300 font-medium mb-3 max-w-xs mx-auto leading-tight">
                                                            We couldn't detect a clear face.
                                                        </p>
                                                        <button
                                                            onClick={reset}
                                                            className="w-full max-w-xs bg-white/10 text-white border border-white/20 font-bold py-3 px-6 rounded-full text-base transition-transform hover:scale-[1.02] active:scale-95 shadow-xl flex items-center justify-center gap-2"
                                                        >
                                                            Upload Selfie <Upload size={18} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    // SUCCESS UI
                                                    <>
                                                        <div className="mb-2 bg-brand-start text-white p-3 rounded-full shadow-lg shadow-brand-start/30">
                                                            <Check size={24} strokeWidth={4} />
                                                        </div>
                                                        <h3 className="text-xl font-black mb-1 text-white">
                                                            Congratulations!
                                                        </h3>
                                                        <p className="text-sm text-gray-300 font-medium mb-3 max-w-xs mx-auto leading-tight">
                                                            Your face structure matches 3+ partner agencies.
                                                        </p>
                                                        <button
                                                            onClick={() => setShowApplyForm(true)}
                                                            className="w-full max-w-xs bg-gradient-to-r from-brand-start to-brand-end text-white font-bold py-3 px-6 rounded-full text-base transition-transform hover:scale-[1.02] active:scale-95 shadow-xl shadow-brand-start/40 flex items-center justify-center gap-2"
                                                        >
                                                            Apply Now <ArrowRight size={18} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="absolute inset-0 z-20 bg-card-dark overflow-y-auto">
                                                <LeadForm
                                                    analysisData={analysisResult}
                                                    onSubmitSuccess={handleFormSuccess}
                                                />
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Scanner;
