// src/components/management/ProductsView.js
import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { PlusIcon, PencilIcon, TrashIcon } from '../core/Icons';
import eventService from '../../services/eventService';
import GenerateEventsModal from './GenerateEventsModal';
import DeleteEventsModal from './DeleteEventsModal';
import { writeBatch, doc, collection, serverTimestamp } from 'firebase/firestore';
import { db, appId } from '../../services/firebase';
import { parseISO, addYears, addDays, addMonths, set } from 'date-fns';

const ProductsView = ({ onEditProduct }) => {
    const { allProducts } = useData();
    const { permissions } = useAuth();
    const [generateModalState, setGenerateModalState] = useState({ isOpen: false, product: null });
    const [deleteModalState, setDeleteModalState] = useState({ isOpen: false, product: null });

    const handleGenerateConfirm = async (product, startDateString) => {
        setGenerateModalState({ isOpen: false, product: null });

        const { id: productId, recurrence, name, department, defaultEquipment, defaultProfessionals, defaultStartTime, defaultEndTime } = product;
        const { frequency, interval = 1, daysOfWeek, endCondition, endDate, occurrences } = recurrence;
        const batch = writeBatch(db);
        let currentDate = parseISO(startDateString);
        let eventsCreated = 0;
        const maxOccurrences = endCondition === 'occurrences' ? parseInt(occurrences, 10) : 500;
        const finalDate = endCondition === 'date' ? parseISO(endDate) : addYears(new Date(), 5);
        const [startHour, startMinute] = defaultStartTime.split(':').map(Number);
        const [endHour, endMinute] = defaultEndTime.split(':').map(Number);
        let loopGuard = 0;

        while (eventsCreated < maxOccurrences && currentDate <= finalDate && loopGuard < 1000) {
            loopGuard++;
            let nextEventDate = null;
            if (frequency === 'daily') {
                nextEventDate = addDays(currentDate, eventsCreated > 0 ? interval : 0);
            } else if (frequency === 'monthly') {
                nextEventDate = addMonths(currentDate, eventsCreated > 0 ? interval : 0);
            } else if (frequency === 'weekly') {
                if (!daysOfWeek || daysOfWeek.length === 0) break;
                let searchDate = eventsCreated > 0 ? addDays(currentDate, 1) : currentDate;
                while (true) {
                    if (daysOfWeek.includes(searchDate.getDay())) {
                        nextEventDate = searchDate;
                        break;
                    }
                    searchDate = addDays(searchDate, 1);
                }
            }

            if (!nextEventDate || nextEventDate > finalDate) break;
            currentDate = nextEventDate;

            const newEventRef = doc(collection(db, `artifacts/${appId}/public/data/events`));
            batch.set(newEventRef, {
                title: name,
                department,
                start: set(currentDate, { hours: startHour, minutes: startMinute }).toISOString(),
                end: set(currentDate, { hours: endHour, minutes: endMinute }).toISOString(),
                equipment: (defaultEquipment || []).map(e => ({ name: e, confirmed: false })),
                professionals: (defaultProfessionals || []).map(p => ({ name: p, skill: 'N/A', confirmed: false })),
                status: 'Standby',
                type: 'Evento Padrão',
                productId,
                eventCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
                createdAt: serverTimestamp()
            });
            eventsCreated++;
        }

        await batch.commit();
        alert(`${eventsCreated} eventos gerados para "${name}"!`);
    };

    const handleDeleteConfirm = async (product, startDate, endDate) => {
        if (!product || !startDate || !endDate) return;
        setDeleteModalState({ isOpen: false, product: null });
        if(window.confirm(`Tem a certeza que quer apagar os eventos de "${product.name}" no intervalo selecionado?`)) {
            await eventService.deleteByProductId(product.id, startDate, endDate);
            alert('Eventos apagados com sucesso!');
        }
    };

    return (
        <>
            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Gestão de Produtos</h3>
                    {permissions.canManageProducts && <button onClick={() => onEditProduct(null)} className="flex items-center px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"><PlusIcon /> Adicionar Produto</button>}
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <div className="max-h-[70vh] overflow-y-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50"><th className="p-3 text-sm font-semibold text-gray-700">Nome</th><th className="p-3 text-sm font-semibold text-gray-700">Departamento</th><th className="p-3 text-sm font-semibold text-gray-700">Ações</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {allProducts.map(p => (
                                    <tr key={p.id}>
                                        <td className="p-3 font-medium">{p.name}</td>
                                        <td className="p-3">{p.department}</td>
                                        <td className="p-3 flex items-center gap-4">
                                            {permissions.canManageProducts && <>
                                                <button onClick={() => setGenerateModalState({ isOpen: true, product: p })} className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200">Gerar Eventos</button>
                                                <button onClick={() => onEditProduct(p)} className="text-indigo-600 hover:text-indigo-800"><PencilIcon/></button>
                                                <button onClick={() => setDeleteModalState({ isOpen: true, product: p })} className="text-red-600 hover:text-red-800"><TrashIcon/></button>
                                            </>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <GenerateEventsModal 
                isOpen={generateModalState.isOpen}
                onClose={() => setGenerateModalState({ isOpen: false, product: null })}
                onConfirm={(startDate) => handleGenerateConfirm(generateModalState.product, startDate)}
                product={generateModalState.product}
            />
            <DeleteEventsModal
                isOpen={deleteModalState.isOpen}
                onClose={() => setDeleteModalState({ isOpen: false, product: null })}
                onConfirm={(start, end) => handleDeleteConfirm(deleteModalState.product, start, end)}
                product={deleteModalState.product}
            />
        </>
    );
};

export default ProductsView;