// src/components/management/DeleteEventsModal.js
import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameDay, isWithinInterval, isSameMonth, subMonths, addMonths } from 'date-fns';
import { pt } from 'date-fns/locale';
import { ChevronLeftIcon, ChevronRightIcon } from '../core/Icons';

const DeleteEventsModal = ({ isOpen, onClose, onConfirm, product }) => {
    // Hooks movidos para o topo, antes do return condicional
    const { events } = useData();
    const [displayMonth, setDisplayMonth] = useState(new Date());
    const [range, setRange] = useState({ start: null, end: null });

    const productEventDates = useMemo(() => {
        if (!product) return [];
        return events
            .filter(e => e.productId === product.id)
            .map(e => format(parseISO(e.start), 'yyyy-MM-dd'));
    }, [events, product]);

    if (!isOpen || !product) return null;

    const handleDayClick = (day) => {
        if (!range.start || (range.start && range.end)) {
            setRange({ start: day, end: null });
        } else {
            if (day < range.start) {
                setRange({ start: day, end: range.start });
            } else {
                setRange({ ...range, end: day });
            }
        }
    };

    const monthStart = startOfMonth(displayMonth);
    const monthEnd = endOfMonth(displayMonth);
    const calendarDays = eachDayOfInterval({ start: startOfWeek(monthStart, { weekStartsOn: 1 }), end: endOfWeek(monthEnd, { weekStartsOn: 1 }) });

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900">Apagar Eventos de "{product.name}"</h3>
                    <p className="mt-2 text-sm text-gray-600">Selecione o intervalo de datas para apagar os eventos. As datas com eventos existentes estão marcadas a azul.</p>
                    <div className="mt-4">
                        <div className="flex justify-between items-center mb-2">
                            <button onClick={() => setDisplayMonth(subMonths(displayMonth, 1))} className="p-1 rounded-full hover:bg-gray-100"><ChevronLeftIcon /></button>
                            <span className="font-semibold">{format(displayMonth, "MMMM 'de' yyyy", { locale: pt })}</span>
                            <button onClick={() => setDisplayMonth(addMonths(displayMonth, 1))} className="p-1 rounded-full hover:bg-gray-100"><ChevronRightIcon /></button>
                        </div>
                        <div className="grid grid-cols-7 text-center text-xs text-gray-500">
                            {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((d, i) => <div key={i} className="w-8 h-8 flex items-center justify-center font-bold">{d}</div>)}
                        </div>
                        <div className="grid grid-cols-7 text-center">
                            {calendarDays.map(day => {
                                const dayStr = format(day, 'yyyy-MM-dd');
                                const hasEvent = productEventDates.includes(dayStr);
                                let isSelected = false, isStart = false, isEnd = false;
                                if (range.start) {
                                    isStart = isSameDay(day, range.start);
                                    if (range.end) {
                                        isSelected = isWithinInterval(day, { start: range.start, end: range.end });
                                        isEnd = isSameDay(day, range.end);
                                    } else {
                                        isSelected = isStart;
                                    }
                                }
                                const baseClasses = "w-9 h-9 flex items-center justify-center text-sm";
                                const stateClasses = isSelected ? `bg-red-200 ${isStart ? 'rounded-l-full' : ''} ${isEnd ? 'rounded-r-full' : ''}` : hasEvent ? 'bg-blue-200 rounded-full' : 'hover:bg-gray-100 rounded-full';
                                const monthClasses = isSameMonth(day, displayMonth) ? 'text-gray-800' : 'text-gray-300';
                                return <button key={day.toString()} onClick={() => handleDayClick(day)} className={`${baseClasses} ${stateClasses} ${monthClasses}`}>{format(day, 'd')}</button>
                            })}
                        </div>
                    </div>
                </div>
                <div className="flex justify-end items-center p-4 bg-gray-50 rounded-b-lg gap-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                    <button onClick={() => onConfirm(range.start, range.end)} disabled={!range.start || !range.end} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed">Apagar no Intervalo</button>
                </div>
            </div>
        </div>
    );
};

export default DeleteEventsModal;