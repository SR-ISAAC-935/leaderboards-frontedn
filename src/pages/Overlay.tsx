import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';

const SOCKET_URL = 'https://apileaderboard.onrender.com';
const BASE_URL = 'https://apileaderboard.onrender.com';
const SEASON_ID = 1; // ← cambia según tu temporada activa

type Posicion = {
    club_name: string;
    logotipo: string;
    matches_played: number;
    points: number;
    wins: number;
    draws: number;
    losses: number;
    goals_for: number;
    goals_against: number;
    goal_difference: number;
};

type Partido = {
    id: number;
    equipo_local: string;
    equipo_visitante: string;
    logo_local: string;
    logo_visitante: string;
    home_score: number | null;
    away_score: number | null;
};

export default function Overlay() {
    // Agrega esto junto a los otros useState
const [acumulada, setAcumulada] = useState<Posicion[]>([]);
    const [posiciones, setPosiciones] = useState<Posicion[]>([]);
    const [partidos, setPartidos] = useState<Partido[]>([]);
    const [shake, setShake] = useState(false);
    const [highlighted, setHighlighted] = useState<number | null>(null);
    const socketRef = useRef<Socket | null>(null);
    const prevScores = useRef<Record<number, { home: number | null, away: number | null }>>({});

    // ✅ Cargar posiciones iniciales
    const fetchPosiciones = async () => {
        try {
            const res = await fetch(`${BASE_URL}/leaderboard/positions/${SEASON_ID}`);
            const json = await res.json();
            console.log(json);
            setPosiciones(Array.isArray(json.data) ? json.data : []);
        } catch (e) { console.error(e); }
    };
    const fetchAcumulada = async () => {
    try {
        const res = await fetch(`${BASE_URL}/leaderboard/positions-acumulated`);
        const json = await res.json();
        setAcumulada(Array.isArray(json.data) ? json.data : []);
    } catch (e) { console.error(e); }
};
    useEffect(() => {
        fetchPosiciones();
        fetchAcumulada();
    }, []);

    // ✅ WebSocket
    useEffect(() => {
        socketRef.current = io(SOCKET_URL, {
            transports: ['websocket']
        });

        socketRef.current.on('connect', () => {
            console.log('🟢 Overlay conectado al socket');
        });

        // ✅ Cuando llega un score actualizado
        socketRef.current.on('score_updated', (data: { partidos: Partido[], season_id: number }) => {
            console.log('📡 Score recibido:', data);

            // Detectar qué partido cambió
            data.partidos.forEach((p) => {
                const prev = prevScores.current[p.id];
                const cambio = !prev ||
                    prev.home !== p.home_score ||
                    prev.away !== p.away_score;

                if (cambio) {
                    // Highlight del partido que anotó
                    setHighlighted(p.id);
                    setTimeout(() => setHighlighted(null), 3000);
                }

                // Guardar score actual como previo
                prevScores.current[p.id] = {
                    home: p.home_score,
                    away: p.away_score
                };
            });

            // Actualizar partidos en pantalla
            setPartidos(data.partidos);

            // Shake de tablas
            setShake(true);
            setTimeout(() => setShake(false), 600);

            // Recargar posiciones desde BD
            fetchPosiciones();
            fetchAcumulada();
        });

        return () => {
            socketRef.current?.disconnect();
        };
    }, []);

    // ✅ Color de fila según resultado
    const getRowColor = (club_name: string, partidos: Partido[]) => {
        if (club_name === 'Deportivo Mictlán') return '#1a1a5e'; // highlight especial

        for (const p of partidos) {
            const esLocal = p.equipo_local === club_name;
            const esVisitante = p.equipo_visitante === club_name;
            if (!esLocal && !esVisitante) continue;
            if (p.home_score === null || p.away_score === null) continue;

            if (esLocal) {
                if (p.home_score > p.away_score) return '#1a4a1a'; // verde — ganando
                if (p.home_score < p.away_score) return '#4a1a1a'; // rojo  — perdiendo
                return '#1a3a4a';                                     // celeste — empate
            }
            if (esVisitante) {
                if (p.away_score > p.home_score) return '#1a4a1a';
                if (p.away_score < p.home_score) return '#4a1a1a';
                return '#1a3a4a';
            }
        }
        return 'transparent';
    };

    const shakeVariants = {
        shake: {
            x: [0, -8, 8, -8, 8, -4, 4, 0],
            transition: { duration: 0.6 }
        },
        idle: { x: 0 }
    };

    return (
        <div style={{
            width: '1920px',
            height: '1080px',
            backgroundColor: 'transparent',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: 'Arial, sans-serif',
        }}>

            {/* ═══ IZQUIERDA: TABLAS ═══ */}
            <motion.div
                animate={shake ? 'shake' : 'idle'}
                variants={shakeVariants}
                style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: '800px',
                    height: '600px',
                    display: 'flex',
                }}
            >
                {/* TABLA ROJA — general */}
                <div // Tabla ROJA
                    style={{
                        width: '590px',
                        height: '100%',        // ✅ ocupa todo el padre
                        backgroundColor: 'rgba(120, 0, 0, 0.92)',
                        padding: '8px',
                        boxSizing: 'border-box',  // ✅ agrega esto
                        overflowY: 'auto',        // ✅ scroll si hay mucho contenido
                    }}>
                    <div style={{ color: 'white', fontWeight: 'bold', fontSize: '15px', textAlign: 'center', marginBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.3)', paddingBottom: '4px' }}>
                        TABLA GENERAL
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '15px', color: 'white' }}>
                        <thead>
                            <tr style={{ opacity: 0.7 }}>
                                <th style={{ textAlign: 'left', padding: '5px', fontSize: '15px' }}>#</th>
                                <th style={{ textAlign: 'left', padding: '5px', fontSize: '15px' }}>Club</th>
                                <th style={{ textAlign: 'center', padding: '5px', fontSize: '15px' }}>PJ</th>
                                <th style={{ textAlign: 'center', padding: '5px', fontSize: '15px' }}>G</th>
                                <th style={{ textAlign: 'center', padding: '5px', fontSize: '15px' }}>E</th>
                                <th style={{ textAlign: 'center', padding: '5px', fontSize: '15px' }}>P</th>
                                <th style={{ textAlign: 'center', padding: '5px', fontSize: '15px' }}>Pts</th>
                            </tr>
                        </thead>
                        <tbody>
                            {acumulada.map((p, i) => (
                                <tr key={i} style={{
                                    backgroundColor: getRowColor(p.club_name, partidos),
                                    transition: 'background-color 0.5s ease',
                                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                                    fontSize: '15px'
                                }}>
                                    <td style={{ padding: '3px 2px' }}>{i + 1}</td>
                                    <td style={{ padding: '3px 2px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                            <img src={p.logotipo} alt="" width={20} height={20} style={{ objectFit: 'contain' }} />
                                            <span style={{ fontSize: '19px' }}>{p.club_name}</span>
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '3px 2px', fontSize: '15px' }}>{p.matches_played}</td>
                                    <td style={{ textAlign: 'center', padding: '3px 2px', fontSize: '15px' }}>{p.wins}</td>
                                    <td style={{ textAlign: 'center', padding: '3px 2px', fontSize: '15px' }}>{p.draws}</td>
                                    <td style={{ textAlign: 'center', padding: '3px 2px', fontSize: '15px' }}>{p.losses}</td>
                                    <td style={{ textAlign: 'center', padding: '3px 2px', fontSize: '15px', fontWeight: 'bold' }}>{p.points}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* TABLA VERDE — posiciones actuales */}
                <div style={{
                    width: '600px',
                    height: '100%',        // ✅
                    backgroundColor: 'rgba(0, 100, 0, 0.92)',
                    padding: '8px',
                    boxSizing: 'border-box',  // ✅
                    overflowY: 'auto',        // ✅

                }}>
                    <div style={{ color: 'white', fontWeight: 'bold', fontSize: '15px', textAlign: 'center', marginBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.3)', paddingBottom: '0px' }}>
                        POSICIONES
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '15px', color: 'white' }}>
                        <thead>
                            <tr style={{ opacity: 0.7 }}>
                                <th style={{ textAlign: 'left', padding: '2px', fontSize: '15px' }}>#</th>
                                <th style={{ textAlign: 'left', padding: '2px', fontSize: '15px' }}>Club</th>
                                <th style={{ textAlign: 'center', padding: '2px', fontSize: '15px' }}>GF</th>
                                <th style={{ textAlign: 'center', padding: '2px', fontSize: '15px' }}>GC</th>
                                <th style={{ textAlign: 'center', padding: '2px', fontSize: '15px' }}>DG</th>
                                <th style={{ textAlign: 'center', padding: '2px', fontSize: '15px' }}>Pts</th>
                            </tr>
                        </thead>
                        <tbody>
                            {posiciones.map((p, i) => (
                                <tr key={i} style={{
                                    backgroundColor: getRowColor(p.club_name, partidos),
                                    transition: 'background-color 0.5s ease',
                                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                                }}>
                                    <td style={{ padding: '3px 2px' }}>{i + 1}</td>
                                    <td style={{ padding: '3px 2px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                            <img src={p.logotipo} alt="" width={20} height={20} style={{ objectFit: 'contain' }} />
                                            <span style={{ fontSize: '19px' }}>{p.club_name}</span>
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '3px 2px' }}>{p.goals_for}</td>
                                    <td style={{ textAlign: 'center', padding: '3px 2px' }}>{p.goals_against}</td>
                                    <td style={{ textAlign: 'center', padding: '3px 2px' }}>{p.goal_difference}</td>
                                    <td style={{ textAlign: 'center', padding: '3px 2px', fontWeight: 'bold' }}>{p.points}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* ═══ ABAJO: 5 PARTIDOS ═══ */}
            <motion.div
                animate={shake ? 'shake' : 'idle'}
                variants={shakeVariants}
                style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '100px',
                    right: '50px',
                    height: '220px',
                    backgroundColor: 'rgba(80, 0, 20, 0.92)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-around',
                    padding: '10px 20px',
                    gap: '10px',
                }}
            >
                {partidos.map((partido) => (
                    <AnimatePresence key={partido.id}>
                        <motion.div
                            style={{
                                display: 'flex',
                                flexDirection: 'row',      // ✅ horizontal
                                alignItems: 'center',
                                justifyContent: 'center',
                                flex: 1,
                                backgroundColor: 'rgba(255,255,255,0.05)',
                                borderRadius: '8px',
                                padding: '8px 12px',
                                gap: '8px',
                                border: highlighted === partido.id
                                    ? '2px solid yellow'
                                    : '1px solid rgba(255,255,255,0.1)',
                            }}
                        >
                            {/* LOCAL — logo + nombre */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1, justifyContent: 'flex-end' }}>
                                <span style={{ color: 'white', fontSize: '11px', fontWeight: 'bold', textAlign: 'right' }}>
                                    {partido.equipo_local}
                                </span>
                                <img src={partido.logo_local} alt="" width={28} style={{ objectFit: 'contain' }} />
                            </div>

                            {/* SCORE — centro */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                backgroundColor: 'rgba(0,0,0,0.5)',
                                borderRadius: '6px',
                                padding: '4px 10px',
                                flexShrink: 0,
                            }}>
                                <span style={{ color: 'white', fontSize: '22px', fontWeight: 'bold', minWidth: '20px', textAlign: 'center' }}>
                                    {partido.home_score ?? '-'}
                                </span>
                                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px' }}>:</span>
                                <span style={{ color: 'white', fontSize: '22px', fontWeight: 'bold', minWidth: '20px', textAlign: 'center' }}>
                                    {partido.away_score ?? '-'}
                                </span>
                            </div>

                            {/* VISITANTE — logo + nombre */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1, justifyContent: 'flex-start' }}>
                                <img src={partido.logo_visitante} alt="" width={28} style={{ objectFit: 'contain' }} />
                                <span style={{ color: 'white', fontSize: '11px', fontWeight: 'bold' }}>
                                    {partido.equipo_visitante}
                                </span>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                ))}
            </motion.div>
        </div>
    );
}
