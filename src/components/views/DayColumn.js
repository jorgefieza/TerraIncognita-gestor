// src/components/views/DayColumn.js
import React, { useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { useUI } from '../../contexts/UIContext';
import { format, parseISO, isSameDay, differenceInMinutes } from 'date-fns';
import { pt } from 'date-fns/locale';
import { calculateLayout } from '../../utils/calculateLayout';
import { getEventTimings } from '../../utils/eventUtils'; // <--- IMPORTADO
import { ShipIcon, UsersIcon, BriefcaseIcon } from '../core/Icons';

const DayColumn = ({ day, calendarStartHour, visibleHours, navigateToDay, isWeeklyView = false, events }) => {
    const { allEquipment, allClients, allSkills, allDocks, dataVersion } = useData();
    const { openEventModal, blinkingEvents } = useUI();

    const getSkillName = (skillId) => (allSkills || []).find(s => s.id === skillId)?.name || 'N/A';
    
    const dayEvents = useMemo(() => (events || []).filter(event => event.type === 'Evento Padrão' && isSameDay(parseISO(event.start), day)), [events, day, dataVersion]);

    const layoutEvents = useMemo(() => {
        // ===== LÓGICA REATORIZADA PARA USAR A FUNÇÃO CENTRAL =====
        const eventsWithBuffer = dayEvents.map(event => {
            const timings = getEventTimings(event, allEquipment, allDocks);
            return { 
                ...event, 
                bufferedStart: timings.startWithPrep, 
                bufferedEnd: timings.endWithCleanup, 
                prepTime: timings.totalPrepTime, 
                cleanupTime: timings.totalCleanupTime 
            };
        });
        
        const layoutableEvents = eventsWithBuffer.map(e => ({ ...e, start: e.bufferedStart, end: e.bufferedEnd }));
        
        return calculateLayout(layoutableEvents, calendarStartHour, visibleHours.length).map(layoutEvent => {
            const originalEvent = eventsWithBuffer.find(e => e.id === layoutEvent.id);
            return { ...layoutEvent, ...originalEvent };
        });
    }, [dayEvents, calendarStartHour, visibleHours.length, allEquipment, allDocks, dataVersion]);

    const getResourceCode = (name) => (allEquipment || []).find(r => r.name === name)?.code || name;
    
    const formatProfessionalName = (fullName) => {
        const parts = fullName.split(' ');
        if (parts.length > 1) return `${parts[0].charAt(0)}. ${parts[parts.length - 1]}`;
        return fullName;
    };
    
    const getStatusColor = (status) => {
        const colors = { Confirmado: 'bg-green-200 border-green-600 text-green-900', Standby: 'bg-yellow-200 border-yellow-600 text-yellow-900', Cancelado: 'bg-red-200 border-red-600 text-red-900', default: 'bg-gray-200 border-gray-600 text-gray-900' };
        return colors[status] || colors.default;
    };

    return (
        <div className="border-r border-gray-200 flex-1">
            <div className="text-center py-2 border-b border-gray-200 h-20">
                <p className="text-sm font-medium uppercase text-gray-500">{format(day, 'eee', { locale: pt })}</p>
                <p className={`text-3xl font-bold cursor-pointer ${isSameDay(day, new Date()) ? 'text-indigo-600' : 'text-gray-900'}`} onClick={() => navigateToDay(day)}>{format(day, 'd')}</p>
            </div>
            <div className="relative" style={{ height: `${visibleHours.length * 60}px` }} onClick={(e) => {
                if (e.target !== e.currentTarget) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const clickY = e.clientY - rect.top;
                const totalMinutes = (clickY / rect.height) * visibleHours.length * 60;
                const hours = Math.floor(totalMinutes / 60) + calendarStartHour;
                const minutes = Math.floor((totalMinutes % 60) / 15) * 15;
                openEventModal(day, `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`);
            }}>
                {visibleHours.map((_, i) => (<div key={i} className="h-[60px] border-t border-gray-200 bg-gray-50 first:border-t-0"></div>))}
                {layoutEvents.map(event => {
                    const blinkClass = blinkingEvents[event.id] ? `blink-${blinkingEvents[event.id]}` : '';
                    const totalDurationMinutes = differenceInMinutes(event.bufferedEnd, event.bufferedStart);
                    const client = (allClients || []).find(c => c.id === event.clientId);
                    const agency = event.agencyId ? (allClients || []).find(a => a.id === event.agencyId) : null;
                    
                    return (
                        <div key={event.id} className={`absolute p-0 rounded-lg shadow-md cursor-pointer overflow-hidden border-l-4 ${getStatusColor(event.status)} ${blinkClass}`}
                            style={{ top: event.top, height: event.height, left: event.left, width: event.width }}
                            onClick={(e) => { e.stopPropagation(); openEventModal(parseISO(event.start), null, event); }}>
                            {event.prepTime > 0 && (<div className="absolute top-0 left-0 w-full bg-black opacity-10" style={{ height: `${(event.prepTime / totalDurationMinutes) * 100}%`, backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 5px, rgba(0,0,0,0.1) 5px, rgba(0,0,0,0.1) 10px)' }}></div>)}
                            {event.cleanupTime > 0 && (<div className="absolute bottom-0 left-0 w-full bg-black opacity-10" style={{ height: `${(event.cleanupTime / totalDurationMinutes) * 100}%`, backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 5px, rgba(0,0,0,0.1) 5px, rgba(0,0,0,0.1) 10px)' }}></div>)}
                            <div className="relative z-10 p-2 h-full flex flex-col justify-between">
                                <div className="text-xs">
                                    <p className="font-bold text-sm leading-tight mb-1">
                                        {event.title} - <span className="italic font-normal text-gray-600">{event.department}</span>
                                    </p>
                                    
                                    {client && (
                                        <p className="flex items-center">
                                            <BriefcaseIcon className="h-4 w-4 mr-1.5 flex-shrink-0" />
                                            <span className="truncate">{client.name} {agency ? `(${agency.name})` : ''}</span>
                                        </p>
                                    )}
                                </div>
                                <div className="text-xs mt-1">
                                    {event.equipment && event.equipment.length > 0 && (
                                        <p className="flex items-center"><ShipIcon className="h-4 w-4 mr-1.5 flex-shrink-0" /> <span className="truncate">{event.equipment.map(e => isWeeklyView ? getResourceCode(e.name) : e.name).join(', ')}</span></p>
                                    )}
                                    {event.professionals && event.professionals.length > 0 && (
                                        <div className="mt-1">
                                            {event.professionals.map(p => (
                                                <p key={p.name} className="flex items-center"><UsersIcon className="h-4 w-4 mr-1.5 flex-shrink-0" /> <span className="truncate">{isWeeklyView ? formatProfessionalName(p.name) : `${p.name} (${getSkillName(p.skillId)})`}</span></p>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
export default DayColumn;