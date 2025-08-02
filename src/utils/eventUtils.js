// src/utils/eventUtils.js
import { addMinutes, subMinutes, differenceInMinutes, parseISO } from 'date-fns';

/**
 * Calcula os tempos totais de preparação e arrumação de um evento,
 * somando o tempo de viagem das docas com o tempo dos equipamentos.
 * Retorna os horários de início e fim já com os buffers aplicados.
 */
export const getEventTimings = (event, allEquipment, allDocks) => {
    // Garante que os arrays não são nulos para evitar erros
    const safeAllEquipment = allEquipment || [];
    const safeAllDocks = allDocks || [];
    const safeEventEquipment = event.equipment || [];

    // Tempo de preparação/arrumação dos equipamentos
    const equipmentDetails = safeEventEquipment.map(eq => safeAllEquipment.find(item => item.name === eq.name)).filter(Boolean);
    const equipmentPrepTime = equipmentDetails.length > 0 ? Math.max(0, ...equipmentDetails.map(eq => eq.preparationTime || 0)) : 0;
    const equipmentCleanupTime = equipmentDetails.length > 0 ? Math.max(0, ...equipmentDetails.map(eq => eq.cleanupTime || 0)) : 0;

    // Tempo de viagem das docas
    const boardingDock = safeAllDocks.find(d => d.id === event.boardingPointId);
    const disembarkingDock = safeAllDocks.find(d => d.id === event.disembarkingPointId);
    const travelToBoardingTime = boardingDock?.travelTime || 0;
    const travelFromDisembarkingTime = disembarkingDock?.travelTime || 0;

    // A lógica correta: somar os tempos
    const totalPrepTime = equipmentPrepTime + travelToBoardingTime;
    const totalCleanupTime = equipmentCleanupTime + travelFromDisembarkingTime;

    const startWithPrep = subMinutes(parseISO(event.start), totalPrepTime);
    const endWithCleanup = addMinutes(parseISO(event.end), totalCleanupTime);
    const totalDurationInMinutes = differenceInMinutes(endWithCleanup, startWithPrep);

    return {
        totalPrepTime,
        totalCleanupTime,
        startWithPrep,
        endWithCleanup,
        totalDurationInMinutes,
        totalDurationInHours: totalDurationInMinutes / 60
    };
};