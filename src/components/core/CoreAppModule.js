// src/components/core/CoreAppModule.js
import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { useUI } from '../../contexts/UIContext';
import { subMonths, subDays, addMonths, addDays } from 'date-fns';
import Header from './Header';
import DatePickerPopup from './DatePickerPopup';
import MonthlyView from '../views/MonthlyView';
import WeeklyView from '../views/WeeklyView';
import DailyView from '../views/DailyView';
import EventModal from './EventModal';
import ManagementPanel from './ManagementPanel';
import TaskEditModal from '../management/TaskEditModal';

const CoreAppModule = () => {
    const { loading, events, dataVersion } = useData();
    const { setDatePickerOpen, isTaskModalOpen, editingTask, taskDate, taskDayEvents, closeTaskModal, departmentFilter } = useUI();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState('weekly');

    const filteredEvents = useMemo(() => {
        if (departmentFilter.size === 3) return events;
        return events.filter(event => departmentFilter.has(event.department));
    }, [events, departmentFilter]);

    const handlePrev = () => { setCurrentDate(d => view === 'monthly' ? subMonths(d, 1) : subDays(d, 1)); };
    const handleNext = () => { setCurrentDate(d => view === 'monthly' ? addMonths(d, 1) : addDays(d, 1)); };
    const handleDateSelect = (date) => { setCurrentDate(date); setView('daily'); setDatePickerOpen(false); };
    const navigateToDay = (day) => { setCurrentDate(day); setView('daily'); };

    if (loading) {
        return <div className="flex justify-center items-center h-screen bg-gray-100"><div className="text-lg font-medium text-gray-600">A carregar dados...</div></div>;
    }

    return (
        <div className="bg-gray-100 min-h-screen font-sans text-gray-800">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <Header 
                    view={view} 
                    setView={setView} 
                    currentDate={currentDate} 
                    handlePrev={handlePrev} 
                    handleNext={handleNext}
                />
                <main>
                    <div key={dataVersion}>
                        {view === 'monthly' && <MonthlyView events={filteredEvents} currentDate={currentDate} navigateToDay={navigateToDay} />}
                        {view === 'weekly' && <WeeklyView events={filteredEvents} currentDate={currentDate} navigateToDay={navigateToDay} />}
                        {view === 'daily' && <DailyView events={filteredEvents} currentDate={currentDate} navigateToDay={navigateToDay} />}
                    </div>
                </main>
            </div>
            <EventModal />
            <ManagementPanel />
            <DatePickerPopup onDateSelect={handleDateSelect} initialDate={currentDate} />
            <TaskEditModal isOpen={isTaskModalOpen} onClose={closeTaskModal} task={editingTask} selectedDate={taskDate} dayEvents={taskDayEvents} />
        </div>
    );
};

export default CoreAppModule;