import { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, Link, NavLink } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import { useAuth } from './context/AuthContext';
import { Loader, MessageSquare, Heart, Share2, Activity, Plus, Home, Compass, Bell, User, LogOut, Settings as SettingsIcon, Search, Command, Terminal, Zap, Shield } from 'lucide-react';
import { Feed } from './pages/Feed';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Admin from './pages/Admin';
import Messages from './pages/Messages';
import PostDetail from './pages/PostDetail';
import { RightBar } from './components/RightBar';
import config from './config';

const socket = io(config.socketUrl);

// --- Layout Components ---

const Logo = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '10px' }}>
    <circle cx="50" cy="50" r="45" stroke="var(--accent)" strokeWidth="5" fill="none" />
    <path d="M30 50 Q50 20 70 50 T110 50" stroke="var(--text-primary)" strokeWidth="5" strokeLinecap="round" opacity="0.6" />
    <path d="M20 60 Q50 30 80 60" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round">
      <animate attributeName="stroke-dasharray" from="0 200" to="200 0" dur="3s" repeatCount="indefinite" />
    </path>
    <circle cx="50" cy="50" r="10" fill="var(--accent)">
      <animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite" />
    </circle>
  </svg>
);

const Sidebar = ({ login, register }) => {
  const { user, logout, presence } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const presenceColors = {
    'Active': '#00f0ff',
    'Focused': '#ff00ff',
    'Listening': '#00ff9d'
  };

  useEffect(() => {
    if (!user) return;

    const fetchUnreadCount = async () => {
      try {
        const res = await axios.get(`${config.apiUrl}/api/notifications/unread-count?userId=${user.id}`);
        setUnreadCount(res.data.count);
      } catch (e) {
        console.error(e);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [user]);

  const navStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '0.8rem 1rem',
    borderRadius: '12px',
    color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
    background: isActive ? 'rgba(0, 240, 255, 0.1)' : 'transparent',
    textDecoration: 'none',
    fontWeight: isActive ? '600' : '400',
    marginBottom: '0.5rem',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    border: '1px solid',
    borderColor: isActive ? 'var(--accent)' : 'transparent',
    borderOpacity: 0.2
  });

  return (
    <div className="sidebar" style={{
      display: 'flex',
      flexDirection: 'column',
      paddingTop: '2rem',
      paddingBottom: '2rem'
    }}>
      <div style={{ fontSize: '1.6rem', marginBottom: '3rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', fontWeight: '800', letterSpacing: '-1px' }}>
        <Logo size={42} /> EchoHub
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <NavLink to="/" style={navStyle}><Home size={22} /> Home</NavLink>
        <NavLink to="/explore" style={navStyle}><Compass size={22} /> Explore</NavLink>
        <NavLink to="/notifications" style={(props) => ({ ...navStyle(props), position: 'relative' })}>
          <Bell size={22} />
          Transmissions
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '0.5rem',
              right: '0.5rem',
              background: '#ff4d4d',
              color: '#fff',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.7rem',
              fontWeight: '700',
              animation: 'pulse 2s infinite'
            }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </NavLink>
        <NavLink to="/messages" style={navStyle}><MessageSquare size={22} /> Neural Bridge</NavLink>
        <NavLink to={`/profile/${user?.username}`} style={navStyle}><User size={22} /> Identity</NavLink>
        <NavLink to="/settings" style={navStyle}><SettingsIcon size={22} /> Settings</NavLink>
        {user?.role === 'admin' && (
          <NavLink to="/admin" style={navStyle}><Activity size={22} /> Admin Panel</NavLink>
        )}
      </nav>

      <div className="sidebar-footer" style={{ marginTop: 'auto' }}>
        {user ? (
          <div
            className="glass"
            style={{
              padding: '1rem',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              border: '1px solid rgba(255,255,255,0.05)',
              background: 'rgba(255,255,255,0.02)',
              transition: 'all 0.3s ease',
              boxShadow: `0 0 10px ${presenceColors[presence]}33`
            }}
          >
            <img
              src={user?.avatar && user.avatar.trim() !== '' ? user.avatar : `https://api.dicebear.com/7.x/identicon/svg?seed=${user?.username}`}
              width="42"
              height="42"
              style={{
                borderRadius: '50%',
                border: `2px solid ${presenceColors[presence]}`,
                objectFit: 'cover',
                padding: '2px',
                transition: 'border 0.5s ease'
              }}
              alt="me"
              referrerPolicy="no-referrer"
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 'bold', fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.username}</div>
              <div style={{ fontSize: '0.65rem', color: presenceColors[presence], display: 'flex', alignItems: 'center', gap: '4px', letterSpacing: '1px', fontWeight: 'bold' }} className="mono">
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: presenceColors[presence],
                  boxShadow: `0 0 8px ${presenceColors[presence]}`,
                  animation: 'pulse 2s infinite'
                }} />
                {presence.toUpperCase()}
              </div>
            </div>
            <button
              onClick={logout}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '5px',
                borderRadius: '8px'
              }}
              title="Disconnect"
              onMouseEnter={e => e.currentTarget.style.color = '#ff4d4d'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <div className="glass" style={{
            padding: '1.5rem',
            borderRadius: '16px',
            border: '1px solid var(--accent)',
            background: 'rgba(0, 240, 255, 0.05)',
            textAlign: 'center'
          }}>
            <div className="mono" style={{
              fontSize: '0.75rem',
              color: 'var(--accent)',
              marginBottom: '1rem',
              letterSpacing: '2px'
            }}>
              🔒 LOGIN REQUIRED
            </div>
            <p style={{
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              marginBottom: '1rem',
              lineHeight: '1.5'
            }}>
              Sign in to post, like, follow, and access all features
            </p>
            <AuthScreen login={login} register={register} inline={true} />
          </div>
        )}
      </div>
    </div>
  );
};

