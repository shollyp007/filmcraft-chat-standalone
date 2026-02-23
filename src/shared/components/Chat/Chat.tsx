import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Hash, Lock, Send, User, ChevronDown, ChevronRight,
  MessageSquare, Users, Film, Search, X, Smile, Wifi, WifiOff, Link,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useChatSocket } from '../../hooks/useChatSocket';
import type { ChatUser, ChatDepartment } from '../../types';
import { CHAT_DEPARTMENTS } from '../../types';
import { v4 as uuid } from '../../utils/uuid';

// ─── Emoji data ──────────────────────────────────────────────

const EMOJI_GROUPS = [
  { label: 'Film', emojis: ['🎬', '🎥', '📷', '🎞️', '🎭', '🎤', '💡', '🎨', '📋', '📢', '🎯', '✅'] },
  { label: 'React', emojis: ['👍', '👎', '❤️', '😂', '😮', '😢', '😡', '🙌', '👏', '🔥', '💯', '🤔'] },
  { label: 'People', emojis: ['🙏', '💪', '✌️', '🤝', '👋', '🫡', '😎', '🤩', '😅', '🥳', '😴', '🤫'] },
  { label: 'Signs', emojis: ['⚠️', '❌', '⭐', '🚀', '💬', '📌', '🔔', '⏰', '📅', '🏆', '💎', '🎁'] },
];

// ─── Helpers ────────────────────────────────────────────────

function formatTime(ts: string) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDateLabel(ts: string) {
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
}

function avatarInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

const DEPT_COLORS: Record<string, string> = {
  Camera: 'bg-blue-600', Art: 'bg-yellow-600', Wardrobe: 'bg-purple-600',
  Sound: 'bg-green-600', 'Makeup & Hair': 'bg-pink-600', Production: 'bg-indigo-600',
  VFX: 'bg-cyan-600', Stunts: 'bg-red-600', Locations: 'bg-orange-600', '': 'bg-gray-600',
};

function Avatar({ name, department, size = 'sm' }: { name: string; department?: string; size?: 'sm' | 'md' }) {
  const color = DEPT_COLORS[department ?? ''] ?? 'bg-gray-600';
  const cls = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm';
  return (
    <div className={`${cls} ${color} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 select-none`}>
      {avatarInitials(name)}
    </div>
  );
}

// ─── Emoji Picker ────────────────────────────────────────────

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
  alignRight?: boolean;
}

