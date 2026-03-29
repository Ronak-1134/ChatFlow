const rooms = {
  general: { name: 'general', desc: 'Welcome to general chat', users: new Map() },
  tech:    { name: 'tech',    desc: 'Tech talk & dev stuff',   users: new Map() },
  random:  { name: 'random',  desc: 'Anything goes here',      users: new Map() },
  design:  { name: 'design',  desc: 'UI/UX & design chat',     users: new Map() },
};

const getUsersInRoom = (room) =>
  [...(rooms[room]?.users.values() ?? [])].map(u => u.username);

const joinRoom = (ws, room, username) => {
  leaveAllRooms(ws);
  if (!rooms[room]) return false;
  rooms[room].users.set(ws, { username });
  ws.currentRoom = room;
  ws.username = username;
  return true;
};

const leaveAllRooms = (ws) => {
  for (const room of Object.values(rooms)) {
    room.users.delete(ws);
  }
};

const broadcastToRoom = (room, payload, excludeWs = null) => {
  const data = JSON.stringify(payload);
  rooms[room]?.users.forEach((_, ws) => {
    if (ws !== excludeWs && ws.readyState === 1) ws.send(data);
  });
};

const broadcastAll = (room, payload) => broadcastToRoom(room, payload);

module.exports = { rooms, joinRoom, leaveAllRooms, broadcastToRoom, broadcastAll, getUsersInRoom };