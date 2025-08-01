// src/components/management/DocksManagement.js
import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import resourceService from '../../services/resourceService';
import { PencilIcon, TrashIcon } from '../core/Icons';

const DocksManagement = () => {
    const { allDocks } = useData();
    const { permissions } = useAuth();
    const [newDockName, setNewDockName] = useState('');
    const [newDockTime, setNewDockTime] = useState('');
    const [editingDock, setEditingDock] = useState(null);

    const handleAdd = () => {
        if (newDockName.trim()) {
            resourceService.save('docks', { 
                name: newDockName.trim(),
                travelTime: Number(newDockTime) || 0
            });
            setNewDockName('');
            setNewDockTime('');
        }
    };

    const handleUpdate = () => {
        if (editingDock && editingDock.name.trim()) {
            const dataToSave = { ...editingDock, travelTime: Number(editingDock.travelTime) || 0 };
            resourceService.save('docks', dataToSave);
            setEditingDock(null);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="text-lg font-semibold mb-4">Gestão de Pontos de Embarque</h4>
            {permissions.canAccessSettings && 
                <div className="flex gap-2 mb-4">
                    <input type="text" value={newDockName} onChange={e => setNewDockName(e.target.value)} placeholder="Nome do Ponto (ex: Doca de Cascais)" className="flex-grow px-3 py-2 border border-gray-300 rounded-md" />
                    <input type="number" value={newDockTime} onChange={e => setNewDockTime(e.target.value)} placeholder="Tempo de Viagem (min)" className="w-48 px-3 py-2 border border-gray-300 rounded-md" />
                    <button onClick={handleAdd} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Adicionar</button>
                </div>
            }
            <div className="space-y-2 max-h-64 overflow-y-auto">
                {allDocks.map(dock => (
                    <div key={dock.id} className="flex justify-between items-center bg-gray-50 p-2 rounded-md">
                        {editingDock?.id === dock.id ? (
                            <>
                                <input type="text" value={editingDock.name} onChange={e => setEditingDock({...editingDock, name: e.target.value})} className="flex-grow px-2 py-1 border border-gray-300 rounded-md" />
                                <input type="number" value={editingDock.travelTime || ''} onChange={e => setEditingDock({...editingDock, travelTime: e.target.value})} placeholder="Tempo (min)" className="w-24 ml-2 px-2 py-1 border border-gray-300 rounded-md" />
                                <div className="flex items-center gap-2 ml-2">
                                    <button onClick={handleUpdate} className="text-green-600 hover:underline text-sm">Guardar</button>
                                    <button onClick={() => setEditingDock(null)} className="text-gray-600 hover:underline text-sm">Cancelar</button>
                                </div>
                            </>
                        ) : (
                            <>
                                <span>{dock.name} ({dock.travelTime || 0} min)</span>
                                {permissions.canAccessSettings && 
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setEditingDock({ ...dock })} className="text-indigo-600 hover:underline text-sm p-1"><PencilIcon /></button>
                                        <button onClick={() => resourceService.delete('docks', dock.id)} className="text-red-600 p-1"><TrashIcon /></button>
                                    </div>
                                }
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DocksManagement;