// Cached DOM refs
export const $ = (id) => document.getElementById(id);

export const els = {
  app:            () => $('app'),
  authOverlay:    () => $('auth-overlay'),
  usernameInput:  () => $('username-input'),
  joinBtn:        () => $('join-btn'),
  messagesList:   () => $('messages-list'),
  messagesContainer: () => $('messages-container'),
  messageInput:   () => $('message-input'),
  sendBtn:        () => $('send-btn'),
  roomList:       () => $('room-list'),
  userList:       () => $('user-list'),
  currentUser:    () => $('current-user'),
  chatRoomName:   () => $('chat-room-name'),
  chatRoomDesc:   () => $('chat-room-desc'),
  memberCount:    () => $('member-count'),
  statusDot:      () => $('connection-status'),
  statusLabel:    () => $('status-label'),
  typingIndicator:() => $('typing-indicator'),
};

// String escape helper (Moved up for safety)
const escHtml = (str) =>
  str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

// --- Timestamp Helpers ---
const formatTime = (ts) =>
  new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const formatDate = (ts) => {
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString())     return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const shouldGroup = (prev, curr) => {
  if (!prev) return false;
  const sameUser = prev.dataset.username === curr.username;
  const within2Min = curr.ts - parseInt(prev.dataset.ts) < 2 * 60 * 1000;
  return sameUser && within2Min && !curr.system;
};

// Avatar color pool
const COLORS = [
  ['#7c6af7','#2d2860'], ['#3dd68c','#0f3626'], ['#f25f5c','#3b1212'],
  ['#f7b26a','#3b2510'], ['#6ab8f7','#0e2a3b'], ['#c96af7','#2d1060'],
];

export const getAvatarStyle = (username) => {
  const i = username.charCodeAt(0) % COLORS.length;
  return `background:${COLORS[i][1]};color:${COLORS[i][0]};`;
};

export const setStatus = (online) => {
  const dot   = els.statusDot();
  const label = els.statusLabel();
  dot.className   = `status-dot ${online ? 'online' : 'offline'}`;
  label.textContent = online ? 'Connected' : 'Disconnected';
};

export const scrollToBottom = () => {
  const c = els.messagesContainer();
  c.scrollTop = c.scrollHeight;
};

export const showApp = () => {
  els.authOverlay().classList.add('hidden');
  els.app().classList.remove('hidden');
};

// --- Empty State UI ---
export const showEmptyState = (room) => {
  const list = els.messagesList();
  list.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">💬</div>
      <p class="empty-title">Welcome to #${room}</p>
      <p class="empty-sub">Be the first to say something!</p>
    </div>`;
};

export const clearEmptyState = () => {
  document.querySelector('.empty-state')?.remove();
};

// Build a message node
export const createMessageEl = (data, prevEl = null) => {
  const { username, text, ts, self, system } = data;
  const el = document.createElement('div');

  if (system) {
    el.className = 'message system';
    el.innerHTML = `<span class="message-text">${escHtml(text)}</span>`;
    return el;
  }

  const grouped = shouldGroup(prevEl, data);
  const initials = username.slice(0, 2).toUpperCase();
  const time = ts ? formatTime(ts) : '';

  el.className = `message${grouped ? ' grouped' : ''}`;
  el.dataset.username = username;
  el.dataset.ts = ts ?? Date.now();

  if (grouped) {
    el.innerHTML = `
      <div class="message-avatar-gap"></div>
      <div class="message-body">
        <div class="message-text">
          ${escHtml(text)}
          <span class="message-time inline-time">${time}</span>
        </div>
      </div>`;
  } else {
    el.innerHTML = `
      <div class="message-avatar" style="${getAvatarStyle(username)}">${initials}</div>
      <div class="message-body">
        <div class="message-meta">
          <span class="message-author${self ? ' is-self' : ''}">${escHtml(username)}</span>
          <span class="message-time">${time}</span>
        </div>
        <div class="message-text">${escHtml(text)}</div>
      </div>`;
  }
  return el;
};

export const renderUserList = (users) => {
  const list = els.userList();
  list.innerHTML = users.map(u => `
    <li class="user-list-item">
      <span class="dot"></span>${escHtml(u)}
    </li>`).join('');
  els.memberCount().textContent = `${users.length} online`;
};

export { formatDate };