// --- Command Palette ---
const CommandPalette = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (query.length < 1) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await axios.get(`${config.apiUrl}/api/users/system/search?q=${query}`);
        setResults(res.data);
      } catch (err) { console.error(err); }
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  const handleCommand = (cmd) => {
    switch (cmd) {
      case 'HOME': navigate('/'); break;
      case 'EXPLORE': navigate('/explore'); break;
      case 'PROFILE': navigate(`/profile/${user.username}`); break;
      case 'ADMIN': navigate('/admin'); break;
      case 'STRESS': window.dispatchEvent(new CustomEvent('toggleStress')); break;
      case 'RESONANCE': window.dispatchEvent(new CustomEvent('toggleResonance')); break;
      case 'DISCONNECT': logout(); break;
    }
    onClose();
  };
  node
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', paddingTop: '15vh',
      backdropFilter: 'blur(10px)', zIndex: 2000
    }} onClick={onClose}>
      <div className="glass cyber-grid" style={{
        width: '600px', height: 'fit-content', padding: '1.5rem',
        border: '1px solid var(--accent)', borderRadius: '16px',
        position: 'relative'
      }} onClick={e => e.stopPropagation()}>
        <div className="scanline" />
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
          <Terminal size={20} color="var(--accent)" />
          <input
            autoFocus
            placeholder="EXECUTE_COMMAND or SEARCH_IDENTITY..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ background: 'transparent', border: 'none', padding: 0, fontSize: '1.1rem', caretColor: 'var(--accent)', color: 'white', width: '100%', outline: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {results.map(u => (
            <div
              key={u.id} className="cmd-item"
              onClick={() => { navigate(`/profile/${u.username}`); onClose(); }}
            >
              <img src={u.avatar} width="24" height="24" style={{ borderRadius: '50%' }} />
              <span>JUMP_TO_IDENTITY: @{u.username}</span>
            </div>
          ))}

          <div className="cmd-item" onClick={() => handleCommand('HOME')}><Home size={16} /> NAVIGATE_HOME</div>
          <div className="cmd-item" onClick={() => handleCommand('EXPLORE')}><Compass size={16} /> NAVIGATE_EXPLORE</div>
          <div className="cmd-item" onClick={() => handleCommand('PROFILE')}><User size={16} /> NAVIGATE_IDENTITY</div>
          {user?.role === 'admin' && <div className="cmd-item" onClick={() => handleCommand('ADMIN')}><Activity size={16} /> NAVIGATE_ADMIN_CONSOLE</div>}
          <div className="cmd-item" onClick={() => handleCommand('STRESS')} style={{ color: 'var(--accent)' }}><Zap size={16} /> TEST_CORE_INTEGRITY</div>
          <div className="cmd-item" onClick={() => handleCommand('RESONANCE')} style={{ color: 'var(--accent)' }}><Activity size={16} /> SESSION_RESONANCE_SYNC</div>
          <div className="cmd-item" onClick={() => handleCommand('DISCONNECT')} style={{ color: '#ff4d4d' }}><LogOut size={16} /> TERMINATE_SESSION</div>
        </div>

        <div className="mono" style={{ marginTop: '1.5rem', fontSize: '0.65rem', color: 'var(--text-secondary)', textAlign: 'center', letterSpacing: '2px' }}>
          ESC to DISMISS | ENTER to EXECUTE
        </div>
      </div>
    </div>
  );
};

