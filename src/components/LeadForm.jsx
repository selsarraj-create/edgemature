import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { ArrowRight, Loader2 } from 'lucide-react';

const LeadForm = ({ analysisData, onSubmitSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        age: 32,
        phone: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error: insertError } = await supabase
                .from('mature')
                .insert([{
                    name: formData.name,
                    age: parseInt(formData.age),
                    phone: formData.phone,
                    lead_code: '#MOD30-SCOUT',
                    score: analysisData?.suitability_score || 0,
                    category: analysisData?.market_categorization?.primary || 'Unknown',
                    analysis_json: analysisData || {},
                }]);

            if (insertError) throw insertError;
            onSubmitSuccess();

        } catch (err) {
            console.error("Submission error:", err);
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full h-full flex flex-col justify-center p-6 bg-card-dark">
            <h2 className="text-2xl font-black mb-1 text-white">Apply Now</h2>
            <p className="text-gray-400 mb-6 text-sm font-medium">
                Enter your details to unlock your full report and get matched with agencies.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">Full Name</label>
                    <input
                        type="text"
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-start transition-colors"
                        placeholder="Jane Doe"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">Age</label>
                    <input
                        type="number"
                        required
                        min="30"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-start transition-colors"
                        value={formData.age}
                        onChange={e => setFormData({ ...formData, age: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">Phone Number</label>
                    <input
                        type="tel"
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-start transition-colors"
                        placeholder="+44 7700 000000"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    />
                </div>

                {error && <div className="text-red-400 text-sm font-medium">{error}</div>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-brand-start to-brand-end text-white font-bold py-3 px-6 rounded-full text-base transition-transform hover:scale-[1.02] active:scale-95 shadow-xl shadow-brand-start/40 flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <>Submit Application <ArrowRight size={18} /></>}
                </button>
            </form>
        </div>
    );
};

export default LeadForm;
