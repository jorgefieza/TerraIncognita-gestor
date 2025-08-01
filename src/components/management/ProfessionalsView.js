// src/components/management/ProfessionalsView.js
import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import resourceService from '../../services/resourceService';
import { PlusIcon, PencilIcon, TrashIcon, CalendarDaysIcon } from '../core/Icons';
import ProfessionalRanking from '../reports/ProfessionalRanking';
import { isFuture, parseISO } from 'date-fns';

const ProfessionalsView = ({ onEdit, onSetUnavailability }) => {
    const { allProfessionals, unavailabilities, allSkills } = useData();
    const { permissions } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');

    const getSkillName = (skillId) => allSkills.find(s => s.id === skillId)?.name || 'Habilidade Desconhecida';

    const filteredProfessionals = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        let filtered = allProfessionals;
        if (query) {
            filtered = allProfessionals.filter(p => p.name.toLowerCase().includes(query) || p.skills?.some(skill => getSkillName(skill.id).toLowerCase().includes(query)));
        }
        return filtered.sort((a, b) => {
            if (a.priority > b.priority) return -1;
            if (a.priority < b.priority) return 1;
            return a.name.localeCompare(b.name);
        });
    }, [allProfessionals, searchQuery, allSkills]);

    const hasFutureUnavailability = (professional) => unavailabilities.some(unav => unav.resourceType === 'professional' && unav.resourceName === professional.name && isFuture(parseISO(unav.end)));
    const handleDelete = (item) => { if (window.confirm(`Tem a certeza que quer apagar "${item.name}"? Esta ação não pode ser revertida.`)) resourceService.delete('professionals', item.id); };

    return (
        <div className="p-6 space-y-8">
            <h3 className="text-xl font-bold">Gestão de Profissionais</h3>
            <ProfessionalRanking />
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold">Lista de Profissionais</h4>
                    <input type="text" placeholder="Pesquisar por nome ou habilidade..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="px-3 py-1.5 border border-gray-300 rounded-md w-1/3" />
                    {permissions.canManageResources && <button onClick={() => onEdit(null, 'professionals')} className="flex items-center px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"><PlusIcon /> Adicionar</button>}
                </div>
                <div className="max-h-96 overflow-y-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50"><th className="p-3 text-sm font-semibold text-gray-700">Nome</th><th className="p-3 text-sm font-semibold text-gray-700">Habilidades</th><th className="p-3 text-sm font-semibold text-gray-700">Ações</th></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredProfessionals.map(p => {
                                const isUnavailable = hasFutureUnavailability(p);
                                const resourceWithtype = { ...p, type: 'professional' };
                                return (
                                    <tr key={p.id}>
                                        <td className="p-3">{p.name}</td>
                                        <td className="p-3 text-sm">{p.skills?.map(skill => (<span key={skill.id} className="inline-block bg-gray-200 rounded-full px-2 py-0.5 text-xs font-semibold text-gray-700 mr-1 mb-1">{getSkillName(skill.id)}</span>))}</td>
                                        <td className="p-3 flex items-center gap-4">
                                            <button onClick={() => onSetUnavailability(resourceWithtype)} className={isUnavailable ? "text-red-500 hover:text-red-700" : "text-gray-500 hover:text-gray-800"} title="Definir Indisponibilidade"><CalendarDaysIcon className="h-5 w-5"/></button>
                                            {permissions.canEditResources && (
                                                <>
                                                    <button onClick={() => onEdit(p, 'professionals')} className="text-indigo-600 hover:text-indigo-800"><PencilIcon /></button>
                                                    <button onClick={() => handleDelete(p)} className="text-red-600 hover:text-red-800"><TrashIcon /></button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {filteredProfessionals.length === 0 && (<div className="text-center py-6 text-gray-500">Nenhum profissional encontrado.</div>)}
                </div>
            </div>
        </div>
    );
};

export default ProfessionalsView;