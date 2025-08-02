// src/components/views/MonthlyView.js
import React from 'react';
import { useData } from '../../contexts/DataContext';
import { useUI } from '../../contexts/UIContext';
import { format, parseISO, isSameDay, isSameMonth, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { pt } from 'date-fns/locale';
import { ShipIcon, UsersIcon, BriefcaseIcon } from '../core/Icons';

const MonthlyView = ({ currentDate, navigateToDay, events }) => {
    const { allEquipment, allClients } = useData();
    const { openEventModal, blinkingEvents } = useUI();
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const getResourceCode = (name) => (allEquipment || []).find(r => r.name === name)?.code || name;
    
    const formatProfessionalName = (fullName) => {
        const parts = fullName.split(' ');
        if (parts.length > 1) return `${parts[0].charAt(0)}. ${parts[parts.length - 1]}`;
        return fullName;
    };

    const getStatusColor = (status) => {
        const colors = { Confirmado: 'bg-green-500 text-white', Standby: 'bg-yellow-500 text-white', Cancelado: 'bg-red-500 text-white', default: 'bg-gray-500 text-white' };
        return colors[status] || colors.default;
    };

    return (
        <div className="grid grid-cols-7 border-l border-t border-gray-200">
            {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day, i) => <div key={i} className="text-center py-2 border-b border-r border-gray-200 bg-gray-100 text-sm font-bold text-gray-600">{day}</div>)}
            {days.map(day => {
                const dayEvents = (events || [])
                    .filter(event => event.type === 'Evento Padrão' && isSameDay(parseISO(event.start), day))
                    .sort((a, b) => parseISO(a.start) - parseISO(b.start));
                return (
                    <div key={day.toString()} className={`border-r border-b border-gray-200 p-1 min-h-[120px] ${isSameMonth(day, currentDate) ? 'bg-white' : 'bg-gray-50'}`} onClick={() => openEventModal(day)}>
                        <p className={`text-sm mb-1 cursor-pointer hover:font-bold ${isSameDay(day, new Date()) ? 'bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''}`} onClick={(e) => { e.stopPropagation(); navigateToDay(day); }}>{format(day, 'd')}</p>
                        <div className="flex flex-col gap-1">
                            {dayEvents.map(event => {
                                const blinkClass = blinkingEvents[event.id] ? `blink-${blinkingEvents[event.id]}` : '';
                                const client = (allClients || []).find(c => c.id === event.clientId);
                                const agency = event.agencyId ? (allClients || []).find(a => a.id === event.agencyId) : null;
                                return (
                                    <div key={event.id} className={`p-1 rounded text-xs w-full ${getStatusColor(event.status)} ${blinkClass}`} onClick={(e) => { e.stopPropagation(); openEventModal(day, null, event); }}>
                                        {/* ===== CORREÇÃO DE EXIBIÇÃO DO TÍTULO ===== */}
                                        <p className="font-semibold truncate">
                                            {event.title} - <span className="italic font-normal">{event.department}</span>
                                        </p>
                                        
                                        {client && (
                                            <p className="text-xs truncate flex items-center">
                                                <BriefcaseIcon className="h-3 w-3 mr-1 flex-shrink-0" />
                                                {client.name} {agency ? `(${agency.name})` : ''}
                                            </p>
                                        )}
                                        {event.equipment?.length > 0 && (
                                            <p className="text-xs truncate flex items-center"><ShipIcon className="h-3 w-3 mr-1 flex-shrink-0" />{event.equipment.map(e => getResourceCode(e.name)).join(', ')}</p>
                                        )}
                                        {event.professionals?.length > 0 && (
                                            <p className="text-xs truncate flex items-center"><UsersIcon className="h-3 w-3 mr-1 flex-shrink-0" />{event.professionals.map(p => formatProfessionalName(p.name)).join(', ')}</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
export default MonthlyView;