// --- Tree Visualization ---
// --- Tree Visualization ---
const TreeNode = ({ node, nodes, depth = 0 }) => {
  const [collapsed, setCollapsed] = useState(false);
  const children = nodes.filter(n => n.parentId === node.id);
  const hasChildren = children.length > 0;

  return (
    <div style={{ marginLeft: depth > 0 ? 24 : 0, marginTop: 12, position: 'relative' }}>
      {/* Visual Link */}
      {depth > 0 && (
        <div style={{
          position: 'absolute', left: -14, top: -12, bottom: 0, width: 2,
          background: 'linear-gradient(to bottom, var(--accent), transparent)',
          opacity: 0.4
        }} />
      )}

      <div className="glass fade-in" style={{
        padding: '1rem',
        borderLeft: `4px solid ${hasChildren ? 'var(--accent)' : 'var(--text-secondary)'}`,
        fontSize: '0.9rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        position: 'relative',
        background: collapsed ? 'rgba(0, 240, 255, 0.02)' : 'var(--bg-glass)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {hasChildren && (
              <button
                onClick={() => setCollapsed(!collapsed)}
                style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', padding: 0, display: 'flex' }}
              >
                {collapsed ? <Plus size={14} /> : <div style={{ width: 14, height: 2, background: 'var(--accent)', display: 'inline-block' }} />}
              </button>
            )}
            <strong className="mono" style={{ color: 'var(--accent)', fontSize: '0.8rem' }}>@{node.username}</strong>
            {node.type === 'REMIX' && <span style={{ fontSize: '0.6rem', color: '#ff00ff' }}>✨ REMIX</span>}
          </div>
          <span className="mono" style={{ fontSize: '0.6rem', opacity: 0.5 }}>[{new Date(node.createdAt).toLocaleTimeString()}]</span>
        </div>

        <div style={{
          color: 'var(--text-primary)',
          lineHeight: '1.5',
          maxHeight: collapsed ? '1.5rem' : 'none',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: collapsed ? 'nowrap' : 'normal'
        }}>
          {node.content}
        </div>

        {hasChildren && collapsed && (
          <div className="mono" style={{ fontSize: '0.6rem', color: 'var(--accent)', marginTop: '8px', fontWeight: 'bold' }}>
            + {children.length} BRANCHES_HIDDEN
          </div>
        )}
      </div>

      {!collapsed && hasChildren && (
        <div className="fade-in">
          {children.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).map(child => (
            <TreeNode key={child.id} node={child} nodes={nodes} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const TreeModal = ({ rootId, onClose }) => {
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!rootId) return;
    setLoading(true);
    axios.get(`${config.apiUrl}/api/posts/tree/${rootId}`)
      .then(res => {
        setNodes(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [rootId]);

  const findRoot = () => {
    if (nodes.length === 0) return null;
    // Find highest level node (one with no parent or oldest)
    const root = nodes.find(n => !n.parentId) || nodes.reduce((prev, curr) => new Date(prev.createdAt) < new Date(curr.createdAt) ? prev : curr);
    return root;
  };

  const rootNode = findRoot();

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.92)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
      backdropFilter: 'blur(12px)'
    }} onClick={onClose}>
      <div
        className="glass cyber-grid"
        style={{
          width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto',
          padding: '3rem', position: 'relative', border: '1px solid var(--accent)'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="scanline" />

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem', alignItems: 'flex-start' }}>
          <div>
            <h2 className="mono glow-text" style={{ margin: 0, color: 'var(--accent)', fontSize: '1.8rem', letterSpacing: '6px' }}>LINEAGE_MAP</h2>
            <p className="mono" style={{ margin: '0.5rem 0', fontSize: '0.7rem', color: 'var(--text-secondary)', letterSpacing: '2px' }}>TRACING NEURAL EVOLUTION OVER DATA FRAGMENT #{rootId}</p>
          </div>
          <button onClick={onClose} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.7rem' }}>DISCONNECT</button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem' }}>
            <div className="loader mono" style={{ color: 'var(--accent)', letterSpacing: '4px' }}>ACCESSING_ARCHIVES...</div>
          </div>
        ) : !rootNode ? (
          <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-secondary)' }} className="mono">NO_DATA_LINEAGE_FOUND</div>
        ) : (
          <div style={{ paddingBottom: '2rem' }}>
            <TreeNode node={rootNode} nodes={nodes} />
          </div>
        )}
      </div>
    </div>
  );
};

