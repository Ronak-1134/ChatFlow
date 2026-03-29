const {
  joinRoom, leaveAllRooms,
  broadcastToRoom, getUsersInRoom
} = require('./roomManager');

const send = (ws, payload) => {
  if (ws.readyState === 1) ws.send(JSON.stringify(payload));
};

const broadcastUserList = (room) => {
  const users = getUsersInRoom(room);
  broadcastToRoom(room, { type: 'user_list', room, users });
};

module.exports = (ws) => {

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }

    switch (msg.type) {

      case 'join': {
        const { username, room } = msg;
        if (!username?.trim() || !room) return;

        const success = joinRoom(ws, room, username.trim());
        if (!success) return send(ws, { type: 'error', text: 'Room not found' });

        // Confirm join to sender
        send(ws, {
          type: 'joined',
          room,
          username: ws.username,
          users: getUsersInRoom(room)
        });

        // Notify others
        broadcastToRoom(room, {
          type: 'system',
          text: `${ws.username} joined #${room}`
        }, ws);

        broadcastUserList(room);
        break;
      }

      case 'message': {
        const { text } = msg;
        if (!text?.trim() || !ws.currentRoom) return;

        const payload = {
          type: 'message',
          username: ws.username,
          text: text.trim(),
          room: ws.currentRoom,
          ts: Date.now()
        };

        // Echo back to sender + broadcast
        send(ws, { ...payload, self: true });
        broadcastToRoom(ws.currentRoom, payload, ws);
        break;
      }

      case 'switch_room': {
        const { room } = msg;
        if (!room || !ws.username) return;

        const prevRoom = ws.currentRoom;

        // Notify old room
        if (prevRoom) {
          broadcastToRoom(prevRoom, {
            type: 'system',
            text: `${ws.username} left #${prevRoom}`
          }, ws);
        }

        const success = joinRoom(ws, room, ws.username);
        if (!success) return send(ws, { type: 'error', text: 'Room not found' });

        send(ws, {
          type: 'joined',
          room,
          username: ws.username,
          users: getUsersInRoom(room)
        });

        broadcastToRoom(room, {
          type: 'system',
          text: `${ws.username} joined #${room}`
        }, ws);

        if (prevRoom) broadcastUserList(prevRoom);
        broadcastUserList(room);
        break;
      }

      case 'typing': {
        if (!ws.currentRoom) return;
        broadcastToRoom(ws.currentRoom, {
          type: 'typing',
          username: ws.username
        }, ws);
        break;
      }
    }
  });

  ws.on('close', () => {
    const room = ws.currentRoom;
    if (room) {
      leaveAllRooms(ws);
      broadcastToRoom(room, {
        type: 'system',
        text: `${ws.username} left the chat`
      });
      // Rebuild user list after removal
      const { getUsersInRoom, broadcastToRoom: bcast } = require('./roomManager');
      bcast(room, { type: 'user_list', room, users: getUsersInRoom(room) });
    }
  });
};