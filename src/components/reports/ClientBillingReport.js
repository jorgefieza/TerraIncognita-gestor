// src/components/reports/ClientBillingReport.js
import React, { useState, useMemo, useRef } from 'react';
import { startOfMonth, endOfMonth, format, parseISO, isWithinInterval } from 'date-fns';
import { useData } from '../../contexts/DataContext';
import { jsonToCsv, downloadCsv } from '../../utils/csv';
import useClickOutside from '../../utils/useClickOutside';

const ClientBillingReport = () => {
    const { events, allClients } = useData();
    const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
    const [isExportMenuOpen, setExportMenuOpen] = useState(false);
    
    const exportMenuRef = useRef(null);
    useClickOutside(exportMenuRef, () => setExportMenuOpen(false));

    const reportData = useMemo(() => {
        const start = parseISO(startDate);
        const end = parseISO(endDate);

        const relevantClients = (allClients || []).filter(c => ['Agência', 'Comercial'].includes(c.type));
        const relevantClientIds = relevantClients.map(c => c.id);

        const filteredEvents = (events || []).filter(event => {
            if (!event.financialDetails || !event.clientId || !relevantClientIds.includes(event.clientId)) {
                return false;
            }
            try {
                const eventDate = parseISO(event.start);
                return isWithinInterval(eventDate, { start, end });
            } catch (e) {
                return false;
            }
        });

        const groupedByClient = filteredEvents.reduce((acc, event) => {
            const clientId = event.clientId;
            if (!acc[clientId]) {
                acc[clientId] = [];
            }
            acc[clientId].push(event);
            return acc;
        }, {});

        const finalReport = Object.keys(groupedByClient).map(clientId => {
            const clientEvents = groupedByClient[clientId];
            const clientInfo = (allClients || []).find(c => c.id === clientId);
            let totalGross = 0;
            let totalCommission = 0;
            let totalTaxable = 0;
            let totalIvaAmount = 0;
            let paidEventCount = 0; // <-- ADICIONADO: Contador de eventos pagos

            clientEvents.forEach(event => {
                const { grossValue, commissionType, commissionValue, iva, isPaid } = event.financialDetails;
                const gross = parseFloat(grossValue) || 0;
                const commValue = parseFloat(commissionValue) || 0;
                const ivaRate = parseFloat(iva) || 0;

                if (isPaid) { // <-- ADICIONADO: Incrementa se o evento estiver pago
                    paidEventCount++;
                }

                totalGross += gross;

                let commissionAmount = 0;
                if (commissionType === '%') {
                    commissionAmount = gross * (commValue / 100);
                } else { // '€'
                    commissionAmount = commValue;
                }
                totalCommission += commissionAmount;

                const taxableAmount = gross - commissionAmount;
                const ivaAmount = taxableAmount * (ivaRate / 100);
                totalTaxable += taxableAmount;
                totalIvaAmount += ivaAmount;
            });
            
            // ===== CORREÇÃO: Lógica para determinar o status de pagamento =====
            let paymentStatus = 'Não Pago';
            if (clientEvents.length > 0) {
                if (paidEventCount === clientEvents.length) {
                    paymentStatus = 'Pago';
                } else if (paidEventCount > 0) {
                    paymentStatus = 'Parcial';
                }
            }
            // ==============================================================

            return {
                clientId,
                clientName: clientInfo ? clientInfo.name : 'Cliente Desconhecido',
                eventCount: clientEvents.length,
                totalGross,
                totalCommission,
                totalTaxable,
                totalIvaAmount,
                totalToBill: totalTaxable + totalIvaAmount,
                paymentStatus // <-- ADICIONADO: Status de pagamento para o relatório
            };
        });

        return finalReport;

    }, [startDate, endDate, events, allClients]);

    const handleExport = (format) => {
        setExportMenuOpen(false);
        if (reportData.length === 0) {
            alert("Não há dados para exportar.");
            return;
        }

        if (format === 'csv') {
            const dataToExport = reportData.map(row => ({
                'Cliente': row.clientName,
                'N Eventos': row.eventCount,
                'Status Pagamento': row.paymentStatus, // <-- ADICIONADO: Coluna no CSV
                'Valor Bruto (€)': row.totalGross.toFixed(2),
                'Comissoes (€)': row.totalCommission.toFixed(2),
                'Base Tributavel (€)': row.totalTaxable.toFixed(2),
                'Valor IVA (€)': row.totalIvaAmount.toFixed(2),
                'Total a Faturar (€)': row.totalToBill.toFixed(2)
            }));
            const csvString = jsonToCsv(dataToExport);
            downloadCsv(csvString, `relatorio_faturacao_${startDate}_a_${endDate}.csv`);
        } else {
            alert(`A exportação para ${format.toUpperCase()} será implementada em breve!`);
        }
    };
    
    // Função para obter a cor do status
    const getStatusClass = (status) => {
        switch (status) {
            case 'Pago': return 'bg-green-100 text-green-800';
            case 'Parcial': return 'bg-yellow-100 text-yellow-800';
            case 'Não Pago': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="text-lg font-semibold mb-4">Relatório de Faturação de Clientes</h4>
            <div className="flex gap-4 mb-4 items-end">
                <div>
                    <label className="block text-sm font-medium text-gray-700">De</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Até</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                
                <div className="relative" ref={exportMenuRef}>
                    <button 
                        onClick={() => setExportMenuOpen(prev => !prev)}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                        disabled={reportData.length === 0}
                    >
                        Exportar
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                    {isExportMenuOpen && (
                        <div className="absolute bottom-full mb-2 w-full bg-white rounded-md shadow-lg border">
                            <button onClick={() => handleExport('csv')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Como CSV</button>
                            <button onClick={() => handleExport('excel')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" disabled>Como Excel</button>
                            <button onClick={() => handleExport('pdf')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" disabled>Como PDF</button>
                        </div>
                    )}
                </div>
            </div>

            <table className="w-full text-left border-collapse mt-4">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="p-2 text-sm font-semibold text-gray-700 border-b">Cliente</th>
                        <th className="p-2 text-sm font-semibold text-gray-700 border-b text-center">Eventos</th>
                        {/* ===== NOVA COLUNA ADICIONADA ===== */}
                        <th className="p-2 text-sm font-semibold text-gray-700 border-b">Status Pagamento</th>
                        <th className="p-2 text-sm font-semibold text-gray-700 border-b">Valor Bruto</th>
                        <th className="p-2 text-sm font-semibold text-gray-700 border-b">Comissões</th>
                        <th className="p-2 text-sm font-semibold text-gray-700 border-b">Base Tributável</th>
                        <th className="p-2 text-sm font-semibold text-gray-700 border-b">Valor IVA</th>
                        <th className="p-2 text-sm font-semibold text-gray-700 border-b">Total a Faturar</th>
                    </tr>
                </thead>
                <tbody>
                    {reportData.length === 0 ? (
                        <tr>
                            <td colSpan="8" className="text-center py-8 text-gray-500">Nenhum dado para o período selecionado.</td>
                        </tr>
                    ) : (
                        reportData.map(row => (
                            <tr key={row.clientId}>
                                <td className="p-2 border-b">{row.clientName}</td>
                                <td className="p-2 border-b text-center">{row.eventCount}</td>
                                {/* ===== NOVA CÉLULA ADICIONADA ===== */}
                                <td className="p-2 border-b">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(row.paymentStatus)}`}>
                                        {row.paymentStatus}
                                    </span>
                                </td>
                                <td className="p-2 border-b">{row.totalGross.toFixed(2)} €</td>
                                <td className="p-2 border-b text-red-600">-{row.totalCommission.toFixed(2)} €</td>
                                <td className="p-2 border-b font-medium">{row.totalTaxable.toFixed(2)} €</td>
                                <td className="p-2 border-b text-blue-600">+{row.totalIvaAmount.toFixed(2)} €</td>
                                <td className="p-2 border-b font-bold text-lg">{row.totalToBill.toFixed(2)} €</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ClientBillingReport;