// src/contexts/AuthContext.js
import React, { useState, createContext, useContext } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState('diretor');
    const [department, setDepartment] = useState('Turismo');
    const [authReady, setAuthReady] = useState(true);
    const [appScreen, setAppScreen] = useState('login');

    const login = (selectedRole) => {
        const roleToSet = selectedRole || 'diretor';
        setRole(roleToSet);
        const mockUser = { name: `${roleToSet.charAt(0).toUpperCase() + roleToSet.slice(1)} Principal`, email: `${roleToSet}@exemplo.com`, role: roleToSet };
        setUser(mockUser);
        if (roleToSet === 'coordenador') setDepartment('Comercial');
        else if (roleToSet === 'colaborador') setDepartment('Escola');
        else setDepartment('Turismo');
        setAppScreen('calendar');
    };

    const logout = () => { setUser(null); setAppScreen('login'); };

    const permissions = {
        canViewDailyPlan: true,
        canManageClients: role === 'diretor' || role === 'coordenador',
        canManageProducts: role === 'diretor' || role === 'coordenador',
        canManageResources: role === 'diretor' || role === 'coordenador',
        canViewReports: role === 'diretor',
        canAccessSettings: role === 'diretor',
        canEditResources: role === 'diretor',
        canSetCustomCosts: role === 'diretor',
        canCreateEvent: role !== 'colaborador',
        canEditEvent: (user, event) => role !== 'colaborador' && event?.status !== 'Cancelado',
        
        // ===== NOVAS REGRAS DE CANCELAR/EXCLUIR =====
        canCancelEvent: (user, event) => role !== 'colaborador', // Coordenadores e Diretores podem cancelar
        canDeleteEvent: role === 'diretor', // Apenas Diretores podem excluir permanentemente
        
        canViewAllDepartments: role === 'diretor'
    };

    const value = { user, role, department, authReady, appScreen, login, logout, setAppScreen, permissions };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    return useContext(AuthContext);
};