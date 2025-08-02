// src/components/core/DatePickerPopup.js
import React, { useState, useEffect, useRef } from 'react';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, subMonths, addMonths, isSameMonth, isSameDay } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useUI } from '../../contexts/UIContext';
import useClickOutside from '../../utils/useClickOutside';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

const DatePickerPopup = ({ onDateSelect, initialDate }) => {
    const { isDatePickerOpen, setDatePickerOpen } = useUI();
    const [displayMonth, setDisplayMonth] = useState(initialDate);
    const popupRef = useRef(null);
    useClickOutside(popupRef, () => setDatePickerOpen(false));

    useEffect(() => {
        if (isDatePickerOpen) {
            setDisplayMonth(initialDate);
        }
    }, [isDatePickerOpen, initialDate]);

    // A verificação foi movida para depois dos hooks
    if (!isDatePickerOpen) return null;

    const monthStart = startOfMonth(displayMonth);
    const monthEnd = endOfMonth(displayMonth);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return (
        <div className="fixed inset-0 bg-black bg-opacity-25 z-50 flex items-center justify-center">
            <div ref={popupRef} className="bg-white rounded-lg shadow-xl p-4 w-full max-w-xs">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={() => setDisplayMonth(subMonths(displayMonth, 1))} className="p-1 rounded-full hover:bg-gray-100"><ChevronLeftIcon /></button>
                    <span className="font-semibold text-lg">{format(displayMonth, "LLLL 'de' yyyy", { locale: pt })}</span>
                    <button onClick={() => setDisplayMonth(addMonths(displayMonth, 1))} className="p-1 rounded-full hover:bg-gray-100"><ChevronRightIcon /></button>
                </div>
                <div className="grid grid-cols-7 text-center text-sm text-gray-500">
                    {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((d, i) => <div key={i} className="w-8 h-8 flex items-center justify-center font-bold">{d}</div>)}
                </div>
                <div className="grid grid-cols-7 text-center">
                    {days.map(day => (
                        <button key={day.toString()} onClick={() => onDateSelect(day)}
                            className={`w-8 h-8 rounded-full hover:bg-indigo-100 ${!isSameMonth(day, displayMonth) ? 'text-gray-300' : ''} ${isSameDay(day, new Date()) ? 'font-bold text-indigo-600' : ''} ${isSameDay(day, initialDate) ? 'bg-indigo-600 text-white' : ''}`}>
                            {format(day, 'd')}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DatePickerPopup;