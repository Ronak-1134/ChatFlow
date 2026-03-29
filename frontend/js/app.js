import socket from './socket.js';
import { initAuth } from './auth.js';
import { initRooms, incrementUnread } from './rooms.js';
import { initChat, enableChat, playNotif } from './chat.js';
import { els, setStatus, createMessageEl, formatDate,
         renderUserList, scrollToBottom,
         showEmptyState, clearEmptyState } from './ui.js';

export const state = {
  username: '',
  currentRoom: 'general',
};

const appendMessage = (data) => {
  clearEmptyState(); // ← Clears the empty state UI as soon as a message arrives

  const list   = els.messagesList();
  const prevEl = list.lastElementChild ?? null;
  const el     = createMessageEl(data, prevEl);

  // Date divider
  if (data.ts && !data.system) {
    const prevTs  = parseInt(prevEl?.dataset?.ts ?? 0);
    const prevDay = prevTs ? formatDate(prevTs) : null;
    const currDay = formatDate(data.ts);

    if (prevDay !== currDay) {
      const divider = document.createElement('div');
      divider.className = 'date-divider';
      divider.innerHTML = `<span>${currDay}</span>`;
      list.appendChild(divider);
    }
  }

  list.appendChild(el);
  scrollToBottom();
};

// Tracks who is typing
const typingUsers = new Set();
let typingClearTimers = {};

const renderTyping = () => {
  const el = els.typingIndicator();
  if (typingUsers.size === 0) {
    el.classList.add('hidden');
    return;
  }
  const names = [...typingUsers];
  const label = names.length === 1
    ? `${names[0]} is typing`
    : names.length === 2
    ? `${names[0]} and ${names[1]} are typing`
    : 'Several people are typing';

  el.classList.remove('hidden');
  el.querySelector('.typing-label').textContent = label;
};

const initSocket = async () => {
  await socket.connect();

  socket.on('connected',    () => setStatus(true));
  socket.on('disconnected', () => setStatus(false));

  socket.on('joined', ({ room, users }) => {
    state.currentRoom = room;
    renderUserList(users);
    enableChat();
    showEmptyState(room); // ← Shows the empty state when joining a room
  });

  // Updated message listener with unread and notification logic
  socket.on('message', (data) => {
    appendMessage(data);
    if (!data.self) {
      playNotif();
      incrementUnread(data.room);
    }
  });
  
  socket.on('system',  (data) => appendMessage({ ...data, system: true }));

  socket.on('user_list', ({ users }) => renderUserList(users));

  socket.on('typing', ({ username }) => {
    typingUsers.add(username);
    renderTyping();

    clearTimeout(typingClearTimers[username]);
    typingClearTimers[username] = setTimeout(() => {
      typingUsers.delete(username);
      renderTyping();
    }, 2500);
  });
};

(async () => {
  await initSocket();
  initAuth();
  initRooms();
  initChat();

  // Mobile sidebar toggle
document.querySelector('.chat-header')?.addEventListener('click', (e) => {
  if (window.innerWidth > 680) return;
  document.querySelector('.sidebar').classList.toggle('open');
});
})();