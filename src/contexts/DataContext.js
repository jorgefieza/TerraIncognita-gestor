// src/contexts/DataContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import resourceService from '../services/resourceService';
import { checkAndCancelOldEvents } from '../utils/eventStatusUpdater';

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
            // Limpa todos os estados se o utilizador fizer logout
            const setters = [setEvents, setClients, setDocks, setProfessionals, setEquipment, setProducts, setSkills, setUsers, setUnavailabilities];
            setters.forEach(setter => setter([]));
            setLoading(false);
            return;
        }

        setLoading(true);

        const collectionsToSubscribe = {
            events: (data) => {
                // **FUNCIONALIDADE ADICIONADA: VERIFICADOR DE STATUS**
                // Executa a verificação de cancelamento automático antes de definir os dados.
                if (user) {
                    checkAndCancelOldEvents(data, user);
                }

                setEvents(data);
                const unavs = data.filter(e => e.type === 'Indisponibilidade');
                setUnavailabilities(unavs);
            },
            clients: setClients,
            docks: setDocks,
            professionals: setProfessionals,
            equipment: setEquipment,
            products: setProducts,
            skills: setSkills,
            users: setUsers,
        };

        const unsubscribes = Object.entries(collectionsToSubscribe).map(([collectionName, setter]) => {
            return resourceService.get(collectionName, (data, err) => {
                if (err) {
                    console.error(`Erro ao carregar ${collectionName}:`, err);
                    setError(err);
                    return;
                }
                setter(data);
                setDataVersion(v => v + 1);
            });
        });
        
        setLoading(false);

        return () => {
            unsubscribes.forEach(unsubscribe => unsubscribe());
        };
    }, [user]);
    
    const refreshData = useCallback(() => {}, []);

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