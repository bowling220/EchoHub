import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { PostCard } from '../components/PostCard';
import { Users, UserPlus, UserCheck, Calendar, X, CheckCircle, MessageSquare, Settings as SettingsIcon, Save, Camera } from 'lucide-react';
import config from '../config';
import { LoginModal } from '../App';

const EditProfileModal = ({ user, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        bio: user.bio || '',
        avatar: user.avatar || '',
        coverImage: user.coverImage || '',
        themeColor: user.themeColor || '#00f0ff'
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.patch(`${config.apiUrl}/api/users/profile`, {
                userId: user.id,
                ...formData
            });
            onUpdate();
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(10px)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }} onClick={onClose}>
            <div
                className="glass cyber-grid"
                style={{
                    width: '100%', maxWidth: '500px', padding: '2.5rem',
                    borderRadius: '24px', position: 'relative',
                    border: '1px solid var(--accent)'
                }}
                onClick={e => e.stopPropagation()}
            >
                <div className="scanline" />
                <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <X size={24} />
                </button>

                <h2 className="mono glow-text" style={{ marginTop: 0, marginBottom: '2rem', letterSpacing: '4px' }}>RECONFIGURE_IDENTITY</h2>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label className="mono" style={{ display: 'block', marginBottom: '8px', fontSize: '0.7rem', color: 'var(--accent)' }}>BIOMETRIC_DATA (BIO)</label>
                        <textarea
                            className="glass mono"
                            value={formData.bio}
                            onChange={e => setFormData({ ...formData, bio: e.target.value })}
                            placeholder="Transmitting thoughts..."
                            rows={3}
                        />
                    </div>

                    <div>
                        <label className="mono" style={{ display: 'block', marginBottom: '8px', fontSize: '0.7rem', color: 'var(--accent)' }}>AVATAR_LINK</label>
                        <input
                            className="glass mono"
                            value={formData.avatar}
                            onChange={e => setFormData({ ...formData, avatar: e.target.value })}
                            placeholder="https://..."
                        />
                    </div>

                    <div>
                        <label className="mono" style={{ display: 'block', marginBottom: '8px', fontSize: '0.7rem', color: 'var(--accent)' }}>COVER_ARRAY_LINK</label>
                        <input
                            className="glass mono"
                            value={formData.coverImage}
                            onChange={e => setFormData({ ...formData, coverImage: e.target.value })}
                            placeholder="https://..."
                        />
                    </div>

                    <div>
                        <label className="mono" style={{ display: 'block', marginBottom: '8px', fontSize: '0.7rem', color: 'var(--accent)' }}>NEURAL_ACCENT_FREQUENCY</label>
                        <input
                            type="color"
                            value={formData.themeColor}
                            onChange={e => setFormData({ ...formData, themeColor: e.target.value })}
                            style={{ height: '50px', cursor: 'pointer', padding: '5px' }}
                        />
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '1rem', width: '100%' }}>
                        <Save size={18} /> {loading ? 'CALIBRATING...' : 'SAVE_TRANSMISSION'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const UserListModal = ({ title, userId, type, onClose }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axios.get(`${config.apiUrl}/api/users/${userId}/${type}`);
                setUsers(res.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [userId, type]);

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999,
            backdropFilter: 'blur(8px)'
        }}>
            <div className="glass" style={{ width: '400px', maxHeight: '70vh', overflowY: 'auto', padding: '2rem', borderRadius: 'var(--radius)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, color: 'var(--accent)' }}>{title}</h3>
                    <X size={20} style={{ cursor: 'pointer' }} onClick={onClose} />
                </div>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>Loading users...</div>
                ) : users.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No users found.</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {users.map(u => (
                            <div
                                key={u.id}
                                style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                                onClick={() => { navigate(`/profile/${u.username}`); onClose(); }}
                            >
                                <img src={u.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${u.username}`} width="32" height="32" style={{ borderRadius: '50%' }} alt="avatar" />
                                <span style={{ fontWeight: 'bold' }}>@{u.username}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const ProfileHeatMap = ({ posts }) => {
    // Generate activity by hour (24 hours)
    const hours = new Array(24).fill(0);
    posts.forEach(p => {
        const hour = new Date(p.createdAt).getHours();
        hours[hour]++;
    });
    const max = Math.max(...hours, 1);

    return (
        <div style={{ marginTop: '2.5rem' }}>
            <h4 className="mono" style={{ fontSize: '0.7rem', color: 'var(--accent)', marginBottom: '1rem', letterSpacing: '2px' }}>NEURAL_ACTIVITY_SCAN</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '8px' }}>
                {hours.map((count, i) => (
                    <div
                        key={i}
                        className="glass"
                        style={{
                            height: '30px',
                            background: `rgba(0, 240, 255, ${(count / max) * 0.8 + 0.05})`,
                            border: '1px solid rgba(0, 240, 255, 0.1)',
                            borderRadius: '4px',
                            boxShadow: count > 0 ? `0 0 10px rgba(0, 240, 255, ${(count / max) * 0.3})` : 'none',
                            position: 'relative'
                        }}
                        title={`${count} transmissions at ${i}:00`}
                    >
                        {count > max * 0.8 && <div className="scanline" style={{ borderRadius: '4px' }} />}
                    </div>
                ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.6rem', color: 'var(--text-secondary)' }} className="mono">
                <span>00:00</span>
                <span>12:00</span>
                <span>23:59</span>
            </div>
        </div>
    );
};

const Profile = ({ onViewTree }) => {
    const { username } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userList, setUserList] = useState(null); // { title: string, type: 'followers' | 'following' }
    const [isEditing, setIsEditing] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, [username]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const userRes = await axios.get(`${config.apiUrl}/api/users/${username}?currentUserId=${currentUser?.id}`);
            setProfile(userRes.data);
            const postsRes = await axios.get(`${config.apiUrl}/api/posts?authorId=${userRes.data.id}&currentUserId=${currentUser?.id}`);
            setPosts(postsRes.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleFollow = async () => {
        if (!currentUser) {
            setShowLoginModal(true);
            return;
        }

        try {
            const res = await axios.post(`${config.apiUrl}/api/users/${profile.id}/follow`, { currentUserId: currentUser.id });
            setProfile(prev => ({
                ...prev,
                isFollowing: res.data.following,
                followers: res.data.following ? prev.followers + 1 : prev.followers - 1
            }));
        } catch (e) {
            console.error(e);
        }
    };

    const handleDeleteSuccess = (postId) => {
        setPosts(prev => prev.filter(p => p.id !== postId));
    };

    if (loading) return (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--accent)' }}>
            ACCESSING DATA FRAGMENT...
        </div>
    );

    if (!profile) return (
        <div style={{ padding: '4rem', textAlign: 'center' }}>
            <h2 style={{ color: 'var(--accent)' }}>404: IDENTITY NOT FOUND</h2>
            <p style={{ color: 'var(--text-secondary)' }}>This digital signature does not exist in the EchoHub network.</p>
        </div>
    );

    return (
        <div className="feed-container" style={{ paddingTop: 0 }}>
            {userList && (
                <UserListModal
                    title={userList.title}
                    userId={profile.id}
                    type={userList.type}
                    onClose={() => setUserList(null)}
                />
            )}
            {isEditing && (
                <EditProfileModal
                    user={profile}
                    onClose={() => setIsEditing(false)}
                    onUpdate={fetchProfile}
                />
            )}
            {/* Profile Header */}
            <div style={{ position: 'relative', marginBottom: '2rem' }}>
                <div style={{
                    height: '240px',
                    background: `linear-gradient(to bottom, transparent, var(--bg-primary)), url("${profile.coverImage || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop'}") center/cover no-repeat`,
                    borderRadius: '0 0 var(--radius) var(--radius)',
                    border: '1px solid var(--border)',
                    borderTop: 'none',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {profile.isSuspended === 1 && (
                        <div style={{
                            position: 'absolute', inset: 0,
                            background: 'rgba(255, 77, 77, 0.2)',
                            backdropFilter: 'grayscale(1) blur(2px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            zIndex: 5
                        }}>
                            <div className="glass mono glow-text" style={{
                                padding: '1rem 2rem', border: '1px solid #ff4d4d',
                                color: '#ff4d4d', fontSize: '1.2rem', letterSpacing: '4px',
                                background: 'rgba(0,0,0,0.8)'
                            }}>
                                [ SIGNAL_SUSPENDED ]
                            </div>
                        </div>
                    )}
                </div>

                <div className="glass" style={{
                    position: 'relative',
                    marginTop: '-80px',
                    margin: '0 1.5rem',
                    padding: '2rem',
                    borderRadius: 'var(--radius)',
                    backdropFilter: 'blur(24px)',
                    background: 'rgba(10, 10, 15, 0.7)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{
                            width: 140, height: 140,
                            borderRadius: '50%',
                            background: '#111',
                            border: '6px solid var(--bg-primary)',
                            overflow: 'hidden',
                            marginTop: '-70px',
                            boxShadow: '0 10px 20px rgba(0,0,0,0.5)'
                        }}>
                            <img
                                src={profile.avatar && profile.avatar.trim() !== '' ? profile.avatar : `https://api.dicebear.com/7.x/identicon/svg?seed=${profile.username}`}
                                width="100%"
                                height="100%"
                                style={{ objectFit: 'cover' }}
                                alt="avatar"
                                referrerPolicy="no-referrer"
                            />
                        </div>

                        {currentUser && currentUser.username === profile.username && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="btn"
                            >
                                <SettingsIcon size={18} /> EDIT IDENTITY
                            </button>
                        )}

                        {currentUser && currentUser.username !== profile.username && (
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={() => {
                                        if (!currentUser) {
                                            setShowLoginModal(true);
                                            return;
                                        }
                                        navigate('/messages', { state: { recipient: profile } });
                                    }}
                                    className="btn"
                                >
                                    <MessageSquare size={18} /> MESSAGE
                                </button>
                                <button
                                    className="btn-primary"
                                    onClick={handleFollow}
                                >
                                    {profile.isFollowing ? <><UserCheck size={18} /> FOLLOWING</> : <><UserPlus size={18} /> FOLLOW</>}
                                </button>
                            </div>
                        )}
                    </div>

                    <div style={{ marginTop: '1.5rem' }}>
                        <h1 style={{ margin: 0, fontSize: '2.2rem', color: 'var(--text-primary)', fontWeight: '800', letterSpacing: '-1px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {profile.username}
                            {profile.isVerified === 1 && <CheckCircle size={24} fill="var(--accent)" stroke="#000" />}
                            {profile.isSuspended === 1 && (
                                <span className="mono" style={{
                                    fontSize: '0.7rem', color: '#ff4d4d', border: '1px solid #ff4d4d',
                                    padding: '2px 8px', borderRadius: '4px', letterSpacing: '1px',
                                    marginLeft: '10px'
                                }}>SUSPENDED</span>
                            )}
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', margin: '1rem 0', fontSize: '1.1rem', maxWidth: '600px', lineHeight: '1.6' }}>
                            {profile.username === 'EchoBot' ? (
                                <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>[ NEURAL BRIDGE CALIBRATING - AI INTERFACE COMING SOON ]</span>
                            ) : (
                                profile.bio || "Digital nomad exploring the EchoHub network. Transmitting thoughts into the void."
                            )}
                        </p>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '1.5rem' }}>
                            <span style={{ display: 'flex', gap: '6px', alignItems: 'center' }}><Calendar size={16} /> Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
                            <span
                                style={{ display: 'flex', gap: '6px', alignItems: 'center', cursor: 'pointer' }}
                                onClick={() => setUserList({ title: 'Followers', type: 'followers' })}
                            >
                                <Users size={16} /> <span className="mono" style={{ color: 'var(--accent)', fontWeight: 'bold' }}>NEURAL_SIGS</span>
                            </span>
                            <span
                                style={{ display: 'flex', gap: '6px', alignItems: 'center', cursor: 'pointer' }}
                                onClick={() => setUserList({ title: 'Following', type: 'following' })}
                            >
                                <Users size={16} /> <span className="mono" style={{ color: 'var(--accent)', fontWeight: 'bold' }}>UPLINKS</span>
                            </span>
                        </div>

                        <ProfileHeatMap posts={posts} />
                    </div>
                </div>
            </div>

            <div style={{ padding: '0 1.5rem' }}>
                <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem' }}>
                    <div style={{ padding: '1rem 0', borderBottom: '3px solid var(--accent)', color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '1rem' }}>TRANSMISSIONS</div>
                </div>

                {posts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius)' }}>
                        No active data streams detected from this user.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {posts.map(post => <PostCard key={post.id} post={post} onViewTree={onViewTree} onDeleteSuccess={handleDeleteSuccess} />)}
                    </div>
                )}
            </div>

            {showLoginModal && (
                <LoginModal
                    onClose={() => setShowLoginModal(false)}
                    message="Sign in to interact with users and build your network"
                />
            )}
        </div>
    );
};

export default Profile;
