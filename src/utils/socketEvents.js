// Socket.io events utility for organizing socket events
export const SocketEvents = {
  // Order events
  ORDER_NEW: 'order:new',
  ORDER_UPDATED: 'order:updated',
  ORDER_DELETED: 'order:deleted',
  ORDER_STATUS_CHANGED: 'order:status_changed',
  
  // Product events
  PRODUCT_NEW: 'product:new',
  PRODUCT_UPDATED: 'product:updated',
  PRODUCT_DELETED: 'product:deleted',
  PRODUCT_STOCK_UPDATED: 'product:stock_updated',
  
  // Marketer events
  MARKETER_NEW: 'marketer:new',
  MARKETER_UPDATED: 'marketer:updated',
  MARKETER_DELETED: 'marketer:deleted',
  
  // Mandobe events
  MANDOBE_NEW: 'mandobe:new',
  MANDOBE_UPDATED: 'mandobe:updated',
  MANDOBE_DELETED: 'mandobe:deleted',
  
  // Supplier events
  SUPPLIER_NEW: 'supplier:new',
  SUPPLIER_UPDATED: 'supplier:updated',
  SUPPLIER_DELETED: 'supplier:deleted',
  
  // Vault events
  VAULT_TRANSACTION: 'vault:transaction',
  VAULT_BALANCE_UPDATED: 'vault:balance_updated',
  
  // User events
  USER_LOGIN: 'user:login',
  USER_LOGOUT: 'user:logout',
  
  // General events
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  ERROR: 'error'
};

// Helper function to emit events with consistent format
export const emitEvent = (io, event, data, room = null) => {
  const payload = {
    ...data,
    timestamp: new Date().toISOString()
  };
  
  if (room) {
    io.to(room).emit(event, payload);
  } else {
    io.emit(event, payload);
  }
};

// Helper function to join user to their role-based room
export const joinUserToRoom = (socket, user) => {
  socket.join(`role:${user.role}`);
  socket.join(`user:${user.sub}`);
  
  if (user.role === 'admin') {
    socket.join('admin');
  }
};

// Helper function to leave user rooms
export const leaveUserRooms = (socket, user) => {
  socket.leave(`role:${user.role}`);
  socket.leave(`user:${user.sub}`);
  
  if (user.role === 'admin') {
    socket.leave('admin');
  }
};

