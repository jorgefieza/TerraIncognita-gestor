// src/components/management/UnavailabilityModal.js
import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import eventService from '../../services/eventService';
import { format, parseISO, set, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameDay, isWithinInterval, isSameMonth, subMonths, addMonths } from 'date-fns';
import { pt } from 'date-fns/locale';
import { ChevronLeftIcon, ChevronRightIcon, TrashIcon } from '../core/Icons';

const UnavailabilityModal = ({ isOpen, onClose, resource }) => {
    const { unavailabilities } = useData();
    const [range, setRange] = useState({ start: null, end: null });
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');
    const [displayMonth, setDisplayMonth] = useState(new Date());

    const resourceUnavailabilities = useMemo(() => {
        if (!resource) return [];
        return unavailabilities
            .filter(u => u.resourceName === resource.name && u.resourceType === resource.type)
            .sort((a,b) => parseISO(a.start) - parseISO(b.start));
    }, [unavailabilities, resource]);

    useEffect(() => {
        if (isOpen) {
            setRange({ start: null, end: null });
            setReason('');
            setError('');
            setDisplayMonth(new Date());
        }
    }, [isOpen]);

    const handleDayClick = (day) => {
        if (!range.start || (range.start && range.end)) {
            setRange({ start: day, end: null });
        } else if (day < range.start) {
            setRange({ start: day, end: range.start });
        } else {
            setRange({ ...range, end: day });
        }
    };

    const handleSave = async () => {
        if (!range.start || !reason) {
            setError("Por favor, selecione um intervalo e preencha o motivo.");
            return;
        }
        const finalEndDate = range.end || range.start;

        const unavailabilityData = {
            type: 'Indisponibilidade',
            resourceType: resource.type,
            resourceName: resource.name,
            start: set(range.start, { hours: 0, minutes: 0, seconds: 0 }).toISOString(),
            end: set(finalEndDate, { hours: 23, minutes: 59, seconds: 59 }).toISOString(),
            title: `${reason} (${resource.name})`,
            reason,
            status: 'Confirmado'
        };
        
        await eventService.save(unavailabilityData);
        
        await eventService.updateConflictingEvents(
            unavailabilityData.resourceName, 
            unavailabilityData.resourceType, 
            unavailabilityData.start, 
            unavailabilityData.end
        );
        
        setReason('');
        setRange({ start: null, end: null });
        setError('');
        alert("Bloqueio de indisponibilidade guardado com sucesso!");
    };

    const handleDelete = async (unavailabilityId) => {
        if(window.confirm("Tem a certeza que quer apagar este bloqueio?")) {
            await eventService.delete(unavailabilityId);
        }
    };

    if (!isOpen) return null;

    const monthStart = startOfMonth(displayMonth);
    const monthEnd = endOfMonth(displayMonth);
    const calendarDays = eachDayOfInterval({ start: startOfWeek(monthStart, { weekStartsOn: 1 }), end: endOfWeek(monthEnd, { weekStartsOn: 1 }) });

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900">Gerir Indisponibilidade para <span className="text-indigo-600">{resource.name}</span></h3>
                    
                    <div className="mt-4 p-4 border rounded-md">
                        <h4 className="text-md font-semibold mb-2">Criar Novo Bloqueio</h4>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
                                <input type="text" value={reason} onChange={e => setReason(e.target.value)} placeholder="Ex: Férias, Manutenção" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Selecione o Período</label>
                                <div className="mt-1">
                                    <div className="flex justify-between items-center mb-2">
                                        <button onClick={() => setDisplayMonth(prev => subMonths(prev, 1))} className="p-1 rounded-full hover:bg-gray-100"><ChevronLeftIcon /></button>
                                        <span className="font-semibold">{format(displayMonth, "MMMM yyyy", { locale: pt })}</span>
                                        <button onClick={() => setDisplayMonth(prev => addMonths(prev, 1))} className="p-1 rounded-full hover:bg-gray-100"><ChevronRightIcon /></button>
                                    </div>
                                    <div className="grid grid-cols-7 text-center text-xs text-gray-500 border-b pb-2">
                                        {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((d, i) => <div key={`${d}-${i}`} className="font-bold">{d}</div>)}
                                    </div>
                                    <div className="grid grid-cols-7 text-center">
                                        {calendarDays.map(day => {
                                            const dayIsSelected = range.start && isWithinInterval(day, { start: range.start, end: range.end || range.start });
                                            const isBlocked = resourceUnavailabilities.some(u => isWithinInterval(day, { start: parseISO(u.start), end: parseISO(u.end) }));
                                            return (
                                                <div key={day.toString()} className={`p-1 flex justify-center items-center h-10 ${dayIsSelected ? 'bg-indigo-100' : ''} ${isSameDay(day, range.start) ? 'rounded-l-full' : ''} ${isSameDay(day, range.end) ? 'rounded-r-full' : ''}`}>
                                                    <button onClick={() => handleDayClick(day)} className={`w-8 h-8 rounded-full ${!isSameMonth(day, displayMonth) ? 'text-gray-300' : ''} ${isBlocked ? 'bg-red-200 text-red-700' : ''} ${dayIsSelected ? 'bg-indigo-600 text-white' : 'hover:bg-gray-200'}`}>{format(day, 'd')}</button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                            <div className="text-right">
                                <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Guardar Novo Bloqueio</button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h4 className="text-md font-semibold mb-2">Bloqueios Existentes</h4>
                        <div className="max-h-32 overflow-y-auto space-y-2">
                            {resourceUnavailabilities.length > 0 ? resourceUnavailabilities.map(u => (
                                <div key={u.id} className="flex justify-between items-center bg-gray-100 p-2 rounded-md">
                                    <div>
                                        <p className="font-medium text-gray-800">{u.reason}</p>
                                        <p className="text-sm text-gray-600">{format(parseISO(u.start), 'dd/MM/yy')} - {format(parseISO(u.end), 'dd/MM/yy')}</p>
                                    </div>
                                    <button onClick={() => handleDelete(u.id)} className="text-red-500 hover:text-red-700 p-1"><TrashIcon /></button>
                                </div>
                            )) : <p className="text-gray-500 text-center py-4">Nenhum bloqueio para este recurso.</p>}
                        </div>
                    </div>

                </div>
                <div className="flex justify-end items-center p-4 bg-gray-50 rounded-t-lg border-t gap-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Fechar</button>
                </div>
            </div>
        </div>
    );
};

export default UnavailabilityModal;