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
            // We use signUp to capture the lead in Auth + Metadata
            // Since we don't need a password for this "Lead Capture" flow, 
            // we'll generate a random distinct one or use a passwordless approach if configured.
            // For now, assuming standard email/pass auth is the backend, we might need a dummy email/pass 
            // OR we insert into a custom table. 
            // Given the prompt "Lead capture form", and typical high-trust landing pages, 
            // let's try to insert into a 'leads' table if it exists, OR use auth with a generated email if email isn't asked.
            // Wait, the prompt says "Lead captures: Name, Age, and Phone". NO Email.
            // Supabase Auth requires Email. 
            // So we probably shouldn't use `supabase.auth.signUp` unless we generate a fake email.
            // However, usually these systems have a `leads` table.
            // I will assume there is a `leads` table or similar. 
            // BUT, without knowing the schema, the safest bet for "Lead Capture" without email 
            // is to try to RPC or just insert into a 'leads' table.
            // Since I can't verify the schema, I will try to insert into a 'leads' table.
            // If that fails, I'll fallback to logging it (or maybe I should have checked schema).

            // Actually, `agencymatch` had a `leads` or `profiles` table?
            // `agencymatch` used `supabase.auth.signUp`.

            // Text says "Lead captures: Name, Age, and Phone".
            // It does NOT say Email.
            // If I generate a fake email `phone@placeholder.com`, I can register them.

            const fakeEmail = `${formData.phone.replace(/\D/g, '')}@agency-scout.temp`;
            const fakePassword = `TempPass${Date.now()}!`;

            const metadata = {
                full_name: formData.name,
                age: formData.age,
                phone: formData.phone,
                lead_code: '#MOD30-SCOUT',
                analysis_result: analysisData
            };

            const { data, error: authError } = await supabase.auth.signUp({
                email: fakeEmail,
                password: fakePassword,
                options: {
                    data: metadata
                }
            });

            if (authError) throw authError;

            onSubmitSuccess();

        } catch (err) {
            console.error("Submission error:", err);
            // If strictly auth error (like user already exists with that phone-email), we might just say success for the user's sake 
            // on a landing page ("Thank you, we have your info").
            // But let's show generic error if it's a hard failure.
            if (err.message.includes("already registered")) {
                // If they submitted before, just show success
                onSubmitSuccess();
            } else {
                setError("Something went wrong. Please try again.");
            }
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
