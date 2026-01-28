import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import { Send, User, Search, MessageSquare, Shield, Cpu, Activity, Lock, Terminal, ShieldCheck, ShieldAlert } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { encrypt, decrypt } from '../services/cryptoService';
import config from '../config';

const socket = io(config.socketUrl);

const Messages = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [conversations, setConversations] = useState([]);
    const [activeChat, setActiveChat] = useState(location.state?.recipient || null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const chatEndRef = useRef(null);
    const [showSidebar, setShowSidebar] = useState(true);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (!user) return;

        const fetchConversations = async () => {
            try {
                const res = await axios.get(`${config.apiUrl}/api/messages/conversations/${user.id}`);
                let convs = res.data;

                if (location.state?.recipient) {
                    const recipient = location.state.recipient;
                    if (!convs.find(c => c.id === recipient.id)) {
                        convs = [{
                            id: recipient.id,
                            username: recipient.username,
                            avatar: recipient.avatar,
                            lastMessage: 'ENCRYPTED BRIDGE INITIALIZED...',
                            lastTimestamp: new Date().toISOString()
                        }, ...convs];
                    }
                }

                setConversations(convs);
                setLoading(false);
            } catch (e) {
                console.error(e);
                setLoading(false);
            }
        };

        fetchConversations();

        socket.on('private_message', (msg) => {
            if (activeChat && (msg.senderId === activeChat.id || msg.receiverId === activeChat.id)) {
                setMessages(prev => [...prev, msg]);
            }
            fetchConversations();
        });

        return () => socket.off('private_message');
    }, [user, activeChat, location.state]);

    useEffect(() => {
        if (activeChat) {
            const fetchMessages = async () => {
                try {
                    const res = await axios.get(`${config.apiUrl}/api/messages/${user.id}/${activeChat.id}`);
                    const privateKey = localStorage.getItem(`priv_${user.id}`);

                    const processed = await Promise.all(res.data.map(async (msg) => {
                        if (msg.content.length > 50 && !msg.content.includes(' ')) { // Likely encrypted
                            const decrypted = await decrypt(msg.content, privateKey);
                            return { ...msg, content: decrypted || msg.content, isEncrypted: !!decrypted };
                        }
                        return { ...msg, isEncrypted: false };
                    }));

                    setMessages(processed);
                    scrollToBottom();
                } catch (e) {
                    console.error(e);
                }
            };
            fetchMessages();
            if (window.innerWidth < 1200) setShowSidebar(false);
        }
    }, [activeChat, user.id]);

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeChat) return;

        let contentToSend = newMessage;
        if (activeChat.publicKey) {
            contentToSend = await encrypt(newMessage, activeChat.publicKey);
        }

        try {
            await axios.post(`${config.apiUrl}/api/messages`, {
                senderId: user.id,
                receiverId: activeChat.id,
                content: contentToSend
            });
            setNewMessage('');
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) return (
        <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
            <Cpu size={48} className="scanline" style={{ color: 'var(--accent)', opacity: 0.5 }} />
            <div className="mono" style={{ color: 'var(--accent)', letterSpacing: '4px' }}>ACCESSING NEURAL BRIDGE...</div>
        </div>
    );

    return (
        <div className="cyber-grid" style={{
            display: 'flex',
            height: 'calc(100vh - 40px)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            overflow: 'hidden',
            marginTop: '20px',
            background: 'rgba(5, 5, 8, 0.8)',
            position: 'relative'
        }}>
            <div className="scanline" />

            {/* Sidebar List */}
            <div style={{
                width: showSidebar ? '380px' : '0',
                borderRight: showSidebar ? '1px solid var(--border)' : 'none',
                background: 'rgba(10, 10, 15, 0.4)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                overflow: 'hidden',
                zIndex: 20
            }}>
                <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid var(--border)', background: 'rgba(0, 240, 255, 0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Terminal size={20} color="var(--accent)" />
                        <h2 className="mono" style={{ fontSize: '1rem', margin: 0, color: 'var(--text-primary)', letterSpacing: '2px' }}>
                            CORE_SIGNALS
                        </h2>
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none' }}>
                    {conversations.length === 0 ? (
                        <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            <Activity size={32} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                            <div className="mono" style={{ fontSize: '0.7rem' }}>ZERO SIGNAL CARRIERS FOUND</div>
                        </div>
                    ) : (
                        conversations.map(conv => (
                            <div
                                key={conv.id}
                                onClick={() => setActiveChat(conv)}
                                style={{
                                    padding: '1.2rem 1.5rem',
                                    cursor: 'pointer',
                                    borderBottom: '1px solid rgba(255,255,255,0.02)',
                                    background: activeChat?.id === conv.id ? 'rgba(0, 240, 255, 0.06)' : 'transparent',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    gap: '15px',
                                    alignItems: 'center',
                                    position: 'relative'
                                }}
                            >
                                {activeChat?.id === conv.id && (
                                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: 'var(--accent)', boxShadow: 'var(--accent-glow)' }} />
                                )}
                                <div style={{ position: 'relative' }}>
                                    <img src={conv.avatar} width="48" height="48" style={{ borderRadius: '12px', border: '1px solid var(--border)', objectFit: 'cover' }} alt="" />
                                    <div style={{ position: 'absolute', bottom: -2, right: -2, width: '12px', height: '12px', background: '#00ff9d', borderRadius: '50%', border: '2px solid var(--bg-primary)', boxShadow: '0 0 10px #00ff9d' }} />
                                </div>
                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span className="mono" style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.9rem' }}>{conv.username.toUpperCase()}</span>
                                        <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', opacity: 0.6 }}>
                                            {conv.lastTimestamp && new Date(conv.lastTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', opacity: 0.8 }}>
                                        {conv.lastMessage}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.3)', position: 'relative' }}>
                {/* Header Overlay */}
                <div style={{
                    padding: '1rem 2rem',
                    background: 'rgba(10, 10, 15, 0.8)',
                    backdropFilter: 'blur(10px)',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    zIndex: 10
                }}>
                    <button
                        onClick={() => setShowSidebar(!showSidebar)}
                        className="btn"
                        style={{ padding: '10px' }}
                    >
                        <MessageSquare size={18} strokeWidth={3} />
                    </button>

                    {activeChat && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <img src={activeChat.avatar} width="36" height="36" style={{ borderRadius: '8px' }} alt="" />
                            <div>
                                <div className="mono" style={{ fontWeight: 'bold', fontSize: '1rem', letterSpacing: '1px' }}>{activeChat.username.toUpperCase()}</div>
                                <div className="mono" style={{ fontSize: '0.6rem', color: '#00ff9d', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <Lock size={10} /> ENCRYPTED_LINK_ACTIVE
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {activeChat ? (
                    <>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', scrollbarWidth: 'none' }}>
                            {activeChat.username === 'EchoBot' && (
                                <div style={{
                                    position: 'absolute',
                                    inset: 0,
                                    zIndex: 100,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'rgba(5, 5, 8, 0.9)',
                                    backdropFilter: 'blur(20px)',
                                    padding: '2rem'
                                }}>
                                    <div className="scanline" style={{ height: '2px', background: 'var(--accent)', opacity: 0.5 }} />
                                    <Shield size={64} style={{ color: 'var(--accent)', marginBottom: '1.5rem', filter: 'drop-shadow(0 0 10px var(--accent))' }} />
                                    <h2 className="mono glow-text" style={{ margin: 0, letterSpacing: '4px', fontSize: '1.5rem' }}>LINK_CALIBRATION_PENDING</h2>
                                    <p className="mono" style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '1.5rem', maxWidth: '400px', lineHeight: '1.8' }}>
                                        [NOTICE] EchoBot direct interface is currently being integrated into the neural mesh. <br /><br />
                                        EXPECTED COMPLETION: Q1 // 2026
                                    </p>
                                </div>
                            )}

                            {messages.map((msg, i) => (
                                <div key={i} className="fade-in" style={{
                                    alignSelf: msg.senderId === user.id ? 'flex-end' : 'flex-start',
                                    maxWidth: '75%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: msg.senderId === user.id ? 'flex-end' : 'flex-start'
                                }}>
                                    <div className="glass" style={{
                                        padding: '1rem 1.4rem',
                                        borderRadius: msg.senderId === user.id ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                        background: msg.senderId === user.id ? 'rgba(0, 240, 255, 0.08)' : 'rgba(255,255,255,0.03)',
                                        border: msg.senderId === user.id ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.08)',
                                        color: '#fff',
                                        fontSize: '0.95rem',
                                        boxShadow: msg.senderId === user.id ? '0 0 30px rgba(0, 240, 255, 0.05)' : 'none',
                                        lineHeight: '1.6'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                            {msg.isEncrypted ? <ShieldCheck size={12} color="#00ff9d" /> : <ShieldAlert size={12} color="#ff4d4d" />}
                                            <span className="mono" style={{ fontSize: '0.6rem', color: msg.isEncrypted ? '#00ff9d' : 'var(--text-secondary)' }}>
                                                {msg.isEncrypted ? 'SECURE_UPLINK' : 'PLAINTEXT_SIGNAL'}
                                            </span>
                                        </div>
                                        {msg.content}
                                    </div>
                                    <span className="mono" style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginTop: '6px', opacity: 0.5 }}>
                                        [{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
                                    </span>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input Area */}
                        <div style={{ padding: '2rem', borderTop: '1px solid var(--border)', background: 'rgba(10, 10, 15, 0.6)' }}>
                            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ flex: 1, position: 'relative' }}>
                                    <input
                                        className="glass mono"
                                        style={{
                                            padding: '1.2rem 1.8rem',
                                            background: 'rgba(255,255,255,0.02)',
                                            borderRadius: '12px',
                                            color: '#fff',
                                            fontSize: '0.9rem'
                                        }}
                                        placeholder="ESTABLISH_UPLINK..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                    />
                                    <div style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }}>
                                        <Activity size={16} color="var(--accent)" />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    style={{
                                        width: '56px',
                                        height: '56px',
                                        padding: 0
                                    }}
                                >
                                    <Send size={24} strokeWidth={3} />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', textAlign: 'center' }}>
                        <div style={{
                            width: '120px', height: '120px',
                            borderRadius: '50%',
                            background: 'rgba(0, 240, 255, 0.03)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: '2rem',
                            border: '1px solid rgba(0, 240, 255, 0.08)',
                            boxShadow: '0 0 50px rgba(0, 240, 255, 0.05)'
                        }}>
                            <Cpu size={48} style={{ color: 'var(--accent)', opacity: 0.3 }} />
                        </div>
                        <h2 className="mono glow-text" style={{ fontSize: '1.5rem', letterSpacing: '4px', marginBottom: '1rem' }}>NEURAL_BRIDGE_IDLE</h2>
                        <p className="mono" style={{ maxWidth: '400px', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '2' }}>
                            AWAITING CARRIER SIGNAL. SELECT A DIGITAL FREQUENCY FROM THE MANIFEST TO INITIALIZE NEURAL TRANSDUCTION.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messages;
