// src/App.js
import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import AuthModule from './components/auth/AuthModule';
import { UIProvider } from './contexts/UIContext';
import CoreAppModule from './components/core/CoreAppModule';

const AppContent = () => {
    const { authReady, appScreen } = useAuth();

    if (!authReady) {
        return <div className="flex justify-center items-center h-screen bg-gray-100"><div className="text-lg font-medium text-gray-600">A autenticar...</div></div>;
    }

    if (appScreen === 'login') {
        return <AuthModule />;
    }

    if (appScreen === 'calendar') {
        return (
            <UIProvider>
                <CoreAppModule />
            </UIProvider>
        );
    }

    return <div>Erro de Roteamento</div>;
}

export default function App() {
    return (
        <AuthProvider>
            <DataProvider>
                <AppContent />
            </DataProvider>
        </AuthProvider>
    );
}