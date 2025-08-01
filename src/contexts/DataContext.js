import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import resourceService from '../services/resourceService';

const DataContext = createContext();

export const useData = () => {
    return useContext(DataContext);
};

export const DataProvider = ({ children }) => {
    const { user } = useAuth();
    // Estados para todas as coleções de dados da aplicação
    const [projects, setProjects] = useState([]);
    const [events, setEvents] = useState([]);
    const [resources, setResources] = useState([]);
    const [clients, setClients] = useState([]);
    const [docks, setDocks] = useState([]);
    const [professionals, setProfessionals] = useState([]);
    const [equipment, setEquipment] = useState([]);
    const [products, setProducts] = useState([]);
    const [skills, setSkills] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const subscribeToData = useCallback(async () => {
        if (user) {
            setLoading(true);
            setError(null);
            try {
                // Carrega todas as coleções de dados em paralelo para máxima eficiência
                const [
                    projectsData, 
                    eventsData, 
                    resourcesData, 
                    clientsData,
                    docksData,
                    professionalsData,
                    equipmentData,
                    productsData,
                    skillsData
                ] = await Promise.all([
                    resourceService.getAll('projects'),
                    resourceService.getAll('tasks'),
                    resourceService.getAll('resources'),
                    resourceService.getAll('clients'),
                    resourceService.getAll('docks'),
                    resourceService.getAll('professionals'),
                    resourceService.getAll('equipment'),
                    resourceService.getAll('products'),
                    resourceService.getAll('skills')
                ]);

                // Filtra os projetos que pertencem ao utilizador logado
                const userProjects = projectsData.filter(p => p.userId === user.uid);
                setProjects(userProjects);

                const userProjectIds = userProjects.map(p => p.id);

                // Filtra os dados que estão diretamente ligados a um projeto
                setEvents(eventsData.filter(e => userProjectIds.includes(e.projectId)));
                setResources(resourcesData.filter(r => userProjectIds.includes(r.projectId)));
                setClients(clientsData.filter(c => userProjectIds.includes(c.projectId)));
                
                // Define os dados globais (não filtrados por projeto)
                setDocks(docksData);
                setProfessionals(professionalsData);
                setEquipment(equipmentData);
                setProducts(productsData);
                setSkills(skillsData);

            } catch (error) {
                console.error("Falha ao carregar os dados:", error);
                setError(error);
            } finally {
                setLoading(false);
            }
        } else {
            // Limpa todos os dados quando o utilizador faz logout
            setProjects([]);
            setEvents([]);
            setResources([]);
            setClients([]);
            setDocks([]);
            setProfessionals([]);
            setEquipment([]);
            setProducts([]);
            setSkills([]);
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        subscribeToData();
    }, [subscribeToData]);

    const refreshData = () => {
        subscribeToData();
    };

    // Disponibiliza todos os dados para o resto da aplicação
    const contextValue = {
        projects,
        events,
        resources,
        clients,
        docks,
        professionals,
        equipment,
        products,
        skills,
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
