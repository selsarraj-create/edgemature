import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { ArrowRight, Loader2 } from 'lucide-react';

const LeadForm = ({ analysisData, onSubmitSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        age: 32, // Default 30+
        phone: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Insert lead into 'mature' table on Supabase
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
        <div className="w-full max-w-md mx-auto p-6 bg-white shadow-xl rounded-none sm:rounded-xl">
            <h2 className="font-serif text-3xl font-bold mb-2 text-stone-900">Unlock Your Report</h2>
            <p className="font-sans text-stone-500 mb-6 text-sm">
                Enter your details to receive your professional potential score and agency breakdown.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-xs uppercase tracking-wider font-bold text-stone-400 mb-1">Full Name</label>
                    <input
                        type="text"
                        required
                        className="w-full border-b-2 border-stone-200 bg-transparent py-3 text-lg font-serif placeholder:font-sans focus:outline-none focus:border-stone-900 transition-colors"
                        placeholder="Jane Doe"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-xs uppercase tracking-wider font-bold text-stone-400 mb-1">Age</label>
                    <input
                        type="number"
                        required
                        min="30"
                        className="w-full border-b-2 border-stone-200 bg-transparent py-3 text-lg font-serif placeholder:font-sans focus:outline-none focus:border-stone-900 transition-colors"
                        value={formData.age}
                        onChange={e => setFormData({ ...formData, age: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-xs uppercase tracking-wider font-bold text-stone-400 mb-1">Phone Number</label>
                    <input
                        type="tel"
                        required
                        className="w-full border-b-2 border-stone-200 bg-transparent py-3 text-lg font-serif placeholder:font-sans focus:outline-none focus:border-stone-900 transition-colors"
                        placeholder="+1 (555) 000-0000"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    />
                </div>

                {error && <div className="text-red-500 text-sm">{error}</div>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-stone-900 text-white font-sans font-bold py-4 uppercase tracking-widest hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 mt-4"
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <>Reveal Results <ArrowRight size={20} /></>}
                </button>
            </form>
        </div>
    );
};

export default LeadForm;
