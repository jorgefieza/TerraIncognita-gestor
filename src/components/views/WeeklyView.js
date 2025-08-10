// src/components/views/WeeklyView.js
import React, { useMemo } from 'react';
import { addDays, getHours, parseISO, startOfDay } from 'date-fns';
import TimeAxis from './TimeAxis';
import DayColumn from './DayColumn';

const WeeklyView = ({ currentDate, navigateToDay, events }) => {
    const { visibleHours, calendarStartHour } = useMemo(() => {
        const weekStart = startOfDay(currentDate);
        const weekEnd = addDays(weekStart, 7);
        
        const relevantEvents = (events || []).filter(e => {
            try {
                const eventDate = parseISO(e.start);
                return eventDate >= weekStart && eventDate < weekEnd;
            } catch (err) {
                console.warn("Evento com data inválida ignorado:", e);
                return false;
            }
        });

        let minHour = 8, maxHour = 20;
        if (relevantEvents.length > 0) {
            minHour = Math.min(...relevantEvents.map(e => getHours(parseISO(e.start))));
            maxHour = Math.max(...relevantEvents.map(e => getHours(parseISO(e.end))));
        }
        const startHour = Math.max(0, minHour - 1);
        const endHour = Math.min(23, maxHour + 1);
        const hours = [];
        for (let i = startHour; i <= endHour; i++) hours.push(i);
        return { visibleHours: hours, calendarStartHour: startHour };
    }, [currentDate, events]);

    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(currentDate, i));

    return (
        <div className="overflow-x-auto">
            <div className="flex border-t border-l border-gray-200" style={{ minWidth: '1200px' }}>
                <TimeAxis visibleHours={visibleHours} />
                <div className="flex-1 grid grid-cols-7">
                    {weekDays.map((day, dayIndex) => (
                        <DayColumn 
                            key={dayIndex} 
                            day={day} 
                            events={events}
                            calendarStartHour={calendarStartHour} 
                            visibleHours={visibleHours} 
                            navigateToDay={navigateToDay}
                            isWeeklyView={true}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WeeklyView;