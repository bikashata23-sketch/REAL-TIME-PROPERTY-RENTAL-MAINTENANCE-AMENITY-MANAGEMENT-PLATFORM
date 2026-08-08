import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!user || !token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const newSocket = io(import.meta.env.VITE_SOCKET_URL, {
      auth: { token },
    });

    // ---- Real-time event listeners ----
    newSocket.on('maintenance:created', (request) => {
      if (user.role === 'admin') {
        toast(`New maintenance request: ${request.issue?.slice(0, 40)}`, { icon: '🛠️' });
      }
    });

    newSocket.on('maintenance:updated', (request) => {
      if (user.role === 'tenant' && request.tenant?._id === user.id) {
        toast.success(`Your request status changed to "${request.status}"`);
      }
    });

    newSocket.on('booking:created', (booking) => {
      if (user.role === 'admin') {
        toast(`New booking: ${booking.amenity?.name} on ${new Date(booking.date).toLocaleDateString()}`, {
          icon: '📅',
        });
      }
    });

    newSocket.on('booking:cancelled', (booking) => {
      toast(`Booking cancelled: ${booking.amenity?.name}`, { icon: '❌' });
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within a SocketProvider');
  return ctx.socket;
};
