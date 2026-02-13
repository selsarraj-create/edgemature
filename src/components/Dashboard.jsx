import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Download, Loader2, ArrowLeft, Calendar, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [sortField, setSortField] = useState('created_at');
    const [sortDir, setSortDir] = useState('desc');

    // Fetch leads
    useEffect(() => {
        fetchLeads();
    }, [dateFrom, dateTo, sortField, sortDir]);

    const fetchLeads = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('mature')
                .select('*')
                .order(sortField, { ascending: sortDir === 'asc' });

            if (dateFrom) {
                query = query.gte('created_at', new Date(dateFrom).toISOString());
            }
            if (dateTo) {
                // Add 1 day to include the end date fully
                const endDate = new Date(dateTo);
                endDate.setDate(endDate.getDate() + 1);
                query = query.lt('created_at', endDate.toISOString());
            }

            const { data, error } = await query;
            if (error) throw error;
            setLeads(data || []);
        } catch (err) {
            console.error('Failed to fetch leads:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleSort = (field) => {
        if (sortField === field) {
            setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDir('desc');
        }
    };

    const SortIcon = ({ field }) => {
        if (sortField !== field) return null;
        return sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
    };

    // CSV Export
    const exportCSV = () => {
        if (leads.length === 0) return;

        const headers = ['First Name', 'Last Name', 'Age', 'Gender', 'Email', 'Phone', 'Postcode', 'Score', 'Category', 'Image URL', 'Date'];
        const rows = leads.map(lead => [
            lead.first_name || lead.name || '',
            lead.last_name || '',
            lead.age || '',
            lead.gender || '',
            lead.email || '',
            lead.phone || '',
            lead.postcode || '',
            lead.score || '',
            lead.category || '',
            lead.image_url || '',
            lead.created_at ? new Date(lead.created_at).toLocaleDateString() : '',
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `mature-leads-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                    <div>
                        <Link to="/" className="text-gray-400 hover:text-white text-sm flex items-center gap-1 mb-2 transition-colors">
                            <ArrowLeft size={14} /> Back to Scanner
                        </Link>
                        <h1 className="text-3xl font-black tracking-tight">Lead Dashboard</h1>
                        <p className="text-gray-400 text-sm mt-1">{leads.length} total leads</p>
                    </div>

                    <button
                        onClick={exportCSV}
                        disabled={leads.length === 0}
                        className="bg-gradient-to-r from-blue-600 to-violet-600 text-white font-bold rounded-full px-6 py-2.5 shadow-lg shadow-blue-500/20 hover:scale-105 transition-transform flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download size={16} /> Export CSV
                    </button>
                </div>

                {/* Date Filters */}
                <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-white/5 rounded-2xl border border-white/10">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Filter by date:</span>
                    <div className="flex items-center gap-2">
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={e => setDateFrom(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                        />
                        <span className="text-gray-500 text-sm">to</span>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={e => setDateTo(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>
                    {(dateFrom || dateTo) && (
                        <button
                            onClick={() => { setDateFrom(''); setDateTo(''); }}
                            className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
                        >
                            Clear
                        </button>
                    )}
                </div>

                {/* Table */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="animate-spin text-blue-500" size={32} />
                    </div>
                ) : leads.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        <p className="text-lg font-medium">No leads found</p>
                        <p className="text-sm mt-1">Adjust your date filters or wait for new submissions.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-2xl border border-white/10">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/10">
                                    <th className="text-left px-4 py-3 font-bold text-[10px] uppercase tracking-wider text-gray-400">Photo</th>
                                    <th className="text-left px-4 py-3 font-bold text-[10px] uppercase tracking-wider text-gray-400 cursor-pointer select-none" onClick={() => toggleSort('first_name')}>
                                        <span className="flex items-center gap-1">Name <SortIcon field="first_name" /></span>
                                    </th>
                                    <th className="text-left px-4 py-3 font-bold text-[10px] uppercase tracking-wider text-gray-400 cursor-pointer select-none" onClick={() => toggleSort('age')}>
                                        <span className="flex items-center gap-1">Age <SortIcon field="age" /></span>
                                    </th>
                                    <th className="text-left px-4 py-3 font-bold text-[10px] uppercase tracking-wider text-gray-400">Gender</th>
                                    <th className="text-left px-4 py-3 font-bold text-[10px] uppercase tracking-wider text-gray-400">Email</th>
                                    <th className="text-left px-4 py-3 font-bold text-[10px] uppercase tracking-wider text-gray-400">Phone</th>
                                    <th className="text-left px-4 py-3 font-bold text-[10px] uppercase tracking-wider text-gray-400">Postcode</th>
                                    <th className="text-left px-4 py-3 font-bold text-[10px] uppercase tracking-wider text-gray-400 cursor-pointer select-none" onClick={() => toggleSort('score')}>
                                        <span className="flex items-center gap-1">Score <SortIcon field="score" /></span>
                                    </th>
                                    <th className="text-left px-4 py-3 font-bold text-[10px] uppercase tracking-wider text-gray-400">Category</th>
                                    <th className="text-left px-4 py-3 font-bold text-[10px] uppercase tracking-wider text-gray-400 cursor-pointer select-none" onClick={() => toggleSort('created_at')}>
                                        <span className="flex items-center gap-1">Date <SortIcon field="created_at" /></span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {leads.map((lead, i) => (
                                    <tr key={lead.id || i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="px-4 py-3">
                                            {lead.image_url ? (
                                                <a href={lead.image_url} target="_blank" rel="noopener noreferrer">
                                                    <img src={lead.image_url} alt="" className="w-10 h-10 rounded-lg object-cover border border-white/10" />
                                                </a>
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10" />
                                            )}
                                        </td>
                                        <td className="px-4 py-3 font-medium">
                                            {lead.first_name || lead.name || ''} {lead.last_name || ''}
                                        </td>
                                        <td className="px-4 py-3 text-gray-300">{lead.age || '—'}</td>
                                        <td className="px-4 py-3 text-gray-300">{lead.gender || '—'}</td>
                                        <td className="px-4 py-3 text-gray-300">{lead.email || '—'}</td>
                                        <td className="px-4 py-3 text-gray-300">{lead.phone || '—'}</td>
                                        <td className="px-4 py-3 text-gray-300">{lead.postcode || '—'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${(lead.score || 0) >= 80 ? 'bg-green-500/20 text-green-400' :
                                                    (lead.score || 0) >= 70 ? 'bg-blue-500/20 text-blue-400' :
                                                        'bg-gray-500/20 text-gray-400'
                                                }`}>
                                                {lead.score || 0}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-300">{lead.category || '—'}</td>
                                        <td className="px-4 py-3 text-gray-400 text-xs">
                                            {lead.created_at ? new Date(lead.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
