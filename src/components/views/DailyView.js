// src/components/views/DailyView.js
import React, { useMemo } from 'react';
import { getHours, isSameDay, parseISO } from 'date-fns';
import TimeAxis from './TimeAxis';
import DayColumn from './DayColumn';

const DailyView = ({ currentDate, navigateToDay, events }) => {
    const { visibleHours, calendarStartHour } = useMemo(() => {
        const relevantEvents = events.filter(e => {
            try {
                return isSameDay(parseISO(e.start), currentDate);
            } catch (err) {
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

    return (
        <div className="flex border-t border-l border-gray-200">
            <TimeAxis visibleHours={visibleHours} />
            <div className="flex-1 grid grid-cols-1">
                <DayColumn 
                    day={currentDate} 
                    events={events} // Passar os eventos para a DayColumn
                    calendarStartHour={calendarStartHour} 
                    visibleHours={visibleHours} 
                    navigateToDay={navigateToDay} 
                />
            </div>
        </div>
    );
};

export default DailyView;