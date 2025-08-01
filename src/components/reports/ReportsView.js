// src/components/reports/ReportsView.js
import React, { useState } from 'react';
import ClientBillingReport from './ClientBillingReport';
import ProfessionalPaymentReport from './ProfessionalPaymentReport';
import UnavailabilityReport from './UnavailabilityReport';

const ReportsView = () => {
    const [activeTab, setActiveTab] = useState('billing');

    const renderContent = () => {
        switch(activeTab) {
            case 'billing':
                return <ClientBillingReport />;
            case 'payment':
                return <ProfessionalPaymentReport />;
            case 'unavailability':
                return <UnavailabilityReport />;
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
            <h3 className="text-xl font-bold mb-4">Relatórios</h3>
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <TabButton tabId="billing" label="Faturação de Clientes" />
                    <TabButton tabId="payment" label="Pagamento de Profissionais" />
                    <TabButton tabId="unavailability" label="Indisponibilidades" />
                </nav>
            </div>
            
            <div className="mt-4">
                {renderContent()}
            </div>
        </div>
    );
};

export default ReportsView;