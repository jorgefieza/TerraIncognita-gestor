// src/components/management/EquipmentView.js
import React from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import resourceService from '../../services/resourceService';
import { PlusIcon, PencilIcon, TrashIcon, CalendarDaysIcon } from '../core/Icons';
import { isFuture, parseISO } from 'date-fns';

const EquipmentView = ({ onEdit, onSetUnavailability }) => {
    const { allEquipment, unavailabilities } = useData();
    const { permissions } = useAuth();

    const hasFutureUnavailability = (equipment) => {
        return unavailabilities.some(unav => 
            unav.resourceType === 'equipment' &&
            unav.resourceName === equipment.name && 
            isFuture(parseISO(unav.end))
        );
    };

    const handleDelete = (item) => {
        if (window.confirm(`Tem a certeza que quer apagar "${item.name}"? Esta ação não pode ser revertida.`)) {
            resourceService.delete('equipment', item.id);
        }
    };

    return(
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold">Gestão de Equipamentos</h4>
                {permissions.canManageResources && <button onClick={() => onEdit(null, 'equipment')} className="flex items-center px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"><PlusIcon /> Adicionar</button>}
            </div>
            <div className="max-h-96 overflow-y-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="p-3 text-sm font-semibold text-gray-700">Nome</th>
                            <th className="p-3 text-sm font-semibold text-gray-700">Código</th>
                            <th className="p-3 text-sm font-semibold text-gray-700">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {allEquipment.map(e => {
                            const isUnavailable = hasFutureUnavailability(e);
                            const resourceWithtype = { ...e, type: 'equipment' }; // Adiciona o tipo
                            return (
                                <tr key={e.id}>
                                    <td className="p-3">{e.name}</td>
                                    <td className="p-3">{e.code}</td>
                                    <td className="p-3 flex items-center gap-4">
                                        <button onClick={() => onSetUnavailability(resourceWithtype)} className={isUnavailable ? "text-red-500 hover:text-red-700" : "text-gray-500 hover:text-gray-800"} title="Definir Indisponibilidade"><CalendarDaysIcon className="h-5 w-5"/></button>
                                        {permissions.canEditResources && (
                                            <>
                                                <button onClick={() => onEdit(e, 'equipment')} className="text-indigo-600 hover:text-indigo-800"><PencilIcon /></button>
                                                <button onClick={() => handleDelete(e)} className="text-red-600 hover:text-red-800"><TrashIcon /></button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EquipmentView;