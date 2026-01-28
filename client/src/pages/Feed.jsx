import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { PostCard } from '../components/PostCard';
import config from '../config';

const Composer = ({ onPost }) => {
    const [content, setContent] = useState('');
    const { user } = useAuth();

    const handleSubmit = async () => {
        if (!content.trim()) return;
        try {
            await axios.post(`${config.apiUrl}/api/posts`, { content, userId: user.id });
            setContent('');
            if (onPost) onPost();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius)' }}>
            <textarea
                placeholder="Broadcast your thought..."
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{ resize: 'none', marginBottom: '1rem' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary" onClick={handleSubmit}>Broadcast</button>
            </div>
        </div>
    );
};

export const Feed = ({ socket, onViewTree, mode = 'explore' }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        if (user) fetchPosts();

        // For live updates: only add to feed if it matches user's view (for now we simplify: always show)
        socket.on('new_post', (post) => {
            // Only prepend if it's a top-level post (not a reply)
            if (!post.parentId) {
                setPosts(prev => [post, ...prev]);
            }
        });

        return () => socket.off('new_post');
    }, [user, mode]);


    const fetchPosts = async () => {
        setLoading(true);
        try {
            const isFollowing = mode === 'home';
            const res = await axios.get(`${config.apiUrl}/api/posts?currentUserId=${user.id}&following=${isFollowing}`);
            setPosts(res.data);

            // Check if user has any follows
            if (mode === 'home') {
                const followRes = await axios.get(`${config.apiUrl}/api/users/${user.username}?currentUserId=${user.id}`);
                setHasFollows(followRes.data.following > 0);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const [hasFollows, setHasFollows] = useState(true);

    return (
        <div className="feed-container">
            {mode === 'home' && <Composer onPost={fetchPosts} />}

            {mode === 'home' && !hasFollows && posts.length > 0 && (
                <div className="glass mono" style={{
                    padding: '1rem',
                    marginBottom: '1.5rem',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--accent)',
                    background: 'rgba(0, 240, 255, 0.05)',
                    fontSize: '0.75rem',
                    color: 'var(--accent)',
                    textAlign: 'center',
                    letterSpacing: '1px'
                }}>
                    🛰️ DISCOVERY_MODE: Showing popular transmissions. Follow users to personalize your feed.
                </div>
            )}

            {loading ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Retrieving localized echoes...
                </div>
            ) : posts.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    {mode === 'home' ? "Silence in your perimeter. Explore the hub to find data streams." : "No transmissions detected."}
                </div>
            ) : (
                posts.map((post) => (
                    <PostCard key={post.id} post={post} onViewTree={onViewTree} />
                ))
            )}

            {!loading && posts.length > 0 && (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    You're all caught up
                </div>
            )}
        </div>
    );
};
