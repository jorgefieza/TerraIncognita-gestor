// src/components/management/ClientsView.js
import React from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import resourceService from '../../services/resourceService';
import { PlusIcon, PencilIcon, TrashIcon } from '../core/Icons'; // TrashIcon importado

const ClientsView = ({ onEditClient }) => {
    const { allClients } = useData();
    const { permissions } = useAuth();

    const handleDeleteClient = (client) => {
        if (window.confirm(`Tem a certeza que quer apagar o cliente "${client.name}"?`)) {
            resourceService.delete('clients', client.id);
        }
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Gestão de Clientes</h3>
                {permissions.canManageClients && <button onClick={() => onEditClient(null)} className="flex items-center px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"><PlusIcon /> Adicionar Cliente</button>}
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="max-h-[70vh] overflow-y-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="p-3 text-sm font-semibold text-gray-700">Nome</th>
                                <th className="p-3 text-sm font-semibold text-gray-700">Tipo</th>
                                <th className="p-3 text-sm font-semibold text-gray-700">Contacto</th>
                                <th className="p-3 text-sm font-semibold text-gray-700">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {allClients.map(c => (
                                <tr key={c.id}>
                                    <td className="p-3 font-medium">{c.name}</td>
                                    <td className="p-3">{c.type}</td>
                                    <td className="p-3 text-sm">{c.email}<br/><span className="text-gray-500">{c.phone}</span></td>
                                    <td className="p-3 flex items-center gap-4">
                                        {permissions.canManageClients && <>
                                            <button onClick={() => onEditClient(c)} className="text-indigo-600 hover:text-indigo-800"><PencilIcon /></button>
                                            {/* ===== ALTERAÇÃO AQUI ===== */}
                                            <button onClick={() => handleDeleteClient(c)} className="text-red-600 hover:text-red-800">
                                                <TrashIcon />
                                            </button>
                                            {/* ========================== */}
                                        </>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {allClients.length === 0 && <p className="text-center py-4 text-gray-500">Nenhum cliente cadastrado.</p>}
                </div>
            </div>
        </div>
    );
};

export default ClientsView;