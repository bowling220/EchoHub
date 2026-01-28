import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Shield, Users, MessageSquare, Database, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/');
            return;
        }

        const fetchAdminData = async () => {
            try {
                const usersRes = await axios.get('http://localhost:3001/api/users/system/active');
                setAllUsers(usersRes.data);

                const statsRes = await axios.get('http://localhost:3001/api/users/system/stats');
                setStats(statsRes.data);

                setLoading(false);
            } catch (e) {
                console.error(e);
                setLoading(false);
            }
        };

        fetchAdminData();
    }, [user, navigate]);

    const handleSuspend = async (userId, currentlySuspended) => {
        let reason = null;
        if (!currentlySuspended) {
            reason = prompt('Enter reason for suspension (will be sent to user):');
            if (!reason) return; // Cancelled
        }

        try {
            await axios.post(`http://localhost:3001/api/users/system/suspend/${userId}`, {
                adminId: user.id,
                reason
            });
            // Refresh local state
            setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, isSuspended: !u.isSuspended } : u));
        } catch (e) {
            console.error(e);
        }
    };

    if (loading || !stats) return <div style={{ padding: '4rem', color: 'var(--accent)' }}>ACCESSING SECURE DATA...</div>;

    return (
        <div className="feed-container">
            <div className="glass" style={{ padding: '2.5rem', borderRadius: 'var(--radius)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '1rem' }}>
                    <Shield size={32} color="var(--accent)" />
                    <h1 style={{ margin: 0, fontSize: '2rem', color: 'var(--text-primary)' }}>Terminal Console</h1>
                </div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem' }}>
                    Root access granted. Authenticated as <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>ADMIN_ROOT</span>.
                </p>

                {/* Grid Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                    <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(0, 240, 255, 0.1)' }}>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Users On Grid</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent)' }}>{stats.totalUsers}</div>
                    </div>
                    <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(0, 240, 255, 0.1)' }}>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Transmissions</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent)' }}>{stats.totalPosts}</div>
                    </div>
                    <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(0, 240, 255, 0.1)' }}>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>System Sync</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#00ff9d' }}>{stats.systemHealth}</div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <section>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Users size={20} color="var(--accent)" /> Digital Identities
                        </h3>
                        <div className="glass" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead style={{ background: 'rgba(255,255,255,0.03)', fontSize: '0.85rem' }}>
                                    <tr>
                                        <th style={{ padding: '1rem' }}>User</th>
                                        <th style={{ padding: '1rem' }}>Status</th>
                                        <th style={{ padding: '1rem' }}>ID</th>
                                        <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allUsers.map(u => (
                                        <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <img src={u.avatar} width="30" height="30" style={{ borderRadius: '50%' }} alt="u" />
                                                <span style={{ fontWeight: '500' }}>{u.username}</span>
                                                {u.isVerified === 1 && <CheckCircle size={14} color="var(--accent)" />}
                                            </td>
                                            <td style={{ padding: '1rem', fontSize: '0.9rem' }}>
                                                {u.isSuspended ? (
                                                    <div style={{ color: '#ff4d4d', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff4d4d' }} />
                                                        SUSPENDED
                                                    </div>
                                                ) : (
                                                    <div style={{ color: '#00ff9d', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00ff9d' }} />
                                                        ACTIVE
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{u.id}</td>
                                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                <button
                                                    onClick={() => handleSuspend(u.id, u.isSuspended)}
                                                    className="btn"
                                                    style={{
                                                        fontSize: '0.7rem',
                                                        padding: '0.4rem 0.8rem',
                                                        color: u.isSuspended ? 'var(--accent)' : '#ff4d4d',
                                                        borderColor: u.isSuspended ? 'var(--accent)' : '#ff4d4d'
                                                    }}
                                                >
                                                    {u.isSuspended ? 'REINSTATE' : 'SUSPEND'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Admin;
