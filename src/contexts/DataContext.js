// src/contexts/DataContext.js
import React, { useState, useEffect, createContext, useContext, useMemo } from 'react';
import { subHours, isBefore, parseISO } from 'date-fns';
import eventService from '../services/eventService';
import resourceService from '../services/resourceService';
import { useAuth } from './AuthContext';

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const { user } = useAuth();
    const [rawEvents, setRawEvents] = useState([]);
    const [allEquipment, setAllEquipment] = useState([]);
    const [allProfessionals, setAllProfessionals] = useState([]);
    const [allClients, setAllClients] = useState([]);
    const [allSkills, setAllSkills] = useState([]);
    const [allDocks, setAllDocks] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user) {
            setLoading(true);
            setError(null);
            
            const unsubscribes = [];
            try {
                // Correção: Usar o serviço específico de eventos para buscar eventos
                unsubscribes.push(eventService.get(setRawEvents));
                unsubscribes.push(resourceService.get('equipment', setAllEquipment));
                unsubscribes.push(resourceService.get('professionals', setAllProfessionals));
                unsubscribes.push(resourceService.get('clients', setAllClients));
                unsubscribes.push(resourceService.get('skills', setAllSkills));
                unsubscribes.push(resourceService.get('docks', setAllDocks));
                unsubscribes.push(resourceService.get('products', setAllProducts));
                unsubscribes.push(resourceService.get('users', setAllUsers));

                // Simplificação: consideramos 'carregado' após iniciar os listeners.
                setLoading(false);

            } catch (e) {
                console.error("Falha ao subscrever aos dados:", e);
                setError(e);
                setLoading(false);
            }

            return () => {
                unsubscribes.forEach(unsub => unsub());
            };
        } else {
            setRawEvents([]);
            setAllEquipment([]);
            setAllProfessionals([]);
            setAllClients([]);
            setAllSkills([]);
            setAllDocks([]);
            setAllProducts([]);
            setAllUsers([]);
            setLoading(false);
            setError(null);
        }
    }, [user]);

    // Deriva o estado dos eventos, aplicando a nova regra de negócio
    const events = useMemo(() => {
        const now = new Date();
        const threshold = subHours(now, 48);

        return rawEvents.map(event => {
            // A regra aplica-se apenas a eventos padrão, não a indisponibilidades, etc.
            if (event.type !== 'Evento Padrão') {
                return event;
            }

            const eventEnd = parseISO(event.end);
            
            // REGRA: Se o evento terminou há mais de 48h e não está 'Confirmado' ou 'Cancelado',
            // forçamos o status para 'Cancelado' na visualização.
            if (
                isBefore(eventEnd, threshold) &&
                event.status !== 'Confirmado' &&
                event.status !== 'Cancelado'
            ) {
                // Retorna um novo objeto de evento com o status modificado e uma flag
                return { ...event, status: 'Cancelado', autoCancelled: true };
            }
            return event;
        });
    }, [rawEvents]);

    const value = {
        events,
        allEquipment,
        allProfessionals,
        allClients,
        allSkills,
        allDocks,
        allProducts,
        allUsers,
        loading,
        error,
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
    return useContext(DataContext);
};