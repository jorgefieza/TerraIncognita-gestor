// src/components/management/TaskEditModal.js
import React, { useState, useEffect, useMemo } from 'react';
import eventService from '../../services/eventService';
import { format, parseISO, set, startOfDay, endOfDay } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';

const TaskEditModal = ({ isOpen, onClose, task, selectedDate, dayEvents }) => {
    const [title, setTitle] = useState('');
    const [startTime, setStartTime] = useState('08:00');
    const [endTime, setEndTime] = useState('09:00');
    const [isAllDay, setIsAllDay] = useState(false);
    const [parentId, setParentId] = useState(null);
    const { user: currentUser, permissions } = useAuth();

    const timeOptions = useMemo(() => Array.from({ length: 24 * 4 }, (_, i) => {
        const h = Math.floor(i / 4);
        const m = (i % 4) * 15;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }), []);

    useEffect(() => {
        if (isOpen) {
            if (task) {
                setTitle(task.title);
                const taskStart = parseISO(task.start);
                const taskEnd = parseISO(task.end);
                const isTaskAllDay = (taskEnd.getTime() - taskStart.getTime()) >= (23 * 60 * 60 * 1000);
                setIsAllDay(isTaskAllDay);
                setStartTime(format(taskStart, 'HH:mm'));
                setEndTime(format(taskEnd, 'HH:mm'));
                setParentId(task.parentId || null);
            } else {
                setTitle('');
                setStartTime('08:00');
                setEndTime('09:00');
                setParentId(null);
                setIsAllDay(false);
            }
        }
    }, [isOpen, task]);

    const handleSave = () => {
        if (!title) {
            alert("A descrição da tarefa é obrigatória.");
            return;
        }
        
        let startDateTime, endDateTime;
        if (isAllDay) {
            startDateTime = startOfDay(selectedDate);
            endDateTime = endOfDay(selectedDate);
        } else {
            const [startH, startM] = startTime.split(':').map(Number);
            const [endH, endM] = endTime.split(':').map(Number);
            startDateTime = set(selectedDate, { hours: startH, minutes: startM, seconds: 0, milliseconds: 0 });
            endDateTime = set(selectedDate, { hours: endH, minutes: endM, seconds: 0, milliseconds: 0 });
            if (endDateTime <= startDateTime) {
                alert("A hora de fim deve ser posterior à hora de início.");
                return;
            }
        }

        const taskData = {
            title,
            start: startDateTime.toISOString(),
            end: endDateTime.toISOString(),
            type: 'Tarefa Operacional',
            status: 'Confirmado',
            department: 'Operacional',
            parentId: parentId || null,
        };
        
        eventService.save(task ? { ...task, ...taskData } : taskData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-6">{task ? 'Editar Tarefa' : 'Adicionar Nova Tarefa'}</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Associar ao Evento (Opcional)</label>
                            <select value={parentId || ''} onChange={e => setParentId(e.target.value || null)} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md bg-white">
                                <option value="">Nenhum (Tarefa Geral do Dia)</option>
                                {dayEvents.map(event => (
                                    <option key={event.id} value={event.id}>{event.title}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Descrição da Tarefa</label>
                            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md" />
                        </div>
                        <div className="flex items-center">
                            <input id="all-day" type="checkbox" checked={isAllDay} onChange={(e) => setIsAllDay(e.target.checked)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                            <label htmlFor="all-day" className="ml-2 block text-sm text-gray-900">Tarefa para o dia todo (sem hora específica)</label>
                        </div>
                        {!isAllDay && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Hora de Início</label>
                                    <select value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md bg-white">
                                        {timeOptions.map(time => <option key={time} value={time}>{time}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Hora de Fim</label>
                                    <select value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md bg-white">
                                        {timeOptions.map(time => <option key={time} value={time}>{time}</option>)}
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end items-center mt-8 pt-4 border-t gap-3">
                        <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                        <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Guardar Tarefa</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskEditModal;