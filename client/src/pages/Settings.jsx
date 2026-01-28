import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { User, Image as ImageIcon, Palette, Save, CheckCircle } from 'lucide-react';

const Settings = () => {
    const { user, login } = useAuth(); // We'll use login to 'refresh' the user object in context
    const [bio, setBio] = useState(user?.bio || '');
    const [avatar, setAvatar] = useState(user?.avatar || '');
    const [coverImage, setCoverImage] = useState(user?.coverImage || '');
    const [themeColor, setThemeColor] = useState(user?.themeColor || '#00f0ff');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const presetColors = [
        '#00f0ff', // Cyber Cyan
        '#ff00ff', // Neon Pink
        '#a855f7', // Mystic Purple
        '#00ff9d', // Bio Green
        '#ffb800', // Warning Gold
        '#ff4d4d'  // Alert Red
    ];

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await axios.patch('http://localhost:3001/api/users/profile', {
                userId: user.id,
                bio,
                avatar: avatar.trim(),
                coverImage: coverImage.trim(),
                themeColor
            });

            // Update local storage and context
            const updatedUser = { ...user, ...res.data };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            // Trigger a re-render/update in AuthContext (hacky but effective for this setup)
            window.location.reload();

            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (e) {
            console.error(e);
            alert('Failed to save settings.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="feed-container">
            <div className="glass" style={{ padding: '2.5rem', borderRadius: 'var(--radius)' }}>
                <h2 style={{ marginTop: 0, color: 'var(--accent)', fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Palette size={28} /> Neural Settings
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>
                    Tune your digital frequency and identity parameters.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Identity Section */}
                    <section>
                        <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-secondary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <User size={18} /> Identity Tuning
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem' }}>Bio / Transmission Descriptor</label>
                                <textarea
                                    value={bio}
                                    onChange={e => setBio(e.target.value)}
                                    placeholder="Tell the hub who you are..."
                                    rows={3}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem' }}>Avatar Data Link (URL)</label>
                                    <input
                                        type="text"
                                        value={avatar}
                                        onChange={e => setAvatar(e.target.value)}
                                        placeholder="Image URL"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem' }}>Cover Image Link (URL)</label>
                                    <input
                                        type="text"
                                        value={coverImage}
                                        onChange={e => setCoverImage(e.target.value)}
                                        placeholder="Image URL"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    <div style={{ height: '1px', background: 'var(--border)' }} />

                    {/* Theme Section */}
                    <section>
                        <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-secondary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Palette size={18} /> Theme Frequency
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Select your personal synchronization color.</p>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            {presetColors.map(color => (
                                <div
                                    key={color}
                                    onClick={() => setThemeColor(color)}
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        background: color,
                                        cursor: 'pointer',
                                        border: themeColor === color ? '3px solid white' : '2px solid transparent',
                                        boxShadow: themeColor === color ? `0 0 15px ${color}` : 'none',
                                        transition: 'all 0.2s ease'
                                    }}
                                />
                            ))}
                            <input
                                type="color"
                                value={themeColor}
                                onChange={e => setThemeColor(e.target.value)}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    padding: 0,
                                    border: 'none',
                                    background: 'none',
                                    cursor: 'pointer'
                                }}
                            />
                        </div>
                    </section>

                    <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                            className="btn btn-primary"
                            style={{ padding: '1rem 2.5rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saved ? <><CheckCircle size={20} /> PARAMETERS SYNCED</> : <><Save size={20} /> {saving ? 'SYNCING...' : 'SAVE CONFIG'}</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
