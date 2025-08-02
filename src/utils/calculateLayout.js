// src/utils/calculateLayout.js
import { getHours, getMinutes } from 'date-fns';

export const calculateLayout = (events, calendarStartHour, visibleHoursCount) => {
    if (!events || events.length === 0) return [];

    const sortedEvents = [...events].sort((a, b) => a.start - b.start);

    const collisionGroups = [];
    if (sortedEvents.length > 0) {
        let currentGroup = [sortedEvents[0]];
        let maxEndInGroup = sortedEvents[0].end;

        for (let i = 1; i < sortedEvents.length; i++) {
            const currentEvent = sortedEvents[i];
            if (currentEvent.start < maxEndInGroup) {
                currentGroup.push(currentEvent);
                if (currentEvent.end > maxEndInGroup) {
                    maxEndInGroup = currentEvent.end;
                }
            } else {
                collisionGroups.push(currentGroup);
                currentGroup = [currentEvent];
                maxEndInGroup = currentEvent.end;
            }
        }
        collisionGroups.push(currentGroup);
    }
    
    const layout = [];
    collisionGroups.forEach(group => {
        const columns = [];
        group.sort((a, b) => a.start - b.start);
        
        group.forEach(event => {
            let placedInColumn = false;
            for (const col of columns) {
                const lastEventInColumn = col[col.length - 1];
                if (event.start >= lastEventInColumn.end) {
                    col.push(event);
                    placedInColumn = true;
                    break;
                }
            }
            if (!placedInColumn) {
                columns.push([event]);
            }
        });

        const groupWidth = 100 / columns.length;
        columns.forEach((col, colIndex) => {
            col.forEach(event => {
                const start = event.start;
                const end = event.end;
                const startMinutes = getHours(start) * 60 + getMinutes(start) - (calendarStartHour * 60);
                const endMinutes = getHours(end) * 60 + getMinutes(end) - (calendarStartHour * 60);
                const totalVisibleMinutes = visibleHoursCount * 60;
                
                const top = Math.max(0, (startMinutes / totalVisibleMinutes) * 100);
                let height = ((endMinutes - startMinutes) / totalVisibleMinutes) * 100;
                if (height < 3) height = 3;

                // ===== MELHORIA NO LAYOUT PARALELO =====
                // Adiciona um pequeno espaçamento entre os eventos
                const eventWidth = groupWidth - 1; // Deixa 1% de margem
                const eventLeft = colIndex * groupWidth;

                if (top < 100) {
                    layout.push({ ...event, top: `${top}%`, height: `${height}%`, left: `${eventLeft}%`, width: `${eventWidth}%` });
                }
            });
        });
    });

    return layout;
};