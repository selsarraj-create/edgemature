import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { ArrowRight, Loader2, X } from 'lucide-react';

const LeadForm = ({ analysisData, imageBlob, onSubmitSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        age: '',
        gender: '',
        phone: '',
        email: '',
        postcode: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 0. Check for duplicate email or phone
            const { data: existingEmail } = await supabase
                .from('mature')
                .select('id')
                .eq('email', formData.email)
                .limit(1);

            if (existingEmail && existingEmail.length > 0) {
                setError('This email has already been used to apply.');
                setLoading(false);
                return;
            }

            const { data: existingPhone } = await supabase
                .from('mature')
                .select('id')
                .eq('phone', formData.phone)
                .limit(1);

            if (existingPhone && existingPhone.length > 0) {
                setError('This phone number has already been used to apply.');
                setLoading(false);
                return;
            }

            // 1. Upload photo to Supabase Storage
            let image_url = null;
            if (imageBlob) {
                const timestamp = Date.now();
                const cleanEmail = formData.email.replace('@', '-at-').replace(/\./g, '-');
                const ext = imageBlob.type === 'image/png' ? '.png' : '.jpeg';
                const filename = `${cleanEmail}_${timestamp}${ext}`;

                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('leads')
                    .upload(filename, imageBlob, {
                        contentType: imageBlob.type || 'image/jpeg',
                    });

                if (uploadError) {
                    console.warn("Image upload failed:", uploadError);
                    // Continue without image — non-blocking
                } else {
                    const { data: urlData } = supabase.storage
                        .from('leads')
                        .getPublicUrl(filename);
                    image_url = urlData?.publicUrl || null;
                }
            }

            // 2. Insert lead into 'mature' table
            const { data, error: insertError } = await supabase
                .from('mature')
                .insert([{
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    age: parseInt(formData.age),
                    gender: formData.gender,
                    phone: formData.phone,
                    email: formData.email,
                    postcode: formData.postcode,
                    lead_code: '#MOD30-SCOUT',
                    score: analysisData?.suitability_score || 0,
                    category: analysisData?.market_categorization?.primary || 'Unknown',
                    analysis_json: analysisData || {},
                    image_url: image_url,
                }]);

            if (insertError) throw insertError;
            setSuccess(true);
            setTimeout(() => {
                onSubmitSuccess();
            }, 2500);

        } catch (err) {
            console.error("Submission error:", err);
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-[#121212] border border-white/10 rounded-3xl shadow-2xl shadow-black/50 p-6">

                {/* SUCCESS STATE */}
                {success && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="mb-4 bg-green-500 text-white p-4 rounded-full shadow-lg shadow-green-500/30">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                        <h2 className="text-2xl font-black text-white mb-2">Application Submitted!</h2>
                        <p className="text-gray-400 text-sm">Thank you — we'll be in touch soon.</p>
                    </div>
                )}

                {/* FORM */}
                {!success && (
                    <>
                        {/* Close Button */}
                        {onCancel && (
                            <button
                                onClick={onCancel}
                                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        )}

                        <h2 className="text-2xl font-black mb-1 text-white">Apply Now</h2>
                        <p className="text-gray-400 mb-5 text-sm font-medium">
                            Enter your details to unlock your full report and get matched with agencies.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-3">
                            {/* First Name & Last Name - Side by Side */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">First Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                                        placeholder="Jane"
                                        value={formData.first_name}
                                        onChange={e => handleChange('first_name', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">Last Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                                        placeholder="Doe"
                                        value={formData.last_name}
                                        onChange={e => handleChange('last_name', e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Age & Gender - Side by Side */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">Age</label>
                                    <input
                                        type="number"
                                        required
                                        min="30"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                                        value={formData.age}
                                        onChange={e => handleChange('age', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">Gender</label>
                                    <select
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm appearance-none"
                                        value={formData.gender}
                                        onChange={e => handleChange('gender', e.target.value)}
                                    >
                                        <option value="" disabled className="bg-[#121212]">Select</option>
                                        <option value="Female" className="bg-[#121212]">Female</option>
                                        <option value="Male" className="bg-[#121212]">Male</option>
                                        <option value="Non-binary" className="bg-[#121212]">Non-binary</option>
                                    </select>
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                                    placeholder="jane@example.com"
                                    value={formData.email}
                                    onChange={e => handleChange('email', e.target.value)}
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">Phone Number</label>
                                <input
                                    type="tel"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                                    placeholder="+44 7700 000000"
                                    value={formData.phone}
                                    onChange={e => handleChange('phone', e.target.value)}
                                />
                            </div>

                            {/* Postcode */}
                            <div>
                                <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">Postcode</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                                    placeholder="SW1A 1AA"
                                    value={formData.postcode}
                                    onChange={e => handleChange('postcode', e.target.value)}
                                />
                            </div>

                            {error && <div className="text-red-400 text-sm font-medium">{error}</div>}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-blue-600 to-violet-600 text-white font-bold py-3 px-6 rounded-full text-base transition-transform hover:scale-[1.02] active:scale-95 shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2 mt-2"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : <>Submit Application <ArrowRight size={18} /></>}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default LeadForm;
