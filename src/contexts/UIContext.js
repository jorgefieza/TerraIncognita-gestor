// src/contexts/UIContext.js
import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useData } from './DataContext';
import { parseISO, differenceInHours } from 'date-fns';

const UIContext = createContext();

export const UIProvider = ({ children }) => {
    const { events } = useData();

    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [taskDate, setTaskDate] = useState(new Date());
    const [taskDayEvents, setTaskDayEvents] = useState([]);
    
    const [isManagementPanelOpen, setManagementPanelOpen] = useState(false);
    const [isDatePickerOpen, setDatePickerOpen] = useState(false);
    const [blinkingEvents, setBlinkingEvents] = useState({});
    const [departmentFilter, setDepartmentFilter] = useState(new Set(['Turismo', 'Comercial', 'Escola']));

    const openEventModal = useCallback((date, time, event = null) => {
        const newDate = new Date(date);
        if (time) {
            const [hours, minutes] = time.split(':');
            newDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
        }
        setSelectedEvent(event);
        setSelectedDate(newDate);
        setIsEventModalOpen(true);
    }, []);

    const closeEventModal = useCallback(() => {
        setIsEventModalOpen(false);
        setSelectedEvent(null);
    }, []);

    const openTaskModal = useCallback((task, date, dayEvents = []) => {
        setTaskDate(date);
        setTaskDayEvents(dayEvents);
        setEditingTask(task);
        setIsTaskModalOpen(true);
    }, []);
    
    const closeTaskModal = useCallback(() => {
        setIsTaskModalOpen(false);
        setEditingTask(null);
    }, []);

    const checkBlinkingEvents = useCallback(() => {
        const now = new Date();
        const standbyEvents = events.filter(e => e.status === 'Standby');
        const newBlinkingEvents = {};
        standbyEvents.forEach(event => {
            try {
                const eventStart = parseISO(event.start);
                const hoursUntilStart = differenceInHours(eventStart, now);
                if (hoursUntilStart > 0 && hoursUntilStart < 96) newBlinkingEvents[event.id] = 'fast';
                else if (hoursUntilStart > 0 && hoursUntilStart < 192) newBlinkingEvents[event.id] = 'slow';
            } catch (e) { console.error("Error parsing event date for blink check:", event); }
        });
        setBlinkingEvents(newBlinkingEvents);
    }, [events]);

    useEffect(() => {
        checkBlinkingEvents();
        const intervalId = setInterval(checkBlinkingEvents, 60000);
        return () => clearInterval(intervalId);
    }, [checkBlinkingEvents]);

    const value = {
        isEventModalOpen, selectedEvent, selectedDate,
        openEventModal,
        closeEventModal,
        isTaskModalOpen, editingTask, taskDate, taskDayEvents,
        openTaskModal, closeTaskModal,
        isManagementPanelOpen, setManagementPanelOpen,
        isDatePickerOpen, setDatePickerOpen,
        blinkingEvents,
        departmentFilter, setDepartmentFilter,
    };

    return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

export const useUI = () => {
    return useContext(UIContext);
};