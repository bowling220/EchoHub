import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSession } from '../context/SessionContext';
import { Heart, MessageSquare, Activity, MoreHorizontal, Trash2, Edit3, X, Check, CheckCircle, Target } from 'lucide-react';
import config from '../config';
import { LoginModal } from '../App';

const Composer = ({ onPost, parentId = null, onCancel, initialContent = '', isEditing = false, postId = null, contextBinding = null }) => {
    const { user, setShowLoginModal } = useAuth();
    const { trackContribution } = useSession();
    const draftKey = `draft_${user?.id}_${parentId || 'root'}_${postId || ''}`;

    const [content, setContent] = useState(() => {
        if (isEditing) return initialContent;
        if (!user) return '';
        return localStorage.getItem(draftKey) || initialContent;
    });
    const [sending, setSending] = useState(false);
    const [cooldown, setCooldown] = useState(false);

    useEffect(() => {
        if (!isEditing && content && user) {
            localStorage.setItem(draftKey, content);
        } else if (!content && user) {
            localStorage.removeItem(draftKey);
        }
    }, [content, draftKey, isEditing, user]);

    const handleSubmit = async () => {
        if (!user) {
            setShowLoginModal(true);
            return;
        }
        if (!content.trim() || sending || cooldown) return;

        setSending(true);
        try {
            if (isEditing) {
                await axios.patch(`${config.apiUrl}/api/posts/${postId}`, { content, userId: user.id });
            } else {
                await axios.post(`${config.apiUrl}/api/posts`, { content, userId: user.id, parentId, contextBinding });
                localStorage.removeItem(draftKey);
                trackContribution();
            }
            setContent('');
            if (onPost) onPost(isEditing ? content : null);

            // Soft Rate Limiting: Apply a "weight" delay
            setCooldown(true);
            setTimeout(() => setCooldown(false), 2000); // 2 second neural recalibration
        } catch (e) {
            console.error(e);
        } finally {
            setSending(false);
        }
    };

    return (
        <div
            className={parentId || isEditing ? "" : "glass"}
            style={{
                padding: (parentId || isEditing) ? '1rem 0' : '1.5rem',
                borderRadius: 'var(--radius)',
                opacity: sending ? 0.7 : 1,
                transition: 'opacity 0.3s ease',
                cursor: !user ? 'pointer' : 'default'
            }}
            onClick={!user ? () => setShowLoginModal(true) : undefined}
        >
            <textarea
                placeholder={isEditing ? "Editing..." : (parentId ? "Drafting response..." : "What's the frequency?")}
                rows={parentId || isEditing ? 2 : 3}
                value={content}
                disabled={sending || !user}
                onChange={(e) => setContent(e.target.value)}
                style={{
                    transition: 'all 0.3s ease',
                    filter: cooldown ? 'grayscale(0.5) blur(0.5px)' : 'none',
                    cursor: !user ? 'pointer' : 'text'
                }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '1rem' }}>
                {onCancel && <button className="btn" onClick={onCancel}>CANCEL</button>}
                <button
                    className="btn-primary"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleSubmit();
                    }}
                    disabled={sending || cooldown || (user && !content.trim())}
                    style={{
                        minWidth: '140px',
                        cursor: (sending || cooldown) ? 'wait' : 'pointer',
                        filter: (cooldown || (!user && false)) ? 'brightness(0.5)' : 'none',
                        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                >
                    {sending ? 'TRANSMITTING...' : (cooldown ? 'RECALIBRATING...' : (isEditing ? 'SAVE' : (parentId ? 'REPLY' : 'BROADCAST')))}
                </button>
            </div>
        </div>
    );
};

