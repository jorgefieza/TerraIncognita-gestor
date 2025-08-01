// src/components/management/GenerateEventsModal.js
import React, { useState } from 'react';
import { format } from 'date-fns';

const GenerateEventsModal = ({ isOpen, onClose, onConfirm, product }) => {
    // Hooks movidos para o topo, antes do return condicional
    const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900">Gerar Eventos para "{product.name}"</h3>
                    <p className="mt-2 text-sm text-gray-600">Confirme para gerar eventos recorrentes para este produto. Esta ação irá criar múltiplas entradas no calendário.</p>
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gerar eventos a partir de:</label>
                        <input 
                            type="date" 
                            value={startDate} 
                            onChange={e => setStartDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                    </div>
                </div>
                <div className="flex justify-end items-center p-4 bg-gray-50 rounded-b-lg gap-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                    <button onClick={() => onConfirm(startDate)} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Confirmar e Gerar</button>
                </div>
            </div>
        </div>
    );
};

export default GenerateEventsModal;