// src/components/management/ProfessionalsView.js
import React, { useState, useMemo, useCallback } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import resourceService from '../../services/resourceService';
import { searchAndSortProfessionals } from '../../utils/professionalSearch';
import { PlusIcon, PencilIcon, TrashIcon, CalendarDaysIcon } from '../core/Icons';
import { isFuture, parseISO } from 'date-fns';

const ProfessionalsView = ({ onEdit, onSetUnavailability }) => {
    const { allProfessionals, allSkills, unavailabilities } = useData();
    const { permissions } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');

    const getSkillName = useCallback((skillId) => {
        return (allSkills || []).find(s => s.id === skillId)?.name || 'N/A';
    }, [allSkills]);

    const hasFutureUnavailability = (professional) => {
        return (unavailabilities || []).some(unav => 
            unav.resourceType === 'professional' &&
            unav.resourceName === professional.name && 
            isFuture(parseISO(unav.end))
        );
    };

    const professionalsToDisplay = useMemo(() => {
        if (searchTerm.trim().length < 2) {
            return (allProfessionals || []).sort((a, b) => a.name.localeCompare(b.name));
        }
        
        const searchResults = searchAndSortProfessionals({
            searchTerm,
            allProfessionals,
            allSkills,
            getSkillName,
        });

        const resultMap = new Map(searchResults.map(p => [p.id, p]));
        return Array.from(resultMap.values());
    }, [searchTerm, allProfessionals, allSkills, getSkillName]);

    const handleAddNew = () => {
        if (permissions.canCreateResources) {
            onEdit({ resourceType: 'professionals' });
        } else {
            alert("Você não tem permissão para criar novos recursos.");
        }
    };

    const handleDelete = (professional) => {
        if (!permissions.canDeleteResources) {
            alert("Você não tem permissão para excluir recursos.");
            return;
        }
        if (window.confirm(`Tem a certeza que quer excluir permanentemente o profissional "${professional.name}"? Esta ação não pode ser revertida.`)) {
            resourceService.delete('professionals', professional.id)
                .catch(err => {
                    console.error("Erro ao excluir profissional:", err);
                    alert("Ocorreu um erro ao tentar excluir o profissional.");
                });
        }
    };

    return (
        <div className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Gestão de Profissionais</h3>
                {permissions.canCreateResources && (
                    <button onClick={handleAddNew} className="flex items-center px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm">
                        <PlusIcon className="h-4 w-4 mr-1"/> Adicionar Profissional
                    </button>
                )}
            </div>
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Pesquisar por nome ou habilidade..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
            </div>
            <div className="flex-1 overflow-y-auto bg-white rounded-lg shadow-md">
                <table className="w-full text-left">
                    <thead className="sticky top-0 bg-gray-50">
                        <tr>
                            <th className="p-3 text-sm font-semibold text-gray-700">Nome</th>
                            <th className="p-3 text-sm font-semibold text-gray-700 hidden md:table-cell">Habilidades</th>
                            <th className="p-3 text-sm font-semibold text-gray-700">Status</th>
                            <th className="p-3 text-sm font-semibold text-gray-700 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {professionalsToDisplay.map(pro => {
                            const isUnavailable = hasFutureUnavailability(pro);
                            const resourceToPass = { ...pro, type: 'professional' };
                            return (
                                <tr key={pro.id} className="hover:bg-gray-50">
                                    <td className="p-3">
                                        <div className="font-medium">{pro.name}</div>
                                        {/* ALTERAÇÃO APLICADA AQUI */}
                                        <div className="text-xs text-gray-500 hidden sm:block">{pro.phone || '---'}</div>
                                    </td>
                                    <td className="p-3 text-sm text-gray-700 hidden md:table-cell">
                                        {(pro.skills && pro.skills.length > 0)
                                            ? pro.skills.map(skill => getSkillName(skill.id)).join(', ')
                                            : <span className="text-xs text-gray-400">Nenhuma</span>
                                        }
                                    </td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${pro.status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {pro.status}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <div className="flex items-center justify-center gap-3">
                                            <button onClick={() => onEdit({ ...pro, resourceType: 'professionals' })} className="text-indigo-600 hover:text-indigo-800" title="Editar">
                                                <PencilIcon className="h-5 w-5" />
                                            </button>
                                            <button onClick={() => onSetUnavailability(resourceToPass)} className={isUnavailable ? "text-red-500 hover:text-red-700" : "text-gray-500 hover:text-gray-800"} title="Definir Indisponibilidade">
                                                <CalendarDaysIcon className="h-5 w-5"/>
                                            </button>
                                            <button onClick={() => handleDelete(pro)} className="text-red-600 hover:text-red-800" title="Excluir">
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                 {professionalsToDisplay.length === 0 && (<div className="text-center py-8 text-gray-500">Nenhum profissional encontrado.</div>)}
            </div>
        </div>
    );
};

export default ProfessionalsView;