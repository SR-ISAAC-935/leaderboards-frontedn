// src/hooks/useSocket.ts
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'https://apileaderboard.onrender.com';

export function useSocket() {
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        socketRef.current = io(SOCKET_URL, {
            transports: ['websocket'],
        });

        socketRef.current.on('connect', () => {
            console.log('🟢 Socket conectado:', socketRef.current?.id);
        });

        socketRef.current.on('disconnect', () => {
            console.log('🔴 Socket desconectado');
        });

        return () => {
            socketRef.current?.disconnect();
        };
    }, []);

    return socketRef.current;
}