// src/components/management/SettingsView.js
import React, { useState } from 'react';
import UserManagement from './UserManagement';
import SkillsManagement from './SkillsManagement';
import EquipmentView from './EquipmentView';
import DocksManagement from './DocksManagement';

const SettingsView = ({ onOpenUserModal, onOpenResourceModal, onSetUnavailability }) => {
    const [activeTab, setActiveTab] = useState('users');

    const renderContent = () => {
        switch(activeTab) {
            case 'users':
                return <UserManagement onOpenUserModal={onOpenUserModal} />;
            case 'skills':
                return <SkillsManagement />;
            case 'equipment':
                return <EquipmentView onEdit={onOpenResourceModal} onSetUnavailability={onSetUnavailability} />;
            case 'docks':
                return <DocksManagement />;
            default:
                return null;
        }
    };

    const TabButton = ({ tabId, label }) => (
        <button
            onClick={() => setActiveTab(tabId)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2
                ${activeTab === tabId 
                    ? 'border-indigo-500 text-indigo-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`
                }
        >
            {label}
        </button>
    );

    return (
        <div className="p-6">
            <h3 className="text-xl font-bold mb-4">Configurações</h3>
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <TabButton tabId="users" label="Utilizadores" />
                    <TabButton tabId="skills" label="Habilidades" />
                    <TabButton tabId="equipment" label="Equipamentos" />
                    <TabButton tabId="docks" label="Pontos de Embarque" />
                </nav>
            </div>
            
            <div className="mt-6">
                {renderContent()}
            </div>
        </div>
    );
};

export default SettingsView;