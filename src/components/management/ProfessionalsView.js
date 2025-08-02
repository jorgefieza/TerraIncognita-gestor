// src/components/management/ProfessionalsView.js
import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import resourceService from '../../services/resourceService';
import { PlusIcon, PencilIcon, TrashIcon, CalendarDaysIcon } from '../core/Icons'; // Reutilizando os ícones
import { isFuture, parseISO } from 'date-fns';


const ProfessionalsView = ({ onEdit, onSetUnavailability }) => {
    const { allProfessionals, unavailabilities, refreshData } = useData();
    const [searchTerm, setSearchTerm] = useState('');

    const hasFutureUnavailability = (professional) => {
        return (unavailabilities || []).some(unav => 
            unav.resourceType === 'professional' &&
            unav.resourceName === professional.name && 
            isFuture(parseISO(unav.end))
        );
    };

    const filteredProfessionals = (allProfessionals || []).filter(pro =>
        pro.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (id) => {
        if (window.confirm('Tem a certeza que deseja excluir este profissional?')) {
            await resourceService.delete('professionals', id);
            if(refreshData) refreshData();
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Gestão de Profissionais</h3>
                <button onClick={() => onEdit(null, 'professionals')} className="flex items-center px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm">
                    <PlusIcon className="h-4 w-4 mr-1"/> Adicionar Profissional
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
                            <th className="p-3 text-sm font-semibold text-gray-700">Status</th>
                            <th className="p-3 text-sm font-semibold text-gray-700">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredProfessionals.map(pro => {
                            const isUnavailable = hasFutureUnavailability(pro);
                            const resourceWithType = { ...pro, type: 'professional' };
                            return (
                                <tr key={pro.id} className="hover:bg-gray-50">
                                    <td className="p-3 font-medium">{pro.name}</td>
                                    <td className="p-3">{pro.email}</td>
                                    <td className="p-3">{pro.phone}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${pro.status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {pro.status}
                                        </span>
                                    </td>
                                    <td className="p-3 flex items-center gap-4">
                                        <button onClick={() => onSetUnavailability(resourceWithType)} className={isUnavailable ? "text-red-500 hover:text-red-700" : "text-gray-500 hover:text-gray-800"} title="Definir Indisponibilidade"><CalendarDaysIcon className="h-5 w-5"/></button>
                                        <button onClick={() => onEdit(pro, 'professionals')} className="text-indigo-600 hover:text-indigo-800"><PencilIcon /></button>
                                        <button onClick={() => handleDelete(pro.id)} className="text-red-600 hover:text-red-800"><TrashIcon /></button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                 {filteredProfessionals.length === 0 && (<div className="text-center py-8 text-gray-500">Nenhum profissional encontrado.</div>)}
            </div>
        </div>
    );
};

export default ProfessionalsView;