function EmojiPicker({ onSelect, onClose, alignRight }: EmojiPickerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className={`absolute bottom-full mb-1 z-50 bg-[#1a1a2e] border border-[#2d2b5b] rounded-xl shadow-2xl p-2 w-64
        ${alignRight ? 'right-0' : 'left-0'}`}
    >
      {EMOJI_GROUPS.map(group => (
        <div key={group.label} className="mb-1">
          <div className="text-[9px] text-gray-600 uppercase tracking-wider px-1 mb-1">{group.label}</div>
          <div className="grid grid-cols-6 gap-0.5">
            {group.emojis.map(e => (
              <button
                key={e}
                onClick={() => { onSelect(e); onClose(); }}
                className="text-lg hover:bg-white/10 rounded-lg p-1 transition-colors leading-none flex items-center justify-center h-8"
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Reactions Bar ───────────────────────────────────────────

interface ReactionsBarProps {
  reactions: Record<string, string[]>;
  currentUserId: string;
  onToggle: (emoji: string) => void;
  onAddNew: () => void;
  showPicker: boolean;
  onClosePicker: () => void;
  alignRight?: boolean;
}

function ReactionsBar({ reactions, currentUserId, onToggle, onAddNew, showPicker, onClosePicker, alignRight }: ReactionsBarProps) {
  const entries = Object.entries(reactions).filter(([, ids]) => ids.length > 0);

  return (
    <div className="flex flex-wrap items-center gap-1 mt-1 relative">
      {entries.map(([emoji, userIds]) => {
        const mine = userIds.includes(currentUserId);
        return (
          <button
            key={emoji}
            onClick={() => onToggle(emoji)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-colors
              ${mine
                ? 'bg-indigo-600/30 border-indigo-500 text-white'
                : 'bg-[#1a1a2e] border-[#2d2b5b] text-gray-300 hover:border-indigo-500/50'
              }`}
          >
            <span className="text-sm leading-none">{emoji}</span>
            <span className="font-medium">{userIds.length}</span>
          </button>
        );
      })}
      <div className="relative">
        <button
          onClick={onAddNew}
          className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs border border-dashed border-[#2d2b5b] text-gray-500 hover:text-gray-300 hover:border-gray-500 transition-colors"
        >
          <Smile size={11} />
        </button>
        {showPicker && (
          <EmojiPicker
            onSelect={onToggle}
            onClose={onClosePicker}
            alignRight={alignRight}
          />
        )}
      </div>
    </div>
  );
}

// ─── Identity Picker ────────────────────────────────────────

interface IdentityPickerProps { onSelect: (user: ChatUser) => void; }

function IdentityPicker({ onSelect }: IdentityPickerProps) {
  const { activeProject } = useStore();
  const project = activeProject();
  const [customName, setCustomName] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [customDept, setCustomDept] = useState<ChatDepartment>('Production');
  const [tab, setTab] = useState<'crew' | 'custom'>('crew');

  const members: ChatUser[] = project.crew.map(c => ({
    id: c.id, name: c.name, role: c.role, department: c.department,
  }));

  return (
    <div className="flex-1 flex items-center justify-center bg-[#0f0f1a]">
      <div className="bg-[#1a1a2e] border border-[#2d2b5b] rounded-xl p-8 w-full max-w-md shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <MessageSquare size={20} className="text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-lg">FilmCraft Chat</div>
            <div className="text-gray-400 text-sm">{project.name}</div>
          </div>
        </div>
        <p className="text-gray-400 text-sm mb-5">Who are you on this production?</p>
        <div className="flex gap-2 mb-5">
          <button onClick={() => setTab('crew')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'crew' ? 'bg-indigo-600 text-white' : 'bg-[#0d0d1f] text-gray-400 hover:text-white'}`}>
            Select from crew
          </button>
          <button onClick={() => setTab('custom')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'custom' ? 'bg-indigo-600 text-white' : 'bg-[#0d0d1f] text-gray-400 hover:text-white'}`}>
            Enter manually
          </button>
        </div>
        {tab === 'crew' ? (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {members.length === 0
              ? <p className="text-gray-500 text-sm text-center py-4">No crew added yet. Switch to manual entry.</p>
              : members.map(m => (
                <button key={m.id} onClick={() => onSelect(m)} className="w-full flex items-center gap-3 p-3 rounded-lg bg-[#0d0d1f] hover:bg-[#2d2b5b] transition-colors text-left">
                  <Avatar name={m.name} department={m.department} />
                  <div>
                    <div className="text-white text-sm font-medium">{m.name}</div>
                    <div className="text-gray-500 text-xs">{m.role} · {m.department}</div>
                  </div>
                </button>
              ))
            }
          </div>
        ) : (
          <div className="space-y-3">
            <input type="text" placeholder="Your name" value={customName} onChange={e => setCustomName(e.target.value)}
              className="w-full bg-[#0d0d1f] border border-[#2d2b5b] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
            <input type="text" placeholder="Your role (e.g. Director)" value={customRole} onChange={e => setCustomRole(e.target.value)}
              className="w-full bg-[#0d0d1f] border border-[#2d2b5b] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
            <select value={customDept} onChange={e => setCustomDept(e.target.value as ChatDepartment)}
              className="w-full bg-[#0d0d1f] border border-[#2d2b5b] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500">
              {CHAT_DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
            </select>
            <button onClick={() => { if (customName.trim()) onSelect({ id: uuid(), name: customName.trim(), role: customRole.trim() || 'Crew', department: customDept }); }}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors">
              Join Chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Message List ────────────────────────────────────────────

interface MessageListProps {
  messages: NonNullable<ReturnType<typeof useStore.getState>['chatMessages'][string]>;
  currentUserId: string;
  onReaction: (messageId: string, emoji: string) => void;
}

function MessageList({ messages, currentUserId, onReaction }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [pickerForId, setPickerForId] = useState<string | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const closePicker = useCallback(() => setPickerForId(null), []);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-center">
        <div>
          <MessageSquare size={40} className="text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No messages yet. Say something!</p>
        </div>
      </div>
    );
  }

  let lastDate = '';
  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
      {messages.map((msg, idx) => {
        const msgDate = formatDateLabel(msg.timestamp);
        const showDateSep = msgDate !== lastDate;
        if (showDateSep) lastDate = msgDate;

        const prevMsg = messages[idx - 1];
        const grouped = !!prevMsg && prevMsg.senderId === msg.senderId &&
          new Date(msg.timestamp).getTime() - new Date(prevMsg.timestamp).getTime() < 5 * 60 * 1000;

        const isMine = msg.senderId === currentUserId;
        const reactions = msg.reactions ?? {};
        const hasReactions = Object.values(reactions).some(ids => ids.length > 0);

        return (
          <React.Fragment key={msg.id}>
            {showDateSep && (
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-[#2d2b5b]" />
                <span className="text-xs text-gray-500 px-2">{msgDate}</span>
                <div className="flex-1 h-px bg-[#2d2b5b]" />
              </div>
            )}
            <div
              className={`group flex gap-3 ${grouped ? 'mt-0.5' : 'mt-3'} ${isMine ? 'flex-row-reverse' : ''}`}
              onMouseEnter={() => setHoveredId(msg.id)}
              onMouseLeave={() => { setHoveredId(null); }}
            >
              {!grouped
                ? <Avatar name={msg.senderName} department={msg.senderDepartment} />
                : <div className="w-7 flex-shrink-0" />
              }

              <div className={`max-w-[70%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                {!grouped && (
                  <div className={`flex items-baseline gap-2 mb-0.5 ${isMine ? 'flex-row-reverse' : ''}`}>
                    <span className="text-sm font-semibold text-white">{msg.senderName}</span>
                    {msg.senderDepartment && <span className="text-[10px] text-indigo-400">{msg.senderDepartment}</span>}
                    <span className="text-[10px] text-gray-600">{formatTime(msg.timestamp)}</span>
                  </div>
                )}

                {/* Bubble + emoji button row */}
                <div className={`flex items-end gap-1.5 ${isMine ? 'flex-row-reverse' : ''}`}>
                  <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed break-words whitespace-pre-wrap
                    ${isMine
                      ? 'bg-indigo-600 text-white rounded-tr-sm'
                      : 'bg-[#1a1a2e] text-gray-200 rounded-tl-sm border border-[#2d2b5b]'
                    }`}
                  >
                    {msg.content}
                  </div>

                  {/* Hover emoji button */}
                  <div className="relative flex-shrink-0">
                    <button
                      onClick={() => setPickerForId(prev => prev === msg.id ? null : msg.id)}
                      className={`p-1 rounded-lg bg-[#1a1a2e] border border-[#2d2b5b] text-gray-500 hover:text-gray-200 hover:border-indigo-500/50 transition-all
                        ${hoveredId === msg.id || pickerForId === msg.id ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                    >
                      <Smile size={13} />
                    </button>
                    {pickerForId === msg.id && (
                      <EmojiPicker
                        onSelect={emoji => { onReaction(msg.id, emoji); setPickerForId(null); }}
                        onClose={closePicker}
                        alignRight={isMine}
                      />
                    )}
                  </div>
                </div>

                {/* Reactions */}
                {hasReactions && (
                  <ReactionsBar
                    reactions={reactions}
                    currentUserId={currentUserId}
                    onToggle={emoji => onReaction(msg.id, emoji)}
                    onAddNew={() => setPickerForId(prev => prev === msg.id ? null : msg.id)}
                    showPicker={false}
                    onClosePicker={closePicker}
                    alignRight={isMine}
                  />
                )}

                {grouped && (
                  <span className="text-[10px] text-gray-700 mt-0.5 px-1">{formatTime(msg.timestamp)}</span>
                )}
              </div>
            </div>
          </React.Fragment>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}

// ─── Message Input ───────────────────────────────────────────

interface MessageInputProps {
  placeholder: string;
  onSend: (text: string) => void;
  onEmoji: (emoji: string) => void;
}

function MessageInput({ placeholder, onSend, onEmoji }: MessageInputProps) {
  const [text, setText] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text);
    setText('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  return (
    <div className="px-4 pb-4">
      <div className="flex items-end gap-2 bg-[#1a1a2e] border border-[#2d2b5b] rounded-xl px-3 py-2 focus-within:border-indigo-500 transition-colors relative">
        {/* Emoji trigger */}
        <div className="relative flex-shrink-0 mb-0.5">
          <button
            onClick={() => setShowPicker(p => !p)}
            className={`p-1 rounded-lg transition-colors ${showPicker ? 'text-indigo-400 bg-indigo-600/20' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Smile size={16} />
          </button>
          {showPicker && (
            <div className="absolute bottom-full left-0 mb-1">
              <EmojiPicker
                onSelect={e => { onEmoji(e); setShowPicker(false); }}
                onClose={() => setShowPicker(false)}
              />
            </div>
          )}
        </div>

        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-white text-sm resize-none focus:outline-none placeholder-gray-600 py-1 leading-relaxed"
          style={{ maxHeight: '120px' }}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className="mb-0.5 p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex-shrink-0"
        >
          <Send size={14} className="text-white" />
        </button>
      </div>
      <p className="text-[10px] text-gray-700 mt-1 text-right">Enter to send · Shift+Enter for new line</p>
    </div>
  );
}

// ─── Channel Button ──────────────────────────────────────────

function ChannelButton({ active, icon, label, onClick, unread }: {
  active: boolean; icon: React.ReactNode; label: string; onClick: () => void; unread: boolean;
}) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors
      ${active ? 'bg-indigo-600/20 text-white' : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'}`}>
      <span className={active ? 'text-indigo-400' : 'text-gray-600'}>{icon}</span>
      <span className={`flex-1 truncate ${unread && !active ? 'font-semibold text-gray-300' : ''}`}>{label}</span>
    </button>
  );
}

// ─── Member Row ──────────────────────────────────────────────

function MemberRow({ user, isSelf, online, onClick }: {
  user: ChatUser; isSelf?: boolean; online?: boolean; onClick?: () => void;
}) {
  return (
    <button onClick={onClick} disabled={isSelf}
      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 text-left transition-colors disabled:cursor-default">
      <div className="relative">
        <Avatar name={user.name} department={user.department} size="sm" />
        <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0d0d1f]
          ${online ? 'bg-green-500' : 'bg-gray-600'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-xs font-medium truncate ${online ? 'text-white' : 'text-gray-500'}`}>
          {user.name}{isSelf && <span className="text-gray-500 font-normal"> (you)</span>}
        </div>
        <div className="text-gray-600 text-[10px] truncate">{user.role}</div>
      </div>
    </button>
  );
}

// ─── Invite Link Button ──────────────────────────────────────

const STANDALONE_URL = 'https://film-chatbot.vercel.app';

function InviteLinkButton({ projectId, projectName }: { projectId: string; projectName: string }) {
  const [copied, setCopied] = useState(false);

  function copyLink() {
    const url = `${STANDALONE_URL}/?pid=${projectId}&pname=${encodeURIComponent(projectName)}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      onClick={copyLink}
      title="Copy invite link"
      className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors flex-shrink-0
        bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 hover:text-indigo-300 border border-indigo-600/30"
    >
      <Link size={10} />
      {copied ? 'Copied!' : 'Invite'}
    </button>
  );
}

// ─── Main Chat ───────────────────────────────────────────────

export default function Chat() {
  const {
    chatCurrentUser, setChatUser,
    chatMessages, sendChatMessage, addReaction,
    chatDms, activeChatChannelId, activeDmId,
    setActiveChatChannel, startOrOpenDM, setActiveDm,
    activeProject, socketConnected, onlineMembers,
  } = useStore();

  // Manage the WebSocket connection
  useChatSocket();

  const project = activeProject();
  const [channelsOpen, setChannelsOpen] = useState(true);
  const [dmsOpen, setDmsOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMemberList, setShowMemberList] = useState(false);

  const generalChannelId = `${project.id}:general`;
  const deptChannelId = (dept: ChatDepartment) =>
    `${project.id}:${dept.toLowerCase().replace(/[\s&]+/g, '-')}`;

  const allMembers: ChatUser[] = [
    ...project.crew.map(c => ({ id: c.id, name: c.name, role: c.role, department: c.department })),
    ...project.collaborators.map(c => ({ id: c.id, name: c.name, role: c.role, department: 'Production' })),
  ];

  if (!chatCurrentUser) return <IdentityPicker onSelect={user => setChatUser(user)} />;

  const activeRoomId = activeDmId || activeChatChannelId;
  const messages = chatMessages[activeRoomId] ?? [];

  let roomLabel = '# general';
  let roomSubtitle = 'General project chat for everyone';
  if (activeDmId) {
    const dm = chatDms.find(d => d.id === activeDmId);
    const otherName = dm?.participantNames.find(n => n !== chatCurrentUser.name) ?? 'Unknown';
    roomLabel = `@ ${otherName}`;
    roomSubtitle = 'Private message';
  } else if (activeChatChannelId !== generalChannelId) {
    const dept = CHAT_DEPARTMENTS.find(d => deptChannelId(d) === activeChatChannelId);
    if (dept) { roomLabel = `# ${dept}`; roomSubtitle = `${dept} department channel`; }
  }

  const dmableMembers = allMembers.filter(m => m.id !== chatCurrentUser.id);
  const filteredMembers = searchQuery
    ? dmableMembers.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : dmableMembers;

  return (
    <div className="flex h-full overflow-hidden bg-[#0f0f1a]">

      {/* ── Left Sidebar ── */}
      <div className="w-64 flex-shrink-0 flex flex-col bg-[#0d0d1f] border-r border-[#1e1b4b]">

        {/* Project header */}
        <div className="px-3 py-3 border-b border-[#1e1b4b]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <Film size={14} className="text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-white text-sm font-semibold truncate">{project.name}</div>
              <div className="text-[10px] text-gray-500">FilmCraft Chat</div>
            </div>
            <InviteLinkButton projectId={project.id} projectName={project.name} />
          </div>
        </div>

        {/* Search */}
        <div className="px-2 py-2 border-b border-[#1e1b4b]">
          <div className="flex items-center gap-2 bg-[#1a1a2e] rounded-lg px-2 py-1.5 border border-[#2d2b5b]">
            <Search size={12} className="text-gray-500 flex-shrink-0" />
            <input type="text" placeholder="Search members..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-xs text-white placeholder-gray-600 focus:outline-none" />
            {searchQuery && <button onClick={() => setSearchQuery('')}><X size={11} className="text-gray-500 hover:text-gray-300" /></button>}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-1">
          {/* Channels */}
          <div className="mb-1">
            <button onClick={() => setChannelsOpen(o => !o)}
              className="w-full flex items-center gap-1 px-3 py-1 text-[11px] text-gray-500 hover:text-gray-300 font-semibold uppercase tracking-wider">
              {channelsOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
              Channels
            </button>
            {channelsOpen && (
              <>
                <ChannelButton active={activeChatChannelId === generalChannelId && !activeDmId}
                  icon={<Hash size={14} />} label="general"
                  onClick={() => setActiveChatChannel(generalChannelId)}
                  unread={(chatMessages[generalChannelId] ?? []).length > 0} />
                {CHAT_DEPARTMENTS.map(dept => (
                  <ChannelButton key={dept}
                    active={activeChatChannelId === deptChannelId(dept) && !activeDmId}
                    icon={<Hash size={14} />}
                    label={dept.toLowerCase()}
                    onClick={() => setActiveChatChannel(deptChannelId(dept))}
                    unread={(chatMessages[deptChannelId(dept)] ?? []).length > 0} />
                ))}
              </>
            )}
          </div>

          {/* DMs */}
          <div className="mb-1">
            <button onClick={() => setDmsOpen(o => !o)}
              className="w-full flex items-center gap-1 px-3 py-1 text-[11px] text-gray-500 hover:text-gray-300 font-semibold uppercase tracking-wider">
              {dmsOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
              Direct Messages
            </button>
            {dmsOpen && (
              <>
                {chatDms.map(dm => {
                  const otherName = dm.participantNames.find(n => n !== chatCurrentUser.name) ?? 'Unknown';
                  const otherId = dm.participantIds.find(id => id !== chatCurrentUser.id) ?? '';
                  const other = allMembers.find(m => m.id === otherId);
                  return (
                    <button key={dm.id} onClick={() => setActiveDm(dm.id)}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors
                        ${activeDmId === dm.id ? 'bg-indigo-600/20 text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}>
                      <Avatar name={otherName} department={other?.department} size="sm" />
                      <span className="truncate">{otherName}</span>
                    </button>
                  );
                })}
                {filteredMembers.filter(m => !chatDms.some(dm => dm.participantIds.includes(m.id))).map(m => (
                  <button key={m.id} onClick={() => startOrOpenDM(m)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-left transition-colors text-gray-600 hover:text-gray-300 hover:bg-white/5">
                    <div className="w-7 h-7 rounded-full border border-dashed border-gray-700 flex items-center justify-center flex-shrink-0">
                      <User size={12} className="text-gray-600" />
                    </div>
                    <span className="truncate text-xs">{m.name}</span>
                  </button>
                ))}
                {allMembers.filter(m => m.id !== chatCurrentUser.id).length === 0 && (
                  <p className="text-[10px] text-gray-700 px-3 py-2">Add crew members to start DMs.</p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Current user footer */}
        <div className="p-3 border-t border-[#1e1b4b] flex items-center gap-2">
          <Avatar name={chatCurrentUser.name} department={chatCurrentUser.department} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="text-white text-xs font-medium truncate">{chatCurrentUser.name}</div>
            <div className="text-gray-600 text-[10px] truncate">{chatCurrentUser.department}</div>
          </div>
          <button onClick={() => setChatUser(null)} title="Switch identity" className="text-gray-600 hover:text-gray-400 transition-colors">
            <X size={13} />
          </button>
        </div>
      </div>

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e1b4b] bg-[#0d0d1f]">
          <div>
            <div className="text-white font-semibold text-sm flex items-center gap-1.5">
              {activeDmId ? <Lock size={14} className="text-gray-400" /> : <Hash size={14} className="text-gray-400" />}
              {roomLabel.replace(/^[#@] /, '')}
            </div>
            <div className="text-gray-500 text-xs">{roomSubtitle}</div>
          </div>
          <div className="flex items-center gap-2">
            {/* Connection status badge */}
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium
              ${socketConnected
                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
              }`}>
              {socketConnected
                ? <><Wifi size={10} /> Live</>
                : <><WifiOff size={10} /> Offline</>
              }
            </div>
            <button
              onClick={() => setShowMemberList(s => !s)}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs transition-colors
                ${showMemberList ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}>
              <Users size={14} />
              {allMembers.length + 1}
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Messages + input */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <MessageList
              messages={messages}
              currentUserId={chatCurrentUser.id}
              onReaction={(msgId, emoji) => addReaction(activeRoomId, msgId, emoji)}
            />
            <MessageInput
              placeholder={activeDmId ? `Message ${roomLabel.replace(/^@ /, '')}` : `Message ${roomLabel}`}
              onSend={text => sendChatMessage(activeRoomId, text)}
              onEmoji={emoji => sendChatMessage(activeRoomId, emoji)}
            />
          </div>

          {/* Member panel */}
          {showMemberList && (
            <div className="w-56 border-l border-[#1e1b4b] bg-[#0d0d1f] flex flex-col">
              <div className="px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-[#1e1b4b]">
                Members — {allMembers.length + 1}
                {onlineMembers.length > 0 && (
                  <span className="text-green-400 font-normal ml-1">· {onlineMembers.length} online</span>
                )}
              </div>
              <div className="flex-1 overflow-y-auto py-2 space-y-1 px-2">
                <MemberRow user={chatCurrentUser} isSelf online />
                {allMembers.map(m => (
                  <MemberRow
                    key={m.id}
                    user={m}
                    online={onlineMembers.some(o => o.id === m.id)}
                    onClick={() => startOrOpenDM(m)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
