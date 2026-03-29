import socket from './socket.js';
import { els } from './ui.js';
import { state } from './app.js';

// State tracking for unread messages
const unreadCounts = {};

const ROOM_META = {
  general: 'Welcome to general chat',
  tech:    'Tech talk & dev stuff',
  random:  'Anything goes here',
  design:  'UI/UX & design chat',
};

const setActiveRoom = (room) => {
  // Update sidebar highlight
  els.roomList().querySelectorAll('.room-item').forEach(el => {
    el.classList.toggle('active', el.dataset.room === room);
  });

  // Update header
  els.chatRoomName().textContent  = `# ${room}`;
  els.chatRoomDesc().textContent  = ROOM_META[room] ?? '';
  els.messageInput().placeholder  = `Message #${room}...`;
};

const clearMessages = () => {
  els.messagesList().innerHTML = '';
  els.typingIndicator().classList.add('hidden');
};

const renderUnread = (room) => {
  const item = els.roomList().querySelector(`[data-room="${room}"]`);
  if (!item) return;
  
  let badge = item.querySelector('.unread-badge');
  const count = unreadCounts[room] ?? 0;

  if (count === 0) { 
    badge?.remove(); 
    return; 
  }
  
  if (!badge) {
    badge = document.createElement('span');
    badge.className = 'unread-badge';
    item.appendChild(badge);
  }
  
  badge.textContent = count > 99 ? '99+' : count;
};

export const incrementUnread = (room) => {
  if (room === state.currentRoom) return;
  unreadCounts[room] = (unreadCounts[room] ?? 0) + 1;
  renderUnread(room);
};

export const clearUnread = (room) => {
  unreadCounts[room] = 0;
  renderUnread(room);
};

export const switchRoom = (room) => {
  if (room === state.currentRoom) return;

  socket.send({ type: 'switch_room', room });
  state.currentRoom = room;

  clearMessages();
  setActiveRoom(room);
  clearUnread(room); // ← Added to clear badges on entry
};

export const initRooms = () => {
  // Sync UI to default room on load
  setActiveRoom(state.currentRoom);

  els.roomList().addEventListener('click', (e) => {
    const item = e.target.closest('.room-item');
    if (!item) return;
    switchRoom(item.dataset.room);
  });
};