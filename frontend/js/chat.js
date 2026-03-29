import socket from './socket.js';
import { els } from './ui.js';
import { state } from './app.js';

let typingTimeout = null;

// Tiny beep via Web Audio API — no file needed
const playNotif = () => {
  try {
    const ctx  = new (window.AudioContext || window.webkitAudioContext)();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.start(); 
    osc.stop(ctx.currentTime + 0.25);
  } catch (e) {
    console.warn("AudioContext not supported or blocked by browser policy", e);
  }
};

const sendMessage = () => {
  const input = els.messageInput();
  const text  = input.value.trim();
  if (!text || !state.username) return;
  
  socket.send({ type: 'message', text });
  
  input.value = '';
  input.focus();
  stopTyping();
};

// Typing indicator — throttled emit
const onTyping = () => {
  if (!state.username) return;
  socket.send({ type: 'typing' });
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(stopTyping, 2000);
};

const stopTyping = () => {
  clearTimeout(typingTimeout);
  typingTimeout = null;
};

export const initChat = () => {
  const input  = els.messageInput();
  const sendBtn = els.sendBtn();

  // Send on Enter (Shift+Enter = newline not needed in single-line input)
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Typing indicator emit
  input.addEventListener('input', onTyping);

  // Send button click
  sendBtn.addEventListener('click', sendMessage);

  // Disable input until authenticated
  input.disabled  = true;
  sendBtn.disabled = true;
};

// Called from app.js after join confirmed
export const enableChat = () => {
  els.messageInput().disabled  = false;
  els.sendBtn().disabled       = false;
  els.messageInput().focus();
};

export { playNotif };