import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { PostCard } from '../components/PostCard';
import { ArrowLeft, Loader } from 'lucide-react';

const PostDetail = () => {
    const { postId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPost();
    }, [postId]);

    const fetchPost = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`http://localhost:3001/api/posts/${postId}?currentUserId=${user?.id || 0}`);
            setPost(res.data);
        } catch (e) {
            console.error(e);
            setError('Post not found or has been deleted');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSuccess = () => {
        navigate('/');
    };

    if (loading) {
        return (
            <div className="feed-container" style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '50vh'
            }}>
                <Loader className="spin" size={32} color="var(--accent)" />
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="feed-container">
                <div className="glass" style={{
                    padding: '3rem',
                    textAlign: 'center',
                    borderRadius: 'var(--radius)'
                }}>
                    <div style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                        {error || 'Post not found'}
                    </div>
                    <button
                        onClick={() => navigate('/')}
                        className="btn btn-primary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                    >
                        <ArrowLeft size={18} />
                        Back to Feed
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="feed-container">
            {/* Back button */}
            <button
                onClick={() => navigate(-1)}
                className="btn"
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '1.5rem',
                    background: 'rgba(0, 240, 255, 0.1)',
                    borderColor: 'var(--accent)',
                    color: 'var(--accent)'
                }}
            >
                <ArrowLeft size={18} />
                Back
            </button>

            {/* Post detail */}
            <PostCard
                post={post}
                onDeleteSuccess={handleDeleteSuccess}
                depth={0}
            />
        </div>
    );
};

export default PostDetail;
