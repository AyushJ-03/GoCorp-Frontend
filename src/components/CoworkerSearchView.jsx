import React, { useState, useEffect } from 'react';
import api from '../services/api';

/**
 * CoworkerSearchView - A compact, high-performance search view to find and invite colleagues.
 * Designed to be nested within an ActionModal.
 */
const CoworkerSearchView = ({ onSelect, onCancel, currentInvites = [] }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchResults = async () => {
            if (!query || query.length < 2) {
                setResults([]);
                return;
            }
            setLoading(true);
            try {
                const res = await api.get(`/user/search?query=${query}`);
                setResults(res.data?.data || []);
            } catch (err) {
                console.error("User search error", err);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchResults, 300);
        return () => clearTimeout(timeoutId);
    }, [query]);

    return (
        <div className='flex flex-col gap-4 animate-in fade-in duration-300'>
            {/* Search Input */}
            <div className='relative'>
                <div className='absolute left-4 top-1/2 -translate-y-1/2'>
                    <svg className='w-4 h-4 text-slate-700' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} /></svg>
                </div>
                <input 
                    autoFocus
                    type="text" 
                    placeholder="Search by name or email..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className='w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400/30 transition-all'
                />
            </div>

            {/* Results List */}
            <div className='max-h-60 overflow-y-auto space-y-2 pr-1'>
                {loading && (
                    <div className='py-8 flex flex-col items-center justify-center opacity-50'>
                        <div className='w-6 h-6 border-2 border-slate-200 border-t-orange-500 rounded-full animate-spin'></div>
                    </div>
                )}

                {!loading && query.length >= 2 && results.length === 0 && (
                    <div className='py-8 text-center'>
                        <p className='text-xs font-black text-slate-700 uppercase tracking-widest'>No colleagues found</p>
                    </div>
                )}

                {!loading && results.map(user => {
                    const isAlreadyInvited = currentInvites.some(i => i._id === user._id);
                    return (
                        <div 
                            key={user._id}
                            onClick={() => !isAlreadyInvited && onSelect(user)}
                            className={`p-3 rounded-2xl flex items-center gap-3 transition-all ${isAlreadyInvited ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:bg-slate-50 cursor-pointer active:scale-95'}`}
                        >
                            <div className='w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center text-xs font-black shrink-0'>
                                {user.name.first_name[0]}{user.name.last_name[0]}
                            </div>
                            <div className='flex-1 min-w-0'>
                                <p className='text-sm font-bold text-slate-800 truncate'>{user.name.first_name} {user.name.last_name}</p>
                                <p className='text-[10px] font-black text-slate-700 uppercase tracking-widest truncate'>{user.email}</p>
                            </div>
                            {isAlreadyInvited ? (
                                <span className='text-[8px] font-black py-1 px-2 bg-emerald-50 text-emerald-600 rounded-lg uppercase tracking-widest'>Added</span>
                            ) : (
                                <div className='w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-600'>
                                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path d='M12 4v16m8-8H4' strokeWidth={3} /></svg>
                                </div>
                            )}
                        </div>
                    );
                })}

                {query.length < 2 && !loading && (
                    <div className='py-8 text-center'>
                        <div className='w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3'>
                            <svg className='w-6 h-6 text-slate-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} /></svg>
                        </div>
                        <p className='text-xs font-black text-slate-700 uppercase tracking-widest'>Search for specific colleagues</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CoworkerSearchView;
