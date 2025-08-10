// src/components/core/Header.js
import React from 'react';
import { format, addDays } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useUI } from '../../contexts/UIContext';
import { useAuth } from '../../contexts/AuthContext';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, CogIcon } from '../core/Icons';

const Header = ({ view, setView, currentDate, handlePrev, handleNext }) => {
    const { openEventModal, setManagementPanelOpen, setDatePickerOpen } = useUI();
    const { permissions } = useAuth();

    let title = '';
    if (view === 'weekly') {
        const weekEnd = addDays(currentDate, 6);
        title = `${format(currentDate, 'd MMM', { locale: pt })} - ${format(weekEnd, 'd MMM yy', { locale: pt })}`;
    } else if (view === 'monthly') {
        title = format(currentDate, "LLLL 'de' yyyy", { locale: pt });
    } else {
        title = format(currentDate, "EEEE, d 'de' LLLL 'de' yyyy", { locale: pt });
    }

    return (
        <header className="flex flex-wrap justify-between items-center gap-4 mb-6 py-4 sticky top-0 bg-gray-100 z-20 print-hidden">
            <div className="flex items-center">
                <div className="flex items-center rounded-md shadow-sm">
                    <button onClick={handlePrev} className="px-3 py-2 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 transition-colors duration-150"><ChevronLeftIcon /></button>
                    <button onClick={() => setDatePickerOpen(true)} className="px-4 py-2 bg-white border-t border-b border-gray-300 text-lg font-semibold whitespace-nowrap text-gray-800 hover:bg-gray-50 transition-colors duration-150">{title}</button>
                    <button onClick={handleNext} className="px-3 py-2 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 transition-colors duration-150"><ChevronRightIcon /></button>
                </div>
            </div>

            <div className="flex items-center rounded-md shadow-sm bg-gray-200 p-1">
                <button onClick={() => setView('monthly')} className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-150 ${view === 'monthly' ? 'bg-white text-indigo-600 shadow' : 'text-gray-600'}`}>Mês</button>
                <button onClick={() => setView('weekly')} className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-150 ${view === 'weekly' ? 'bg-white text-indigo-600 shadow' : 'text-gray-600'}`}>Semana</button>
                <button onClick={() => setView('daily')} className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-150 ${view === 'daily' ? 'bg-white text-indigo-600 shadow' : 'text-gray-600'}`}>Dia</button>
            </div>

            <div className="flex items-center gap-4">
                {permissions.canCreateEvent && <button onClick={() => openEventModal(new Date())} className="flex items-center p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 shadow-sm transition-colors duration-150"><PlusIcon className="h-6 w-6"/></button>}
                <button onClick={() => setManagementPanelOpen(true)} className="flex items-center p-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 shadow-sm transition-colors duration-150"><CogIcon className="h-6 w-6"/></button>
            </div>
        </header>
    );
};

export default Header;