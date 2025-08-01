import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
// Corrigido: Importa o objeto de serviço como um todo (exportação padrão).
import resourceService from '../services/resourceService';

const DataContext = createContext();

export const useData = () => {
    return useContext(DataContext);
};

export const DataProvider = ({ children }) => {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [events, setEvents] = useState([]);
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const subscribeToData = useCallback(async () => {
        if (user) {
            setLoading(true);
            setError(null);
            try {
                // Corrigido: Chama a função 'getAll' a partir do objeto de serviço importado.
                const projectsData = await resourceService.getAll('projects');
                const eventsData = await resourceService.getAll('tasks'); 
                const resourcesData = await resourceService.getAll('resources');

                const userProjects = projectsData.filter(p => p.userId === user.uid);
                setProjects(userProjects);

                const userProjectIds = userProjects.map(p => p.id);
                setEvents(eventsData.filter(e => userProjectIds.includes(e.projectId)));
                setResources(resourcesData.filter(r => userProjectIds.includes(r.projectId)));

            } catch (error) {
                console.error("Falha ao carregar os dados:", error);
                setError(error);
            } finally {
                setLoading(false);
            }
        } else {
            setProjects([]);
            setEvents([]);
            setResources([]);
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        subscribeToData();
    }, [subscribeToData]);

    const refreshData = () => {
        subscribeToData();
    };

    const contextValue = {
        projects,
        events,
        resources,
        loading,
        error,
        refreshData
    };

    return (
        <DataContext.Provider value={contextValue}>
            {children}
        </DataContext.Provider>
    );
};

export default DataContext;
