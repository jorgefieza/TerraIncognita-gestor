// src/components/management/ClientsView.js
import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useUI } from '../../contexts/UIContext'; // Corrigido para usar o hook correto, se existir para clientes
import resourceService from '../../services/resourceService';
import { PlusIcon, PencilIcon, TrashIcon } from '../core/Icons';

const ClientsView = ({ onEditClient }) => { // Assumindo que o painel principal passa esta prop
    const { allClients, refreshData } = useData();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredClients = (allClients || []).filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (id) => {
        if (window.confirm('Tem a certeza que deseja excluir este cliente?')) {
            await resourceService.delete('clients', id);
            if (refreshData) refreshData(); // Opcional, se a subscrição não for instantânea
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Gestão de Clientes</h3>
                <button onClick={() => onEditClient(null)} className="flex items-center px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm">
                    <PlusIcon className="h-4 w-4 mr-1"/> Adicionar Cliente
                </button>
            </div>
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Pesquisar por nome..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
            </div>
            <div className="bg-white rounded-lg shadow-md max-h-[70vh] overflow-y-auto">
                <table className="w-full text-left">
                    <thead className="sticky top-0 bg-gray-50">
                        <tr>
                            <th className="p-3 text-sm font-semibold text-gray-700">Nome</th>
                            <th className="p-3 text-sm font-semibold text-gray-700">Email</th>
                            <th className="p-3 text-sm font-semibold text-gray-700">Telefone</th>
                            <th className="p-3 text-sm font-semibold text-gray-700">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredClients.map(client => (
                            <tr key={client.id} className="hover:bg-gray-50">
                                <td className="p-3 font-medium">{client.name}</td>
                                <td className="p-3">{client.email}</td>
                                <td className="p-3">{client.phone}</td>
                                <td className="p-3 flex items-center gap-4">
                                    <button onClick={() => onEditClient(client)} className="text-indigo-600 hover:text-indigo-800"><PencilIcon /></button>
                                    <button onClick={() => handleDelete(client.id)} className="text-red-600 hover:text-red-800"><TrashIcon /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredClients.length === 0 && (<div className="text-center py-8 text-gray-500">Nenhum cliente encontrado.</div>)}
            </div>
        </div>
    );
};

export default ClientsView;