// --- Screens ---

const LoadingScreen = () => (
  <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', gap: '1.5rem', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-primary)' }}>
    <Logo size={80} />
    <div style={{ color: 'var(--accent)', letterSpacing: '2px', fontWeight: 'bold', fontSize: '0.9rem' }}>SYNCING NEURAL BRIDGE...</div>
  </div>
);

const AuthScreen = ({ login, register, inline = false }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) await login(username, password);
      else await register(username, password);
    } catch (e) {
      alert('Error: ' + (e.response?.data?.error || e.message));
    }
  };

  // Inline mode - compact buttons for guests
  if (inline) {
    if (!showForm) {
      return (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn btn-primary"
            onClick={() => { setIsLogin(true); setShowForm(true); }}
            style={{ padding: '0.7rem 1.5rem', fontSize: '0.9rem' }}
          >
            Login
          </button>
          <button
            className="btn"
            onClick={() => { setIsLogin(false); setShowForm(true); }}
            style={{ padding: '0.7rem 1.5rem', fontSize: '0.9rem' }}
          >
            Sign Up
          </button>
        </div>
      );
    }

    return (
      <div className="glass" style={{ padding: '2rem', borderRadius: '16px', minWidth: '300px' }}>
        <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--accent)', fontSize: '1.2rem' }}>
          {isLogin ? 'Login' : 'Sign Up'}
        </h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-primary" style={{ flex: 1 }}>
              {isLogin ? 'Login' : 'Register'}
            </button>
            <button type="button" className="btn" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--accent)' }} onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? 'Need an account?' : 'Have an account?'}
        </p>
      </div>
    );
  }

  // Full-screen mode
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-primary)' }}>
      <div className="glass" style={{ padding: '3.5rem', width: '400px', borderRadius: '24px', textAlign: 'center' }}>
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
          <Logo size={60} />
        </div>
        <h2 style={{ marginTop: 0, color: 'var(--text-primary)', fontSize: '1.8rem', marginBottom: '0.5rem' }}>{isLogin ? 'Access Hub' : 'Join the Network'}</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
          {isLogin ? 'Authenticate your credentials to continue.' : 'Create your digital identity in the EchoHub.'}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          <button className="btn btn-primary" style={{ padding: '1rem', fontSize: '1rem' }}>
            {isLogin ? 'INITIALIZE' : 'REGISTER'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '2rem', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--accent)' }} onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? 'Need to establish a new link?' : 'Already have a secure connection?'}
        </p>
      </div>
    </div>
  );
};

