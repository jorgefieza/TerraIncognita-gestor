// src/components/core/ManagementPanel.js
import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useUI } from '../../contexts/UIContext';
import useClickOutside from '../../utils/useClickOutside';
import { NewspaperIcon, UsersIcon, BriefcaseIcon, CubeIcon, ChartBarIcon, WrenchScrewdriverIcon, LogoutIcon } from './Icons';
import ProfessionalsView from '../management/ProfessionalsView';
import ResourceEditModal from '../management/ResourceEditModal';
import ClientsView from '../management/ClientsView';
import ClientEditModal from '../management/ClientEditModal';
import SettingsView from '../management/SettingsView';
import ReportsView from '../reports/ReportsView';
import ProductsView from '../management/ProductsView';
import ProductEditModal from '../management/ProductEditModal';
import UserEditModal from '../management/UserEditModal';
import UnavailabilityModal from '../management/UnavailabilityModal';
import DailyPlanView from '../management/DailyPlanView';

const ManagementPanel = () => {
    const { logout, permissions } = useAuth();
    const { isManagementPanelOpen, setManagementPanelOpen, departmentFilter, setDepartmentFilter } = useUI();
    const [activeTab, setActiveTab] = useState('plan');
    
    const [editingResource, setEditingResource] = useState(null);
    const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [unavailabilityResource, setUnavailabilityResource] = useState(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const filterRef = useRef(null);
    useClickOutside(filterRef, () => setIsFilterOpen(false));

    const departments = ['Turismo', 'Comercial', 'Escola'];

    const handleFilterChange = (dept) => {
        setDepartmentFilter(prev => {
            const newFilter = new Set(prev);
            if (newFilter.has(dept)) newFilter.delete(dept);
            else newFilter.add(dept);
            return newFilter;
        });
    };
    
    // ===== CORREÇÃO DA FUNÇÃO =====
    // Agora, a função aceita um único objeto `resource` que já contém o `resourceType`.
    const handleOpenResourceModal = (resource) => {
        setEditingResource(resource);
        setIsResourceModalOpen(true);
    };

    const handleCloseResourceModal = () => {
        setIsResourceModalOpen(false);
        setEditingResource(null);
    };
    // =============================

    const handleOpenClientModal = (client) => { setEditingClient(client); setIsClientModalOpen(true); };
    const handleCloseClientModal = () => { setIsClientModalOpen(false); setEditingClient(null); };
    const handleOpenProductModal = (product) => { setEditingProduct(product); setIsProductModalOpen(true); };
    const handleCloseProductModal = () => { setIsProductModalOpen(false); setEditingProduct(null); };
    const handleOpenUserModal = (user) => { setEditingUser(user); setIsUserModalOpen(true); };
    const handleCloseUserModal = () => { setIsUserModalOpen(false); setEditingUser(null); };
    const handleOpenUnavailabilityModal = (resource) => setUnavailabilityResource(resource);
    const handleCloseUnavailabilityModal = () => setUnavailabilityResource(null);

    const renderContent = () => {
        switch (activeTab) {
            case 'plan': return <DailyPlanView />;
            case 'professionals': return permissions.canManageResources ? <ProfessionalsView onEdit={handleOpenResourceModal} onSetUnavailability={handleOpenUnavailabilityModal} /> : null;
            case 'clients': return permissions.canManageClients ? <ClientsView onEditClient={handleOpenClientModal} /> : null;
            case 'products': return permissions.canManageProducts ? <ProductsView onEditProduct={handleOpenProductModal} /> : null;
            case 'settings': return permissions.canAccessSettings ? <SettingsView onOpenUserModal={handleOpenUserModal} onOpenResourceModal={handleOpenResourceModal} onSetUnavailability={handleOpenUnavailabilityModal} /> : null;
            case 'reports': return permissions.canViewReports ? <ReportsView /> : null;
            default: return <div className="p-6"><h3 className="text-xl font-bold">Em construção...</h3></div>;
        }
    };
    
    const NavButton = ({ tabId, label, icon: Icon, permission }) => {
        if (!permission) return null;
        return (
            <button 
                onClick={() => setActiveTab(tabId)}
                className={`flex items-center p-3 rounded-md text-left w-full font-medium transition-colors duration-150 ${activeTab === tabId ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
            >
                <Icon className="w-5 h-5 mr-3" />
                <span>{label}</span>
            </button>
        );
    };

    const SectionTitle = ({ title }) => (
        <h4 className="px-3 pt-4 pb-2 text-xs font-bold uppercase text-gray-500">{title}</h4>
    );

    return (
        <>
            <div className={`fixed top-0 right-0 h-full w-full md:w-3/4 lg:w-2/3 bg-gray-50 shadow-2xl z-30 transform transition-transform duration-300 ease-in-out ${isManagementPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex h-full">
                    <div className="w-64 bg-gray-800 text-white p-4 flex flex-col">
                        <h2 className="text-xl font-semibold mb-4 px-2">Painel de Gestão</h2>
                        <nav className="flex flex-col flex-grow">
                            <SectionTitle title="Navegação" />
                            <NavButton tabId="plan" label="Plano do Dia" icon={NewspaperIcon} permission={permissions.canViewDailyPlan} />

                            <SectionTitle title="Gestão" />
                            <NavButton tabId="clients" label="Clientes" icon={BriefcaseIcon} permission={permissions.canManageClients} />
                            <NavButton tabId="products" label="Produtos" icon={CubeIcon} permission={permissions.canManageProducts} />
                            <NavButton tabId="professionals" label="Profissionais" icon={UsersIcon} permission={permissions.canManageResources} />

                            <SectionTitle title="Administração" />
                            <NavButton tabId="reports" label="Relatórios" icon={ChartBarIcon} permission={permissions.canViewReports} />
                            <NavButton tabId="settings" label="Ajustes" icon={WrenchScrewdriverIcon} permission={permissions.canAccessSettings} />

                            {permissions.canViewAllDepartments && (
                                <div className="mt-4 p-3 border-t border-gray-700">
                                    <div className="relative" ref={filterRef}>
                                        <button onClick={() => setIsFilterOpen(prev => !prev)} className="w-full text-left text-sm font-medium text-gray-400 hover:text-white">
                                            Filtro de Departamentos ({departmentFilter.size})
                                        </button>
                                        {isFilterOpen && (
                                            <div className="mt-2 space-y-2">
                                                {departments.map(dept => (
                                                    <label key={dept} className="flex items-center text-sm text-gray-300 cursor-pointer">
                                                        <input type="checkbox" checked={departmentFilter.has(dept)} onChange={() => handleFilterChange(dept)} className="h-4 w-4 bg-gray-600 border-gray-500 text-indigo-500 rounded focus:ring-indigo-500"/>
                                                        <span className="ml-2">{dept}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </nav>
                        <div className="mt-auto border-t border-gray-700 pt-2">
                            <button onClick={logout} className="p-3 flex items-center justify-center w-full text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-150">
                                <LogoutIcon className="w-5 h-5 mr-3" />
                                <span className="font-medium">Sair</span>
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">{renderContent()}</div>
                </div>
            </div>
            {isManagementPanelOpen && <div className="fixed inset-0 bg-black bg-opacity-30 z-20" onClick={() => setManagementPanelOpen(false)}></div>}
            <ResourceEditModal isOpen={isResourceModalOpen} onClose={handleCloseResourceModal} resource={editingResource} />
            <ClientEditModal isOpen={isClientModalOpen} onClose={handleCloseClientModal} client={editingClient} />
            <ProductEditModal isOpen={isProductModalOpen} onClose={handleCloseProductModal} product={editingProduct} />
            <UserEditModal isOpen={isUserModalOpen} onClose={handleCloseUserModal} user={editingUser} />
            <UnavailabilityModal isOpen={!!unavailabilityResource} onClose={handleCloseUnavailabilityModal} resource={unavailabilityResource} />
        </>
    );
};

export default ManagementPanel;