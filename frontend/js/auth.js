import socket from './socket.js';
import { els, showApp, setStatus } from './ui.js';
import { state } from './app.js';
import { enableChat } from './chat.js';

const SESSION_KEY = 'chatflow_user';

const RESERVED = ['admin','system','server','bot'];

const validate = (username) => {
  if (!username)              return 'Username cannot be empty.';
  if (username.length < 2)   return 'At least 2 characters required.';
  if (username.length > 20)  return 'Max 20 characters allowed.';
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Only letters, numbers, underscores.';
  if (RESERVED.includes(username.toLowerCase())) return 'That name is reserved.';
  return null;
};

const showError = (msg) => {
  let err = document.querySelector('.auth-error');
  if (!err) {
    err = document.createElement('p');
    err.className = 'auth-error';
    els.joinBtn().insertAdjacentElement('beforebegin', err);
  }
  err.textContent = msg;
  shake(els.usernameInput());
};

const clearError = () => {
  document.querySelector('.auth-error')?.remove();
};

const shake = (el) => {
  el.classList.remove('shake');
  void el.offsetWidth; // reflow
  el.classList.add('shake');
};

const persistSession = (username) => {
  sessionStorage.setItem(SESSION_KEY, username);
};

const getSession = () => sessionStorage.getItem(SESSION_KEY);

const clearSession = () => sessionStorage.removeItem(SESSION_KEY);

const doJoin = (username) => {
  const error = validate(username);
  if (error) return showError(error);

  clearError();
  state.username = username;
  els.currentUser().textContent = username;
  persistSession(username);

  socket.send({ type: 'join', username, room: state.currentRoom });
  showApp();
};

// Handle socket disconnects — show overlay again
const handleDisconnect = () => {
  clearSession();
  setStatus(false);

  els.app().classList.add('hidden');
  els.authOverlay().classList.remove('hidden');

  showError('Disconnected. Please rejoin.');
  els.usernameInput().value = '';
  state.username = '';
};

export const initAuth = () => {
  const input  = els.usernameInput();
  const btn    = els.joinBtn();

  // Auto-rejoin from session
  const saved = getSession();
  if (saved) {
    input.value = saved;
  }

  const go = () => doJoin(input.value.trim());

  btn.addEventListener('click', go);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });

  // Clear error on type
  input.addEventListener('input', clearError);

  // Disconnect handling
  socket.on('disconnected', handleDisconnect);
};