export default function App() {
  const { user, login, register, loading } = useAuth();
  const [viewingTree, setViewingTree] = useState(null);
  const [showPalette, setShowPalette] = useState(false);
  const [sessionAge, setSessionAge] = useState(0);
  const [isStressed, setIsStressed] = useState(false);

  useEffect(() => {
    const toggleStress = () => setIsStressed(prev => !prev);
    window.addEventListener('toggleStress', toggleStress);
    return () => window.removeEventListener('toggleStress', toggleStress);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowPalette(prev => !prev);
      }
      if (e.key === 'Escape') {
        setShowPalette(false);
        setViewingTree(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Session-Based Visual State
  useEffect(() => {
    const interval = setInterval(() => {
      setSessionAge(prev => Math.min(100, prev + 1));
    }, 60000); // Shift every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (sessionAge > 0) {
      // Subtly reduce contrast and highlights
      const contrast = 1 - (sessionAge * 0.001); // Max 10% reduction
      const brightness = 1 - (sessionAge * 0.001);
      document.documentElement.style.setProperty('--app-filter', `contrast(${contrast}) brightness(${brightness}) grayscale(${sessionAge * 0.001})`);
    }
  }, [sessionAge]);

  useEffect(() => {
    if (user?.themeColor) {
      document.documentElement.style.setProperty('--accent', user.themeColor);
      // Also update accent-glow to match theme
      document.documentElement.style.setProperty('--accent-glow', `0 0 15px ${user.themeColor}66`);
    } else {
      // Default color
      document.documentElement.style.setProperty('--accent', '#00f0ff');
      document.documentElement.style.setProperty('--accent-glow', '0 0 15px rgba(0, 240, 255, 0.4)');
    }
  }, [user]);

  if (loading) return <LoadingScreen />;

  const location = useLocation();
  const isMessagesPage = location.pathname === '/messages';
  const isAuthRequiredPage = ['/messages', '/notifications', '/settings', '/admin'].includes(location.pathname);

  // Redirect to home if trying to access auth-required pages without login
  if (!user && isAuthRequiredPage) {
    return <AuthScreen login={login} register={register} />;
  }

  return (
    <div className={`app-layout ${isStressed ? 'glitch-active' : ''}`} style={{
      gridTemplateColumns: isMessagesPage ? '280px 1fr' : '280px 1fr 340px',
      maxWidth: '1440px',
      margin: '0 auto',
      padding: '0 2rem',
      gap: isMessagesPage ? '0' : '3.5rem',
      filter: 'var(--app-filter, none)',
      transition: 'filter 10s ease'
    }}>
      {isStressed && <div className="stress-banner">[ !! ALARM !! :: NETWORK_STRESS_DETECTED :: CORE_INTEGRITY_THREATENED ]</div>}
      {viewingTree && <TreeModal rootId={viewingTree} onClose={() => setViewingTree(null)} />}
      {showPalette && <CommandPalette onClose={() => setShowPalette(false)} />}
      <Sidebar login={login} register={register} />
      <div style={{ minWidth: 0 }}>
        <Routes>
          <Route path="/" element={<Feed socket={socket} onViewTree={setViewingTree} mode="home" />} />
          <Route path="/explore" element={<Feed socket={socket} onViewTree={setViewingTree} mode="explore" />} />
          <Route path="/post/:postId" element={<PostDetail />} />
          <Route path="/profile/:username" element={<Profile onViewTree={setViewingTree} />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
      {!isMessagesPage && <RightBar />}
    </div>
  );
}
