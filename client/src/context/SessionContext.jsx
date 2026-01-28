import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const SessionContext = createContext();

export const useSession = () => useContext(SessionContext);

export const SessionProvider = ({ children }) => {
    const [stats, setStats] = useState({
        lineagesTraversed: new Set(),
        activeTransmissions: 0,
        contributions: 0,
        startTime: Date.now()
    });
    const [showSummary, setShowSummary] = useState(false);
    const idleTimeout = useRef(null);

    const trackLineage = (id) => {
        setStats(prev => ({
            ...prev,
            lineagesTraversed: new Set(prev.lineagesTraversed).add(id)
        }));
    };

    const trackContribution = () => {
        setStats(prev => ({ ...prev, contributions: prev.contributions + 1 }));
    };

    const trackActiveTransmission = () => {
        setStats(prev => ({ ...prev, activeTransmissions: prev.activeTransmissions + 1 }));
    };

    const resetIdle = () => {
        clearTimeout(idleTimeout.current);
        idleTimeout.current = setTimeout(() => {
            setShowSummary(true);
        }, 300000); // 5 minutes idle
    };

    useEffect(() => {
        const toggleResonance = () => setShowSummary(prev => !prev);

        window.addEventListener('mousemove', resetIdle);
        window.addEventListener('keydown', resetIdle);
        window.addEventListener('toggleResonance', toggleResonance);
        resetIdle();

        return () => {
            window.removeEventListener('mousemove', resetIdle);
            window.removeEventListener('keydown', resetIdle);
            window.removeEventListener('toggleResonance', toggleResonance);
            clearTimeout(idleTimeout.current);
        };
    }, []);

    return (
        <SessionContext.Provider value={{ stats, trackLineage, trackContribution, trackActiveTransmission, showSummary, setShowSummary }}>
            {children}
            {showSummary && (
                <div style={{
                    position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 5000,
                    width: '320px', background: 'rgba(5, 5, 8, 0.95)', border: '1px solid var(--accent)',
                    borderRadius: '16px', padding: '1.5rem', boxShadow: '0 0 30px rgba(0, 240, 255, 0.2)',
                    backdropFilter: 'blur(10px)'
                }} className="fade-in cyber-grid">
                    <div className="scanline" />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                        <h4 className="mono glow-text" style={{ margin: 0, color: 'var(--accent)', fontSize: '0.8rem', letterSpacing: '2px' }}>SESSION_RESONANCE</h4>
                        <button
                            onClick={() => setShowSummary(false)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                        >
                            <X size={14} />
                        </button>
                    </div>
                    <div className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                        &gt; UPLINK_DURATION: {Math.floor((Date.now() - stats.startTime) / 60000)}m <br />
                        &gt; LINEAGES_TRAVERSED: {stats.lineagesTraversed.size} <br />
                        &gt; ACTIVE_TRANSMISSIONS: {stats.activeTransmissions} <br />
                        &gt; NEURAL_CONTRIBUTIONS: {stats.contributions} <br />
                        <br />
                        <span style={{ color: 'var(--accent)' }}>// SESSION_REFLECTIVE_SYNC_COMPLETE</span>
                    </div>
                </div>
            )}
        </SessionContext.Provider>
    );
};
