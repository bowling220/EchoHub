import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Heart, MessageSquare, Share2, UserPlus, Zap, Activity, AlertTriangle, Trash2, X, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Notifications = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) fetchNotifications();
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const res = await axios.get(`http://localhost:3001/api/notifications?userId=${user.id}`);
            setNotifications(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.post('http://localhost:3001/api/notifications/mark-read', { userId: user.id });
            setNotifications(prev => prev.map(n => ({ ...n, isRead: 1 })));
        } catch (e) {
            console.error(e);
        }
    };

    const deleteNotification = async (notifId) => {
        try {
            await axios.delete(`http://localhost:3001/api/notifications/${notifId}?userId=${user.id}`);
            setNotifications(prev => prev.filter(n => n.id !== notifId));
        } catch (e) {
            console.error(e);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'LIKE': return <Heart size={18} style={{ color: '#ff4b91' }} fill="#ff4b91" />;
            case 'REPLY': return <MessageSquare size={18} style={{ color: 'var(--accent)' }} />;
            case 'BRANCH': return <Activity size={18} style={{ color: '#ff00ff' }} />;
            case 'REMIX': return <Share2 size={18} style={{ color: '#00ff9d' }} />;
            case 'FOLLOW': return <UserPlus size={18} style={{ color: '#a855f7' }} />;
            case 'SUSPENSION': return <AlertTriangle size={18} style={{ color: '#ff4d4d' }} />;
            case 'POST_DELETED': return <Trash2 size={18} style={{ color: '#ff4d4d' }} />;
            default: return <Zap size={18} />;
        }
    };

    const getMessage = (notif) => {
        switch (notif.type) {
            case 'LIKE': return `liked your post`;
            case 'REPLY': return `established a new link with your post`;
            case 'BRANCH': return `branched discussion under your point`;
            case 'REMIX': return `remixed your post`;
            case 'FOLLOW': return `started following you`;
            case 'SUSPENSION': return `suspended your account`;
            case 'POST_DELETED': return `removed your post`;
            default: return `interacted with you`;
        }
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Synchronizing data streams...</div>;

    return (
        <div className="feed-container">
            <div className="glass" style={{ borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: '2rem' }}>
                <div style={{
                    padding: '2rem',
                    borderBottom: '1px solid var(--border)',
                    background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.05), rgba(255, 0, 255, 0.05))'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2 style={{
                                margin: 0,
                                fontSize: '1.5rem',
                                color: 'var(--accent)',
                                fontWeight: '600',
                                letterSpacing: '1px'
                            }}>
                                Neural Transmissions
                            </h2>
                            <p style={{
                                margin: '0.5rem 0 0 0',
                                color: 'var(--text-secondary)',
                                fontSize: '0.85rem'
                            }}>
                                Incoming signals from the mesh
                            </p>
                        </div>
                        {notifications.length > 0 && notifications.some(n => n.isRead === 0) && (
                            <button
                                onClick={markAllAsRead}
                                className="btn"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '0.8rem',
                                    padding: '0.6rem 1rem',
                                    background: 'rgba(0, 240, 255, 0.1)',
                                    borderColor: 'var(--accent)',
                                    color: 'var(--accent)'
                                }}
                            >
                                <CheckCheck size={16} />
                                Mark All Read
                            </button>
                        )}
                    </div>
                </div>

                {notifications.length === 0 ? (
                    <div style={{
                        padding: '4rem',
                        textAlign: 'center',
                        color: 'var(--text-secondary)'
                    }}>
                        <Activity size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                        <div>Your frequency is clear. No new echoes.</div>
                    </div>
                ) : (
                    <div style={{ padding: '1rem' }}>
                        {notifications.map((notif, index) => (
                            <div
                                key={notif.id}
                                className="glass fade-in"
                                style={{
                                    padding: '1.5rem',
                                    marginBottom: index < notifications.length - 1 ? '1rem' : 0,
                                    borderRadius: '12px',
                                    border: `1px solid ${notif.type === 'SUSPENSION' || notif.type === 'POST_DELETED' ? '#ff4d4d' : 'var(--border)'}`,
                                    background: notif.type === 'SUSPENSION' || notif.type === 'POST_DELETED'
                                        ? 'rgba(255, 77, 77, 0.03)'
                                        : 'rgba(255, 255, 255, 0.02)',
                                    transition: 'all 0.3s ease',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                {/* Delete button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteNotification(notif.id);
                                    }}
                                    className="btn"
                                    style={{
                                        position: 'absolute',
                                        top: '1rem',
                                        right: '1rem',
                                        padding: '0.4rem',
                                        background: 'rgba(255, 77, 77, 0.1)',
                                        borderColor: '#ff4d4d',
                                        color: '#ff4d4d',
                                        minWidth: 'auto',
                                        opacity: 0.6,
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.opacity = '1';
                                        e.currentTarget.style.background = 'rgba(255, 77, 77, 0.2)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.opacity = '0.6';
                                        e.currentTarget.style.background = 'rgba(255, 77, 77, 0.1)';
                                    }}
                                >
                                    <X size={14} />
                                </button>

                                {/* Scanline effect for admin notifications */}
                                {(notif.type === 'SUSPENSION' || notif.type === 'POST_DELETED') && (
                                    <div className="scanline" style={{ opacity: 0.3 }} />
                                )}

                                <div
                                    style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', cursor: notif.postId ? 'pointer' : 'default' }}
                                    onClick={() => {
                                        if (notif.postId && notif.type !== 'POST_DELETED') {
                                            navigate(`/post/${notif.postId}`);
                                        }
                                    }}
                                    onMouseEnter={(e) => {
                                        if (notif.postId) {
                                            e.currentTarget.parentElement.style.borderColor = 'var(--accent)';
                                            e.currentTarget.parentElement.style.transform = 'translateX(4px)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.parentElement.style.borderColor = notif.type === 'SUSPENSION' || notif.type === 'POST_DELETED' ? '#ff4d4d' : 'var(--border)';
                                        e.currentTarget.parentElement.style.transform = 'translateX(0)';
                                    }}
                                >
                                    {/* Avatar */}
                                    <div style={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: '50%',
                                        overflow: 'hidden',
                                        background: 'rgba(0, 240, 255, 0.1)',
                                        flexShrink: 0,
                                        border: '2px solid var(--border)',
                                        position: 'relative'
                                    }}>
                                        <img
                                            src={notif.actorAvatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${notif.actorName || 'system'}`}
                                            width="100%"
                                            height="100%"
                                            style={{ objectFit: 'cover' }}
                                        />
                                        {/* Icon badge */}
                                        <div style={{
                                            position: 'absolute',
                                            bottom: -4,
                                            right: -4,
                                            background: '#000',
                                            borderRadius: '50%',
                                            padding: '4px',
                                            border: '2px solid var(--bg)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            {getIcon(notif.type)}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        {/* Header */}
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            marginBottom: '0.5rem',
                                            flexWrap: 'wrap'
                                        }}>
                                            <span style={{
                                                fontWeight: '600',
                                                color: notif.actorName === 'SYSTEM' ? '#ff4d4d' : 'var(--text-primary)',
                                                fontSize: '0.95rem'
                                            }}>
                                                {notif.actorName || 'SYSTEM'}
                                            </span>
                                            <span style={{
                                                color: 'var(--text-secondary)',
                                                fontSize: '0.9rem'
                                            }}>
                                                {getMessage(notif)}
                                            </span>
                                        </div>

                                        {/* Post snippet or context */}
                                        {(notif.postSnippet || notif.context) && (
                                            <div className="mono" style={{
                                                marginTop: '0.75rem',
                                                padding: '0.75rem',
                                                color: 'var(--text-secondary)',
                                                fontSize: '0.85rem',
                                                fontStyle: 'italic',
                                                background: 'rgba(0, 240, 255, 0.05)',
                                                borderLeft: '3px solid var(--accent)',
                                                borderRadius: '4px',
                                                lineHeight: '1.5'
                                            }}>
                                                "{(notif.postSnippet || notif.context).length > 80 ? (notif.postSnippet || notif.context).substring(0, 80) + '...' : (notif.postSnippet || notif.context)}"
                                            </div>
                                        )}

                                        {/* Reason (for admin actions) */}
                                        {notif.reason && (
                                            <div className="mono" style={{
                                                marginTop: '0.75rem',
                                                padding: '1rem',
                                                background: 'rgba(255, 77, 77, 0.1)',
                                                border: '1px solid #ff4d4d',
                                                borderRadius: '8px',
                                                fontSize: '0.8rem',
                                                letterSpacing: '0.5px',
                                                lineHeight: '1.6'
                                            }}>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    marginBottom: '0.5rem',
                                                    color: '#ff4d4d',
                                                    fontWeight: '600'
                                                }}>
                                                    <AlertTriangle size={14} />
                                                    MODERATION_REASON
                                                </div>
                                                <div style={{ color: '#ff9999' }}>
                                                    {notif.reason}
                                                </div>
                                            </div>
                                        )}

                                        {/* Timestamp */}
                                        <div className="mono" style={{
                                            fontSize: '0.7rem',
                                            color: 'var(--text-secondary)',
                                            marginTop: '0.75rem',
                                            opacity: 0.6,
                                            letterSpacing: '0.5px'
                                        }}>
                                            {new Date(notif.createdAt).toLocaleString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
