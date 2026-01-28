import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, Users, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import config from '../config';

export const RightBar = () => {
    const [analytics, setAnalytics] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await axios.get(`${config.apiUrl}/api/posts/analytics/trending`);
                setAnalytics(res.data);
            } catch (e) {
                console.error(e);
            }
        };
        fetchAnalytics();
        const interval = setInterval(fetchAnalytics, 30000); // Update every 30s
        return () => clearInterval(interval);
    }, []);

    if (!analytics) return null;

    return (
        <div className="sidebar-right" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingTop: '2rem' }}>

            {/* Trending Posts */}
            <div className="glass" style={{ borderRadius: 'var(--radius)', padding: '1.5rem' }}>
                <h3 className="mono glow-text" style={{ marginTop: 0, color: 'var(--accent)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={14} /> SIGNAL_PEAKS
                </h3>
                {analytics.topPosts.map(post => (
                    <div
                        key={post.id}
                        style={{ margin: '1.2rem 0', cursor: 'pointer' }}
                        onClick={() => navigate(`/profile/${post.username}`)}
                    >
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: '700' }}>@{post.username.toUpperCase()}</div>
                        <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', opacity: 0.8 }}>
                            {post.content}
                        </div>
                    </div>
                ))}
            </div>

            {/* Recommended Streamers */}
            <div className="glass" style={{ borderRadius: 'var(--radius)', padding: '1.5rem' }}>
                <h3 className="mono glow-text" style={{ marginTop: 0, color: 'var(--accent)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TrendingUp size={14} /> BANDWIDTH_LEADERS
                </h3>
                {analytics.activeUsers.map(u => (
                    <div
                        key={u.username}
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '1.2rem 0', cursor: 'pointer' }}
                        onClick={() => navigate(`/profile/${u.username}`)}
                    >
                        <div style={{ width: 36, height: 36, borderRadius: '8px', overflow: 'hidden', background: '#333', border: '1px solid var(--border)' }}>
                            <img src={u.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${u.username}`} width="100%" height="100%" style={{ objectFit: 'cover' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div className="mono" style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{u.username.toUpperCase()}</div>
                            <div className="mono" style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', opacity: 0.7 }}>{u.postCount} TX</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="glass" style={{ borderRadius: 'var(--radius)', padding: '1rem', textAlign: 'center' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                    EchoHub &copy; 2026
                </p>
            </div>
        </div>
    );
};