export const PostCard = ({ post, onViewTree, onDeleteSuccess, depth = 0 }) => {
    const { user, setShowLoginModal } = useAuth();
    const { trackLineage, trackActiveTransmission } = useSession();
    const navigate = useNavigate();
    const [liked, setLiked] = useState(post.userLiked);
    const [count, setCount] = useState(post.likeCount || 0);
    const [replying, setReplying] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState(post.content);
    const [showMenu, setShowMenu] = useState(false);
    const [replies, setReplies] = useState([]);
    const [isExpanded, setIsExpanded] = useState(depth < 2); // Auto-collapse deep threads
    const [boundText, setBoundText] = useState(null);
    const menuRef = useRef(null);

    // Heuristic: Signal increases with conversation depth and activity, noise with brevity
    const signalScore = Math.min(100, Math.max(0, (replies.length * 15) + (content.length / 2) + (depth * 10)));

    const isOwner = user && user.id === post.userId;
    const isAdmin = user && user.role === 'admin';

    const handleLike = async (e) => {
        e.stopPropagation();

        // Show login modal if not logged in
        if (!user) {
            setShowLoginModal(true);
            return;
        }

        try {
            setLiked(!liked);
            setCount(prev => liked ? prev - 1 : prev + 1);
            const res = await axios.post(`${config.apiUrl}/api/posts/${post.id}/like`, { userId: user.id });
            setCount(res.data.count);
            setLiked(res.data.liked);
        } catch (e) {
            console.error(e);
            setLiked(!liked);
        }
    };

    const handleDelete = async () => {
        const isAdmin = user?.role === 'admin';
        const isOwner = post.userId === user?.id;

        let reason = null;
        if (isAdmin && !isOwner) {
            reason = prompt('Enter reason for deletion (will be sent to user):');
            if (reason === null) return; // Cancelled
        } else {
            if (!window.confirm('Delete this post?')) return;
        }

        try {
            await axios.delete(`${config.apiUrl}/api/posts/${post.id}`, {
                params: { userId: user.id },
                data: { reason }
            });
            if (onDeleteSuccess) onDeleteSuccess(post.id);
        } catch (e) {
            console.error(e);
        }
    };

    const goToProfile = (e) => {
        e.stopPropagation();
        navigate(`/profile/${post.username}`);
    };

    const fetchReplies = async () => {
        try {
            const res = await axios.get(`${config.apiUrl}/api/posts?parentId=${post.id}&currentUserId=${user?.id}`);
            setReplies(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchReplies();
    }, [post.id]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        if (showMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMenu]);

    useEffect(() => {
        if (replies.length > 0) trackActiveTransmission();
    }, [replies]);

    const handleTextSelection = () => {
        if (!replying) return;
        const selection = window.getSelection().toString();
        if (selection && selection.length > 2) {
            setBoundText(selection);
        }
    };

    const renderContentWithBinding = (text, binding) => {
        if (!binding) return text;
        const parts = text.split(binding);
        if (parts.length < 2) return text;
        return (
            <>
                {parts[0]}
                <span className="bound-highlight">{binding}</span>
                {parts[1]}
            </>
        );
    };

    return (
        <div
            className={`post-card glass fade-in ${post.status ? `post-${post.status.toLowerCase()}` : ''} ${replies.length > 0 ? 'ambient-pulse' : ''}`}
            style={{ position: 'relative' }}
            onMouseUp={handleTextSelection}
        >
            {post.status && post.status !== 'LIVE' && (
                <div className="mono" style={{
                    position: 'absolute', top: '-10px', right: '20px',
                    fontSize: '0.6rem', background: 'var(--bg-primary)',
                    padding: '2px 8px', border: '1px solid var(--border)',
                    color: post.status === 'LOCKED' ? '#ff4d4d' : 'var(--text-secondary)'
                }}>
                    [ STATUS: {post.status} ]
                </div>
            )}
            <div className="post-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                        style={{
                            width: 38, height: 38, borderRadius: '50%', overflow: 'hidden',
                            background: '#222', cursor: 'pointer', border: '2px solid var(--border)',
                            transition: 'transform 0.2s'
                        }}
                        onClick={goToProfile}
                    >
                        <img
                            src={post.avatar && post.avatar.trim() !== '' ? post.avatar : `https://api.dicebear.com/7.x/identicon/svg?seed=${post.username}`}
                            alt="avatar"
                            width="100%"
                            height="100%"
                            style={{ objectFit: 'cover' }}
                            referrerPolicy="no-referrer"
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span
                            style={{ color: 'var(--text-primary)', fontWeight: '700', cursor: 'pointer', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                            onClick={goToProfile}
                        >
                            @{post.username}
                            {post.isVerified === 1 && <CheckCircle size={14} fill="#00f0ff" stroke="#000" />}
                            {post.isSuspended === 1 && (
                                <span className="mono" style={{ fontSize: '0.6rem', color: '#ff4d4d', border: '1px solid #ff4d4d', padding: '1px 5px', borderRadius: '3px', marginLeft: '4px' }}>SUSPENDED</span>
                            )}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                            {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {post.type === 'REMIX' && (
                        <span className="remix-badge">✨ {post.category}</span>
                    )}
                    {(isOwner || user?.role === 'admin') && (
                        <div style={{ position: 'relative' }} ref={menuRef}>
                            <MoreHorizontal
                                size={18}
                                style={{ cursor: 'pointer', color: 'var(--text-secondary)' }}
                                onClick={() => setShowMenu(!showMenu)}
                            />
                            {showMenu && (
                                <div className="glass" style={{
                                    position: 'absolute', right: 0, top: '24px', zIndex: 10,
                                    padding: '0.5rem', borderRadius: '8px', minWidth: '120px',
                                    boxShadow: '0 8px 16px rgba(0,0,0,0.4)', border: '1px solid var(--border)'
                                }}>
                                    {isOwner && (
                                        <div style={{
                                            display: 'flex', alignItems: 'center', gap: '10px', padding: '0.5rem',
                                            cursor: 'pointer', fontSize: '0.85rem'
                                        }} onClick={() => { setIsEditing(true); setShowMenu(false); }}>
                                            <Edit3 size={14} /> Edit
                                        </div>
                                    )}
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: '10px', padding: '0.5rem',
                                        cursor: 'pointer', fontSize: '0.85rem', color: '#ff4d4d'
                                    }} onClick={() => { handleDelete(); setShowMenu(false); }}>
                                        <Trash2 size={14} /> {isAdmin ? 'MODERATE' : 'Delete'}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Signal Meter */}
            {!isEditing && (
                <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ flex: 1, height: '2px', background: 'rgba(255,255,255,0.05)', borderRadius: '1px', overflow: 'hidden' }}>
                        <div style={{
                            width: `${signalScore}%`,
                            height: '100%',
                            background: signalScore > 70 ? 'var(--accent)' : (signalScore > 30 ? '#ff00ff' : '#ff4d4d'),
                            boxShadow: `0 0 10px ${signalScore > 70 ? 'var(--accent)' : (signalScore > 30 ? '#ff00ff' : '#ff4d4d')}`
                        }} />
                    </div>
                    <span className="mono" style={{ fontSize: '0.6rem', opacity: 0.6 }}>{signalScore > 70 ? 'HIGH_SIGNAL' : (signalScore > 30 ? 'MID_BAND' : 'NOISE_DETECTED')}</span>
                </div>
            )}

            <div className="post-content">
                {isEditing ? (
                    <Composer
                        isEditing={true}
                        initialContent={content}
                        postId={post.id}
                        onPost={(newContent) => { setContent(newContent); setIsEditing(false); }}
                        onCancel={() => setIsEditing(false)}
                    />
                ) : (
                    <div style={{ userSelect: post.status === 'LOCKED' ? 'none' : 'text' }}>
                        {post.contextBinding && (
                            <div className="mono" style={{ fontSize: '0.65rem', color: 'var(--accent)', opacity: 0.7, marginBottom: '0.8rem', borderLeft: '2px solid var(--accent)', paddingLeft: '10px' }}>
                                <Target size={12} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                                BOUND_CONTEXT: "{post.contextBinding}"
                            </div>
                        )}
                        {/* If any reply binds to this content, highlight it */}
                        {replies.some(r => r.contextBinding)
                            ? renderContentWithBinding(content, replies.find(r => r.contextBinding).contextBinding)
                            : content
                        }
                    </div>
                )}
            </div>

            {!isEditing && (
                <div style={{
                    display: 'flex', gap: '2rem',
                    color: 'var(--text-secondary)', padding: '0.5rem 0 0',
                    borderTop: '1px solid rgba(255,255,255,0.03)'
                }}>
                    <div
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: liked ? 'var(--accent)' : 'inherit', transition: 'all 0.2s' }}
                        onClick={handleLike}
                    >
                        <Heart size={18} fill={liked ? "var(--accent)" : "none"} strokeWidth={liked ? 0 : 2} />
                        <span style={{ fontSize: '0.85rem', fontWeight: liked ? 'bold' : 'normal' }}>{count || ''}</span>
                    </div>

                    <div
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}
                        onClick={() => {
                            if (!user) {
                                setShowLoginModal(true);
                                return;
                            }
                            setReplying(!replying);
                        }}
                    >
                        <MessageSquare size={18} />
                        <span style={{ fontSize: '0.85rem' }}>Reply</span>
                    </div>

                    <div
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}
                        onClick={() => {
                            if (!user) {
                                setShowLoginModal(true);
                                return;
                            }
                            onViewTree(post.originId || post.id);
                            trackLineage(post.id);
                        }}
                    >
                        <Activity size={18} />
                        <span style={{ fontSize: '0.85rem' }}>Lineage</span>
                    </div>
                </div>
            )}

            {replying && (
                <div style={{ marginTop: '1.2rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                    {boundText && (
                        <div className="mono" style={{ fontSize: '0.6rem', color: 'var(--accent)', marginBottom: '0.5rem' }}>
                            ANCHORED_TO: "{boundText}" <span style={{ cursor: 'pointer', color: '#ff4d4d' }} onClick={() => setBoundText(null)}>[X]</span>
                        </div>
                    )}
                    <Composer
                        parentId={post.id}
                        contextBinding={boundText}
                        onPost={() => {
                            setReplying(false);
                            setBoundText(null);
                            fetchReplies();
                        }}
                        onCancel={() => {
                            setReplying(false);
                            setBoundText(null);
                        }}
                    />
                </div>
            )}

            {/* Nested Replies with Compression */}
            {replies.length > 0 && (
                <div style={{
                    marginTop: '1.5rem',
                    paddingLeft: '1.5rem',
                    borderLeft: '2px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                }}>
                    {!isExpanded ? (
                        <div
                            className="glass mono"
                            style={{
                                padding: '0.6rem 1rem', cursor: 'pointer', fontSize: '0.7rem',
                                color: 'var(--accent)', border: '1px solid var(--accent)',
                                textAlign: 'center', letterSpacing: '2px'
                            }}
                            onClick={() => setIsExpanded(true)}
                        >
                            [ + {replies.length} TRANSMISSION_NODES_COMPRESSED - CLICK_TO_EXPAND ]
                        </div>
                    ) : (
                        replies.map(reply => (
                            <PostCard
                                key={reply.id}
                                post={reply}
                                onViewTree={onViewTree}
                                depth={depth + 1}
                                onDeleteSuccess={(deletedId) => setReplies(prev => prev.filter(r => r.id !== deletedId))}
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    );
};
