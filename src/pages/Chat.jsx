import { useEffect, useState, useContext, useRef } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import defaultAvatar from '../assets/default-avatar.jpg';
import { StepBack, StepForward } from 'lucide-react';
import moment from "moment-timezone";

export default function Chat() {
    const { user } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [collapsed, setCollapsed] = useState(false);
    const socketRef = useRef(null);
    const selectedUserRef = useRef(null);
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        api.get('/users')
            .then((res) => setUsers(res.data))
            .catch(() => setUsers([]));
    }, []);

    useEffect(() => {
        console.log("Selected User Changed:", selectedUser);
    }, [selectedUser]);

    useEffect(() => {
        console.log("Messages Updated:", messages);
    }, [messages]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const ws = new WebSocket(`wss://pulsechat-be-production.up.railway.app/ws?token=${token}`);
        socketRef.current = ws;

        ws.onopen = () => {
            console.log('WebSocket connected');
        };

        ws.onmessage = (event) => {
            const rawData = JSON.parse(event.data);
            const data = {
                ...rawData,
                sender_id: rawData.sender_id || rawData.from,
            };

            const isMine = data.sender_id === user.id;
            const current = selectedUserRef.current;

            if (
                (isMine && data.to === current?.id) ||
                (!isMine && data.sender_id === current?.id)
            ) {
                setMessages((prev) => [...prev, data]);
                scrollToBottom();
            } else if (!isMine) {
                const sender = users.find((u) => u.id === data.sender_id);
                if (sender) {
                    console.log("Message received from:", sender.username);
                }
            }
        };

        ws.onerror = (err) => {
            console.error('WebSocket error', err);
        };

        return () => {
            ws.close();
        };
    }, [user.id, messages]);

    useEffect(() => {
        selectedUserRef.current = selectedUser;
    }, [selectedUser]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessages = async (targetUser) => {
        try {
            const res = await api.get(`/messages/${targetUser.id}`);
            const formatted = res.data.map((msg) => ({
                ...msg,
                me: msg.sender_id === user.id,
            }));
            setMessages(formatted);
        } catch {
            setMessages([]);
        }
    };

    const handleUserClick = async (u) => {
        setSelectedUser(u);
        await fetchMessages(u);
    };

    const handleSend = () => {
        if (
            socketRef.current &&
            socketRef.current.readyState === WebSocket.OPEN &&
            selectedUser &&
            message.trim()
        ) {
            const payload = {
                to: selectedUser.id,
                content: message.trim(),
            };

            const tempMessage = {
                ...payload,
                sender_id: user.id,
                created_at: new Date().toISOString(),
                me: true,
            };
            setMessages(prev => [...prev, tempMessage]);
            socketRef.current.send(JSON.stringify(payload));
            setMessage('');
        } else {
            console.warn('WebSocket not ready or missing data');
        }
    };

    return (
        <div className="flex h-[886px] bg-gray-100">
            {/* Sidebar */}
            <div className={`transition-all duration-300 ${collapsed ? 'w-20' : 'w-1/4'} border-r p-4 flex flex-col bg-white shadow-sm`}>
                <div className="flex justify-end mb-4">
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="text-gray-500 hover:text-gray-700"
                        title={collapsed ? 'Expand' : 'Collapse'}
                    >
                        {collapsed ? <StepForward /> : <StepBack />}
                    </button>
                </div>

                {/* Current User */}
                <div className="flex items-center mb-6">
                    <img
                        src={user.avatar || defaultAvatar}
                        alt="Me"
                        className="w-12 h-12 rounded-full mr-2 border object-cover"
                    />
                    {!collapsed && (
                        <div>
                            <div className="font-semibold text-sm">{user.username}</div>
                            <div className="text-xs text-gray-500 truncate w-40">{user.bio}</div>
                        </div>
                    )}
                </div>

                {!collapsed && (
                    <h2 className="font-semibold text-gray-600 mb-2 text-sm">Available Users</h2>
                )}

                <div className="overflow-y-auto flex-1 space-y-2">
                    {users.filter(u => u.id !== user.id).map((u) => (
                        <div
                            key={u.id}
                            className={`flex items-center p-2 rounded-lg cursor-pointer transition hover:bg-blue-100 ${selectedUser?.id === u.id ? 'bg-blue-200' : 'bg-white'
                                }`}
                            onClick={() => handleUserClick(u)}
                        >
                            <img
                                src={u.avatar || defaultAvatar}
                                alt={u.username}
                                className="w-10 h-10 rounded-full mr-2 object-cover border"
                            />
                            {!collapsed && (
                                <div className="text-sm font-medium text-gray-800">{u.username}</div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="w-full flex flex-col p-6">
                {!selectedUser ? (
                    <div className="flex-1 flex items-center justify-center text-gray-400">
                        <div className="text-center">
                            <img
                                src={defaultAvatar}
                                alt="Chat Placeholder"
                                className="w-24 h-24 mx-auto mb-4 opacity-40"
                            />
                            <p className="text-sm">Select a user to start chatting</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-y-auto bg-white p-6 rounded-2xl shadow-md">
                            <h2 className="text-xl font-semibold mb-6 text-gray-700 border-b pb-2">
                                Chat with {selectedUser.username}
                            </h2>
                            {messages?.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`my-2 flex flex-col ${msg.me ? 'items-end' : 'items-start'}`}
                                >
                                    <div
                                        className={`px-4 py-2 max-w-xs rounded-xl shadow-sm transition ${msg.me
                                            ? 'bg-blue-500 text-white rounded-br-none'
                                            : 'bg-gray-200 text-gray-800 rounded-bl-none'
                                            }`}
                                    >
                                        {msg.content}
                                    </div>
                                    <span className="text-xs text-gray-500 mt-1">
                                        {new Date(new Date(msg.created_at).getTime() - 5.5 * 60 * 60 * 1000)
                                            .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                    </span>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>

                        <div className="flex items-center gap-2 p-4 border-t shadow-inner">
                            <input
                                type="text"
                                placeholder="Type your message..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") handleSend() }}
                                className="flex-1 px-4 py-2 rounded-full border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!message.trim() || !selectedUser || socketRef.current?.readyState !== WebSocket.OPEN}
                                className={`px-5 py-2 rounded-full font-semibold transition duration-150 shadow-lg ${(!message.trim() || !selectedUser || socketRef.current?.readyState !== WebSocket.OPEN)
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                    }`}
                            >
                                Send
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
