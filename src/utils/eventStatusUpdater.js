// src/utils/eventStatusUpdater.js
import { parseISO, isBefore, addHours } from 'date-fns';
import eventService from '../services/eventService';

/**
 * =================================================================================
 * ATUALIZADOR AUTOMÁTICO DE ESTADO DE EVENTOS
 * =================================================================================
 * Regra de Negócio (CORRIGIDA):
 * Eventos em "Standby" que não foram confirmados são movidos para o estado "Cancelado"
 * assim que passam 48 horas APÓS a sua data/hora de início.
 * =================================================================================
 */

let hasRunThisSession = false;

/**
 * Verifica todos os eventos e cancela aqueles que estão em Standby há mais de 48h após o seu início.
 * Para evitar execuções repetidas desnecessárias, esta verificação ocorre apenas uma vez por sessão de página.
 * @param {Array} events - A lista completa de eventos do sistema.
 * @param {Object} currentUser - O objeto do utilizador atual para registar a modificação.
 */
export const checkAndCancelOldEvents = (events, currentUser) => {
    // Se a verificação já correu nesta sessão, não faz nada.
    if (hasRunThisSession) {
        return;
    }

    const now = new Date();
    
    const eventsToCancel = events.filter(event => {
        // Condição 1: O evento deve estar em "Standby".
        if (event.status !== 'Standby') {
            return false;
        }
        
        const eventStartDate = parseISO(event.start);
        
        // Condição 2: Define o prazo final para o evento (48h após o seu início).
        const cancellationDeadline = addHours(eventStartDate, 48);
        
        // Se a data/hora atual (now) for posterior ao prazo final, o evento deve ser cancelado.
        return isBefore(cancellationDeadline, now);
    });

    if (eventsToCancel.length > 0) {
        console.log(`[Event Updater] A cancelar ${eventsToCancel.length} evento(s) por estarem em Standby há mais de 48h após o início.`);
        
        const updatePromises = eventsToCancel.map(event => {
            const updatedEvent = {
                ...event,
                status: 'Cancelado',
                note: ((event.note || '') + '\n[Sistema] Cancelado automaticamente por permanecer em Standby 48 horas após o início.').trim()
            };
            return eventService.save(updatedEvent, currentUser);
        });

        Promise.all(updatePromises)
            .then(() => {
                console.log("[Event Updater] Eventos antigos em Standby foram cancelados com sucesso.");
            })
            .catch(error => {
                console.error("[Event Updater] Erro ao tentar cancelar eventos antigos:", error);
            });
    }

    // Marca que a verificação foi executada para esta sessão para evitar repetições.
    hasRunThisSession = true;
};