// src/components/management/AvailabilityView.js
import React, { useState, useMemo, useRef } from 'react';
import { useData } from '../../contexts/DataContext';
import eventService from '../../services/eventService';
import useClickOutside from '../../utils/useClickOutside';
import { format, parseISO, set } from 'date-fns';
import { PencilIcon, TrashIcon } from '../core/Icons';

const AvailabilityView = () => {
    const { allEquipment, allProfessionals, unavailabilities } = useData();
    const [resourceType, setResourceType] = useState('equipment');
    const [resourceName, setResourceName] = useState('');
    const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchRef = useRef(null);
    useClickOutside(searchRef, () => setIsSearchOpen(false));

    const combinedResources = useMemo(() => {
        const profs = allProfessionals.map(p => ({ ...p, type: 'professional' }));
        const equips = allEquipment.map(e => ({ ...e, type: 'equipment' }));
        return [...profs, ...equips];
    }, [allProfessionals, allEquipment]);

    const filteredResources = useMemo(() => {
        if (!search) return [];
        return combinedResources.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));
    }, [search, combinedResources]);

    const handleSelectResource = (resource) => {
        setResourceType(resource.type);
        setResourceName(resource.name);
        setSearch(resource.name);
        setIsSearchOpen(false);
    };

    const handleSave = async () => {
        if (!resourceName || !startDate || !endDate || !reason) {
            setError("Por favor, preencha todos os campos.");
            return;
        }
        const start = parseISO(startDate);
        const end = parseISO(endDate);
        if (start > end) {
            setError("A data de início não pode ser posterior à data de fim.");
            return;
        }

        const unavailabilityData = {
            type: 'Indisponibilidade',
            resourceType,
            resourceName,
            start: start.toISOString(),
            end: set(end, { hours: 23, minutes: 59, seconds: 59 }).toISOString(),
            title: `${reason} (${resourceName})`,
            reason,
            status: 'Confirmado'
        };

        await eventService.save(unavailabilityData);

        // ===== LÓGICA DE CONFLITOS ATIVADA AQUI =====
        await eventService.updateConflictingEvents(resourceName, resourceType, unavailabilityData.start, unavailabilityData.end);

        setResourceName('');
        setReason('');
        setSearch('');
        setError('');
    };

    return (
        <div className="p-6">
            <h3 className="text-xl font-bold mb-4">Gerir Indisponibilidades</h3>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h4 className="text-lg font-semibold mb-4">Criar Novo Bloqueio</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 relative" ref={searchRef}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Recurso (Equipamento ou Profissional)</label>
                        <input 
                            type="text" 
                            value={search}
                            onChange={e => { setSearch(e.target.value); setIsSearchOpen(true); }}
                            onFocus={() => setIsSearchOpen(true)}
                            placeholder="Pesquisar por nome..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                        {isSearchOpen && filteredResources.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                {filteredResources.map(r => (
                                    <button key={r.id} onClick={() => handleSelectResource(r)} className="w-full text-left p-2 hover:bg-gray-100">
                                        {r.name} <span className="text-xs text-gray-500">({r.type === 'professional' ? 'Profissional' : 'Equipamento'})</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data de Início</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data de Fim</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
                        <input type="text" value={reason} onChange={e => setReason(e.target.value)} placeholder="Ex: Manutenção, Férias" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    </div>
                </div>
                <div className="mt-6 text-right">
                    {error && <p className="text-red-500 text-sm text-left mb-2">{error}</p>}
                    <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Guardar Bloqueio</button>
                </div>
            </div>

            <div className="mt-8">
                <h4 className="text-lg font-semibold mb-4">Bloqueios Ativos</h4>
                 <div className="bg-white p-4 rounded-lg shadow-md max-h-64 overflow-y-auto">
                    {unavailabilities.length > 0 ? (
                        <ul className="divide-y divide-gray-200">
                            {unavailabilities.map(u => (
                                <li key={u.id} className="py-3 flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold">{u.resourceName} <span className="text-sm text-gray-500">({u.reason})</span></p>
                                        <p className="text-sm text-gray-600">{format(parseISO(u.start), 'dd/MM/yy')} - {format(parseISO(u.end), 'dd/MM/yy')}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => alert("Editar em breve!")} className="text-indigo-600 hover:text-indigo-800 p-1"><PencilIcon /></button>
                                        <button onClick={() => eventService.delete(u.id)} className="text-red-500 hover:text-red-700 p-1"><TrashIcon /></button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 text-center py-4">Nenhum bloqueio de indisponibilidade registado.</p>
                    )}
                 </div>
            </div>
        </div>
    );
};

export default AvailabilityView;