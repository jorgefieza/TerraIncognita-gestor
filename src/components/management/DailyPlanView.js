// src/components/management/DailyPlanView.js
import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { useUI } from '../../contexts/UIContext';
import { format, parseISO, startOfDay, endOfDay, isWithinInterval, subDays, addDays } from 'date-fns';
import { pt } from 'date-fns/locale';
import { ShipIcon, UsersIcon, BriefcaseIcon, ChevronLeftIcon, ChevronRightIcon, ClipboardDocumentListIcon, PlusIcon } from '../core/Icons';

const DailyPlanView = () => {
    const { events, allEquipment, allClients, allSkills, allDocks, unavailabilities, dataVersion } = useData();
    const { openTaskModal } = useUI();
    const [selectedDate, setSelectedDate] = useState(new Date());

    const dayItems = useMemo(() => {
        const start = startOfDay(selectedDate);
        const end = endOfDay(selectedDate);
        const items = events.filter(e => e.type !== 'Indisponibilidade' && isWithinInterval(parseISO(e.start), { start, end }));
        
        const allDayTasks = items.filter(item => item.type === 'Tarefa Operacional' && (parseISO(item.end).getTime() - parseISO(item.start).getTime()) >= (23 * 60 * 60 * 1000));
        const timedItems = items.filter(item => !allDayTasks.includes(item));
        
        timedItems.sort((a, b) => parseISO(a.start) - parseISO(b.start));
        
        return { allDayTasks, timedItems };
    }, [events, selectedDate, dataVersion]);

    const mainEvents = useMemo(() => dayItems.timedItems.filter(e => e.type === 'Evento Padrão'), [dayItems.timedItems]);
    
    const getSkillName = (skillId) => allSkills.find(s => s.id === skillId)?.name || 'N/A';
    const getDockName = (dockId) => allDocks.find(d => d.id === dockId)?.name || 'Doca Principal';

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6 print-hidden">
                <h3 className="text-xl font-bold">Plano do Dia</h3>
                <div className="flex items-center gap-4">
                    <button onClick={() => setSelectedDate(d => subDays(d, 1))} className="p-2 rounded-md hover:bg-gray-100"><ChevronLeftIcon /></button>
                    <input type="date" value={format(selectedDate, 'yyyy-MM-dd')} onChange={e => setSelectedDate(parseISO(e.target.value))} className="px-3 py-2 border border-gray-300 rounded-md"/>
                    <button onClick={() => setSelectedDate(d => addDays(d, 1))} className="p-2 rounded-md hover:bg-gray-100"><ChevronRightIcon /></button>
                </div>
                <button onClick={() => window.print()} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Imprimir</button>
            </div>

            <div className="printable-area bg-white p-8 rounded-lg">
                <h2 className="text-2xl font-bold text-center mb-1">{format(selectedDate, "EEEE", { locale: pt })}</h2>
                <p className="text-lg text-center text-gray-600 mb-8">{format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: pt })}</p>

                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between items-center border-b-2 border-indigo-500 pb-1 mb-3">
                           <h4 className="font-bold text-gray-800">Atividades do Dia</h4>
                           <button onClick={() => openTaskModal(null, selectedDate, mainEvents)} className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 print-hidden"><PlusIcon className="h-4 w-4 mr-1"/> Adicionar Tarefa</button>
                        </div>
                        
                        {dayItems.allDayTasks.map(task => (
                             <div key={task.id} className="flex items-start gap-4 p-2 bg-yellow-50 border-l-4 border-yellow-300 rounded-r-md mb-2">
                                <ClipboardDocumentListIcon className="w-5 h-5 text-yellow-600 mt-1"/>
                                <div className="flex-1">
                                    <p className="font-semibold">{task.title}</p>
                                </div>
                             </div>
                        ))}

                        {dayItems.timedItems.map(item => {
                            const isTask = item.type === 'Tarefa Operacional';
                            const parentEvent = isTask && item.parentId ? dayItems.timedItems.find(e => e.id === item.parentId) : null;
                            const client = allClients.find(c => c.id === item.clientId);

                            return (
                                <div key={item.id} className={`flex gap-4 ${isTask && parentEvent ? 'ml-8' : ''}`}>
                                    <div className="w-24 text-right">
                                        <p className={`font-bold ${isTask ? 'text-gray-700' : 'text-indigo-700'}`}>{format(parseISO(item.start), 'HH:mm')}</p>
                                        <p className="text-sm text-gray-500">até {format(parseISO(item.end), 'HH:mm')}</p>
                                    </div>
                                    <div className={`flex-1 border-l-2 pl-4 relative pb-4 ${isTask ? 'border-gray-300' : 'border-indigo-200'}`}>
                                        {parentEvent && <div className="absolute -left-[3px] top-4 h-4 w-4 bg-gray-300 rounded-full border-4 border-white"></div>}
                                        
                                        {isTask && <p className="text-xs font-bold text-gray-500 flex items-center mb-1"><ClipboardDocumentListIcon className="w-4 h-4 mr-1"/> TAREFA{parentEvent ? ` | Subordinada a: ${parentEvent.title}` : ''}</p>}
                                        {!isTask && <p className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full mb-1 ${item.status === 'Confirmado' ? 'bg-green-100 text-green-800' : item.status === 'Cancelado' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{item.status}</p>}
                                        
                                        <h5 className="font-bold">{item.title}</h5>
                                        {!isTask && <p className="text-sm text-gray-600">{getDockName(item.boardingPointId)}</p>}
                                        
                                        <div className="mt-2 text-sm space-y-1">
                                            {client && <p className="flex items-center"><BriefcaseIcon className="h-4 w-4 mr-2 text-gray-400"/>{client.name}</p>}
                                            {item.equipment?.map(eq => <p key={eq.name} className="flex items-center"><ShipIcon className="h-4 w-4 mr-2 text-gray-400"/>{eq.name}</p>)}
                                            {item.professionals?.map(prof => <p key={prof.name} className="flex items-center"><UsersIcon className="h-4 w-4 mr-2 text-gray-400"/>{prof.name} ({getSkillName(prof.skillId)})</p>)}
                                        </div>
                                        
                                        {item.note && <div className="mt-2 p-2 bg-gray-50 border-l-4 border-gray-300 text-xs italic">"{item.note}"</div>}
                                    </div>
                                </div>
                            );
                        })}
                         {dayItems.timedItems.length === 0 && dayItems.allDayTasks.length === 0 && <p className="text-center text-gray-500 py-8">Nenhuma atividade agendada para este dia.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DailyPlanView;