import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
// Alterado: Importa a função 'getAll' diretamente pelo nome.
import { getAll } from '../services/resourceService';

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
                // Alterado: Chama a função 'getAll' importada diretamente.
                const projectsData = await getAll('projects');
                const eventsData = await getAll('tasks'); 
                const resourcesData = await getAll('resources');

                // Filtra os projetos pelo ID do usuário logado
                const userProjects = projectsData.filter(p => p.userId === user.uid);
                setProjects(userProjects);

                // Filtra os eventos (tarefas) e recursos com base nos projetos do usuário
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
            // Limpa os dados quando o usuário faz logout
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
