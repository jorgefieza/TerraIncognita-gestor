// src/components/reports/ProfessionalPaymentReport.js
import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { startOfMonth, endOfMonth, format, parseISO, differenceInMinutes, addMinutes, subMinutes, isWithinInterval } from 'date-fns';
import { jsonToCsv, downloadCsv } from '../../utils/csv';
import MultiSelectSearch from '../ui/MultiSelectSearch';

const ProfessionalPaymentReport = () => {
    const { events, allProfessionals, allSkills, allEquipment, allDocks } = useData();
    const [selectedProfIds, setSelectedProfIds] = useState([]);
    const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));

    const paymentDetails = useMemo(() => {
        const start = parseISO(startDate);
        const end = parseISO(endDate);
        let totalPayment = 0;

        const allDetailedEvents = events
            .filter(e => e.status === 'Confirmado' && e.professionals?.length > 0 && isWithinInterval(parseISO(e.start), { start, end }))
            .flatMap(event => 
                event.professionals
                    .filter(profInEvent => profInEvent.confirmed)
                    .map(profInEvent => {
                        const professional = allProfessionals.find(p => p.name === profInEvent.name);
                        if (!professional) return null;

                        const skillUsed = profInEvent.skillId;
                        const profSkillData = professional.skills?.find(s => s.id === skillUsed);
                        const skillCost = profSkillData?.costPerHour ?? allSkills.find(s => s.id === skillUsed)?.defaultCostPerHour ?? 0;

                        const equipmentDetails = event.equipment?.map(eq => allEquipment.find(item => item.name === eq.name)).filter(Boolean) || [];
                        const equipmentPrepTime = equipmentDetails.length > 0 ? Math.max(0, ...equipmentDetails.map(eq => eq.preparationTime || 0)) : 0;
                        const equipmentCleanupTime = equipmentDetails.length > 0 ? Math.max(0, ...equipmentDetails.map(eq => eq.cleanupTime || 0)) : 0;

                        const boardingDock = allDocks.find(d => d.id === event.boardingPointId);
                        const disembarkingDock = allDocks.find(d => d.id === event.disembarkingPointId);
                        const travelPrepTime = boardingDock?.travelTime || 0;
                        const travelReturnTime = disembarkingDock?.travelTime || 0;

                        const finalPrepTime = equipmentPrepTime + travelPrepTime;
                        const finalCleanupTime = equipmentCleanupTime + travelReturnTime;
                        
                        const actualStartTime = subMinutes(parseISO(event.start), finalPrepTime);
                        const actualEndTime = addMinutes(parseISO(event.end), finalCleanupTime);
                        const durationHours = differenceInMinutes(actualEndTime, actualStartTime) / 60;
                        const eventPayment = durationHours * skillCost;

                        return {
                            uniqueId: `${event.id}-${profInEvent.name}`,
                            profId: professional.id,
                            profName: professional.name,
                            eventCode: event.eventCode,
                            eventTitle: event.title,
                            date: format(parseISO(event.start), 'dd/MM/yyyy'),
                            startTime: format(actualStartTime, 'HH:mm'),
                            endTime: format(actualEndTime, 'HH:mm'),
                            costPerHour: skillCost,
                            hours: durationHours,
                            payment: eventPayment
                        };
                    })
            ).filter(Boolean);

        const filteredEvents = selectedProfIds.length > 0 ? allDetailedEvents.filter(e => selectedProfIds.includes(e.profId)) : allDetailedEvents;
        totalPayment = filteredEvents.reduce((acc, event) => acc + event.payment, 0);

        return { events: filteredEvents, total: totalPayment };

    }, [selectedProfIds, startDate, endDate, events, allProfessionals, allSkills, allEquipment, allDocks]);

    const handleExport = () => {
        if (paymentDetails.events.length === 0) {
            alert("Não há dados para exportar.");
            return;
        }
        const dataToExport = paymentDetails.events.map(item => ({
            'Profissional': item.profName, 'Evento (Codigo)': item.eventCode, 'Data': item.date,
            'Hora Inicio Trabalho': item.startTime, 'Hora Fim Trabalho': item.endTime, 'Horas Totais': item.hours.toFixed(2),
            'Valor/Hora (€)': item.costPerHour.toFixed(2), 'Subtotal (€)': item.payment.toFixed(2)
        }));
        downloadCsv(jsonToCsv(dataToExport), 'relatorio_pagamentos.csv');
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mt-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 items-end">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por Profissionais</label>
                    <MultiSelectSearch 
                        options={allProfessionals}
                        selectedIds={selectedProfIds}
                        onChange={setSelectedProfIds}
                        placeholder="Pesquisar..."
                    />
                </div>
                <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">De</label>
                     <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Até</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
            </div>
            <div className="text-right mb-4">
                <button onClick={handleExport} disabled={paymentDetails.events.length === 0} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400">Exportar para CSV</button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-gray-100">
                        <tr>
                            <th className="p-2 text-sm font-semibold text-gray-700 border-b">Profissional</th>
                            <th className="p-2 text-sm font-semibold text-gray-700 border-b">Evento (Cód.)</th>
                            <th className="p-2 text-sm font-semibold text-gray-700 border-b">Data</th>
                            <th className="p-2 text-sm font-semibold text-gray-700 border-b">Início Trabalho</th>
                            <th className="p-2 text-sm font-semibold text-gray-700 border-b">Fim Trabalho</th>
                            <th className="p-2 text-sm font-semibold text-gray-700 border-b">Horas</th>
                            <th className="p-2 text-sm font-semibold text-gray-700 border-b">Valor/Hora</th>
                            <th className="p-2 text-sm font-semibold text-gray-700 border-b">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paymentDetails.events.map(d => (
                            <tr key={d.uniqueId} className="hover:bg-gray-50">
                                <td className="p-2 border-b">{d.profName}</td>
                                <td className="p-2 border-b"><code className="text-xs bg-gray-200 p-1 rounded">{d.eventCode}</code></td>
                                <td className="p-2 border-b">{d.date}</td>
                                <td className="p-2 border-b">{d.startTime}</td>
                                <td className="p-2 border-b">{d.endTime}</td>
                                <td className="p-2 border-b">{d.hours.toFixed(2)}</td>
                                <td className="p-2 border-b">{d.costPerHour.toFixed(2)} €</td>
                                <td className="p-2 border-b font-medium">{d.payment.toFixed(2)} €</td>
                            </tr>
                        ))}
                         {paymentDetails.events.length === 0 && (
                            <tr><td colSpan="8" className="text-center py-6 text-gray-500">Nenhum pagamento no período selecionado.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="text-right font-bold p-2 mt-2 bg-gray-100 rounded-md">
                <span>Total (lista visível): </span>
                <span className="text-lg">{paymentDetails.total.toFixed(2)} €</span>
            </div>
        </div>
    );
};

export default ProfessionalPaymentReport;