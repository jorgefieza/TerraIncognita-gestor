// src/components/reports/ProfessionalRanking.js
import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { startOfMonth, endOfMonth, format, parseISO, differenceInMinutes, addMinutes, subMinutes } from 'date-fns';

const ProfessionalRanking = () => {
    const { events, allEquipment, allDocks } = useData();
    const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));

    const professionalHours = useMemo(() => {
        const start = parseISO(startDate);
        const end = parseISO(endDate);
        const hoursMap = new Map();

        const relevantEvents = events.filter(e => {
            if (e.status !== 'Confirmado' || !e.professionals || e.professionals.length === 0) return false;
            const eventDate = parseISO(e.start);
            return eventDate >= start && eventDate <= end;
        });

        relevantEvents.forEach(event => {
            const equipmentDetails = event.equipment?.map(eq => allEquipment.find(item => item.name === eq.name)).filter(Boolean) || [];
            const equipmentPrepTime = equipmentDetails.length > 0 ? Math.max(0, ...equipmentDetails.map(eq => eq.preparationTime || 0)) : 0;
            const equipmentCleanupTime = equipmentDetails.length > 0 ? Math.max(0, ...equipmentDetails.map(eq => eq.cleanupTime || 0)) : 0;

            const boardingDock = allDocks.find(d => d.id === event.boardingPointId);
            const disembarkingDock = allDocks.find(d => d.id === event.disembarkingPointId);
            const travelPrepTime = boardingDock?.travelTime || 0;
            const travelReturnTime = disembarkingDock?.travelTime || 0;

            const finalPrepTime = equipmentPrepTime + travelPrepTime;
            const finalCleanupTime = equipmentCleanupTime + travelReturnTime;
            
            const totalMinutes = differenceInMinutes(
                addMinutes(parseISO(event.end), finalCleanupTime),
                subMinutes(parseISO(event.start), finalPrepTime)
            );
            const totalHours = totalMinutes / 60;

            event.professionals.forEach(prof => {
                if (prof.confirmed) {
                    hoursMap.set(prof.name, (hoursMap.get(prof.name) || 0) + totalHours);
                }
            });
        });

        return Array.from(hoursMap.entries())
            .map(([name, hours]) => ({ name, hours }))
            .sort((a, b) => b.hours - a.hours);
    }, [events, startDate, endDate, allEquipment, allDocks]);

    const maxHours = Math.max(1, ...professionalHours.map(p => p.hours));

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="text-lg font-semibold mb-4">Ranking de Profissionais por Horas Trabalhadas (Eventos Confirmados)</h4>
            <div className="flex gap-4 mb-4">
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md" />
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div className="space-y-4">
                {professionalHours.length > 0 ? professionalHours.map(prof => (
                    <div key={prof.name} className="flex items-center gap-4">
                        <span className="w-48 truncate text-sm font-medium text-gray-700">{prof.name}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-6">
                            <div
                                className="bg-indigo-600 h-6 rounded-full flex items-center justify-end px-2 text-white text-xs font-bold"
                                style={{ width: `${(prof.hours / maxHours) * 100}%` }}
                            >
                                {prof.hours.toFixed(1)}h
                            </div>
                        </div>
                    </div>
                )) : <p className="text-gray-500">Nenhum dado de eventos confirmados para o período selecionado.</p>}
            </div>
        </div>
    );
};

export default ProfessionalRanking;