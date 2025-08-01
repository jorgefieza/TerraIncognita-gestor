// src/components/reports/UnavailabilityReport.js
import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { startOfMonth, endOfMonth, format, parseISO, isWithinInterval } from 'date-fns';
import { jsonToCsv, downloadCsv } from '../../utils/csv';

const UnavailabilityReport = () => {
    const { unavailabilities } = useData();
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));

    const filteredUnavailabilities = useMemo(() => {
        const start = parseISO(startDate);
        const end = parseISO(endDate);

        return unavailabilities
            .filter(u => {
                const unavStart = parseISO(u.start);
                const unavEnd = parseISO(u.end);
                const inDateRange = isWithinInterval(unavStart, { start, end }) || isWithinInterval(unavEnd, { start, end }) || (unavStart < start && unavEnd > end);
                if (!inDateRange) return false;
                if (searchQuery && !u.resourceName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
                return true;
            })
            .sort((a, b) => parseISO(a.start) - parseISO(b.start));
    }, [unavailabilities, startDate, endDate, searchQuery]);

    const handleExport = () => {
        if (filteredUnavailabilities.length === 0) {
            alert("Não há dados para exportar.");
            return;
        }
        const dataToExport = filteredUnavailabilities.map(item => ({
            'Recurso': item.resourceName,
            'Tipo': item.resourceType === 'professional' ? 'Profissional' : 'Equipamento',
            'Motivo': item.reason,
            'Data Início': format(parseISO(item.start), 'dd/MM/yyyy'),
            'Data Fim': format(parseISO(item.end), 'dd/MM/yyyy'),
        }));
        downloadCsv(jsonToCsv(dataToExport), 'relatorio_indisponibilidades.csv');
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mt-8">
            <h4 className="text-lg font-semibold mb-4">Relatório de Indisponibilidades</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 items-end">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Pesquisar por Nome do Recurso</label>
                    <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                     <label className="block text-sm font-medium text-gray-700">De</label>
                     <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 px-3 py-2 border border-gray-300 rounded-md w-full" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Até</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 px-3 py-2 border border-gray-300 rounded-md w-full" />
                </div>
            </div>
            <div className="text-right mb-4">
                <button onClick={handleExport} disabled={filteredUnavailabilities.length === 0} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400">Exportar para CSV</button>
            </div>

            <div>
                <table className="w-full text-left border-collapse mt-4">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="p-2 text-sm font-semibold text-gray-700 border-b">Recurso</th>
                            <th className="p-2 text-sm font-semibold text-gray-700 border-b">Tipo</th>
                            <th className="p-2 text-sm font-semibold text-gray-700 border-b">Motivo</th>
                            <th className="p-2 text-sm font-semibold text-gray-700 border-b">Período</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUnavailabilities.map(u => (
                            <tr key={u.id} className="hover:bg-gray-50">
                                <td className="p-2 border-b">{u.resourceName}</td>
                                <td className="p-2 border-b">{u.resourceType === 'professional' ? 'Profissional' : 'Equipamento'}</td>
                                <td className="p-2 border-b">{u.reason}</td>
                                <td className="p-2 border-b">{format(parseISO(u.start), 'dd/MM/yy')} - {format(parseISO(u.end), 'dd/MM/yy')}</td>
                            </tr>
                        ))}
                         {filteredUnavailabilities.length === 0 && (
                            <tr><td colSpan="4" className="text-center py-6 text-gray-500">Nenhuma indisponibilidade no período selecionado.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UnavailabilityReport;