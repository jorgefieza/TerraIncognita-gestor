// src/contexts/DataContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import eventService from '../services/eventService';
import resourceService from '../services/resourceService';

const DataContext = createContext();

export const useData = () => {
    return useContext(DataContext);
};

export const DataProvider = ({ children }) => {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [clients, setClients] = useState([]);
    const [docks, setDocks] = useState([]);
    const [professionals, setProfessionals] = useState([]);
    const [equipment, setEquipment] = useState([]);
    const [products, setProducts] = useState([]);
    const [skills, setSkills] = useState([]);
    const [users, setUsers] = useState([]);
    const [unavailabilities, setUnavailabilities] = useState([]);
    const [dataVersion, setDataVersion] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user) {
            setEvents([]);
            setClients([]);
            setDocks([]);
            setProfessionals([]);
            setEquipment([]);
            setProducts([]);
            setSkills([]);
            setUsers([]);
            setUnavailabilities([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        
        // ===== CORREÇÃO APLICADA AQUI =====
        // A chamada a `eventService.get` agora recebe apenas um argumento (o callback), como esperado.
        const unsubscribeEvents = eventService.get((eventsData, err) => {
            if (err) {
                console.error("Erro ao carregar eventos:", err);
                setError(err);
                return;
            }
            setEvents(eventsData);
            const unavs = eventsData.filter(e => e.type === 'Indisponibilidade');
            setUnavailabilities(unavs);
            setDataVersion(v => v + 1);
        });

        const fetchStaticData = async () => {
            try {
                const [
                    clientsData,
                    docksData,
                    professionalsData,
                    equipmentData,
                    productsData,
                    skillsData,
                    usersData
                ] = await Promise.all([
                    resourceService.getAll('clients'),
                    resourceService.getAll('docks'),
                    resourceService.getAll('professionals'),
                    resourceService.getAll('equipment'),
                    resourceService.getAll('products'),
                    resourceService.getAll('skills'),
                    resourceService.getAll('users')
                ]);

                setClients(clientsData);
                setDocks(docksData);
                setProfessionals(professionalsData);
                setEquipment(equipmentData);
                setProducts(productsData);
                setSkills(skillsData);
                setUsers(usersData);
                
            } catch (err) {
                console.error("Falha ao carregar dados estáticos:", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchStaticData();

        return () => {
            unsubscribeEvents();
        };
    }, [user]);
    
    const refreshData = useCallback(() => {
       // A lógica pode ser adicionada aqui se houver um caso de uso para isso.
    }, []);

    const contextValue = {
        events,
        unavailabilities,
        allClients: clients,
        allDocks: docks,
        allProfessionals: professionals,
        allEquipment: equipment,
        allProducts: products,
        allSkills: skills,
        allUsers: users,
        loading,
        error,
        refreshData,
        dataVersion
    };

    return (
        <DataContext.Provider value={contextValue}>
            {children}
        </DataContext.Provider>
    );
};