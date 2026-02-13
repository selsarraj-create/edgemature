import React from 'react';
import { Star } from 'lucide-react';

const testimonials = [
    {
        name: "Sarah",
        age: 36,
        text: "I always thought I was 'too old' to start modeling. The analysis gave me the confidence to apply, and I booked my first commercial campaign three weeks later.",
        role: "Commercial Model",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200"
    },
    {
        name: "Marcus",
        age: 42,
        text: "The feedback on my jawline and structure was spot on. I used the results to tailor my portfolio, and agencies actually started responding.",
        role: "Editorial Model",
        image: "https://images.unsplash.com/photo-1560250097-9b93dbddb426?auto=format&fit=crop&q=80&w=200&h=200"
    },
    {
        name: "Elena",
        age: 31,
        text: "Honest, data-driven, and fast. It confirmed my potential in the lifestyle market. Highly recommend for anyone unsure about their prospects.",
        role: "Lifestyle Model",
        image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200"
    }
];

const Testimonials = () => {
    return (
        <section className="relative z-10 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-black text-white mb-4">Success Stories</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Join hundreds of mature models who discovered their potential through our AI analysis.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {testimonials.map((t, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm hover:bg-white/10 transition-colors duration-300 flex flex-col">
                            <div className="flex items-center gap-1 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={16} className="fill-yellow-500 text-yellow-500" />
                                ))}
                            </div>
                            <p className="text-gray-300 mb-6 flex-grow leading-relaxed">"{t.text}"</p>
                            <div className="flex items-center gap-4 mt-auto">
                                <img
                                    src={t.image}
                                    alt={t.name}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-white/10"
                                />
                                <div>
                                    <h4 className="font-bold text-white text-sm">{t.name}, {t.age}</h4>
                                    <p className="text-xs text-brand-start uppercase tracking-wider font-bold">{t.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
