// src/components/management/SkillsManagement.js
import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import resourceService from '../../services/resourceService';
import { PencilIcon, TrashIcon } from '../core/Icons';

const SkillsManagement = () => {
    const { allSkills } = useData();
    const { permissions } = useAuth();
    const [newSkillName, setNewSkillName] = useState('');
    const [newSkillCost, setNewSkillCost] = useState('');
    const [editingSkill, setEditingSkill] = useState(null);

    const handleAdd = () => {
        if (newSkillName.trim()) {
            resourceService.save('skills', { 
                name: newSkillName.trim(),
                defaultCostPerHour: Number(newSkillCost) || 0
            });
            setNewSkillName('');
            setNewSkillCost('');
        }
    };

    const handleUpdate = () => {
        if (editingSkill && editingSkill.name.trim()) {
            const dataToSave = { ...editingSkill, defaultCostPerHour: Number(editingSkill.defaultCostPerHour) || 0 };
            resourceService.save('skills', dataToSave);
            setEditingSkill(null);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="text-lg font-semibold mb-4">Gestão de Habilidades</h4>
            {permissions.canAccessSettings && 
                <div className="flex gap-2 mb-4">
                    <input type="text" value={newSkillName} onChange={e => setNewSkillName(e.target.value)} placeholder="Nova habilidade" className="flex-grow px-3 py-2 border border-gray-300 rounded-md" />
                    <input type="number" value={newSkillCost} onChange={e => setNewSkillCost(e.target.value)} placeholder="€/hora Padrão" className="w-32 px-3 py-2 border border-gray-300 rounded-md" />
                    <button onClick={handleAdd} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Adicionar</button>
                </div>
            }
            <div className="space-y-2 max-h-64 overflow-y-auto">
                {allSkills.map(skill => (
                    <div key={skill.id} className="flex justify-between items-center bg-gray-50 p-2 rounded-md">
                        {editingSkill?.id === skill.id ? (
                            <>
                                <input type="text" value={editingSkill.name} onChange={e => setEditingSkill({...editingSkill, name: e.target.value})} className="flex-grow px-2 py-1 border border-gray-300 rounded-md" />
                                <input type="number" value={editingSkill.defaultCostPerHour || ''} onChange={e => setEditingSkill({...editingSkill, defaultCostPerHour: e.target.value})} placeholder="€/hora" className="w-24 ml-2 px-2 py-1 border border-gray-300 rounded-md" />
                            </>
                        ) : (
                            <span>{skill.name} ({skill.defaultCostPerHour || 0} €/h)</span>
                        )}
                        {permissions.canAccessSettings && 
                            <div className="flex items-center gap-2">
                                {editingSkill?.id === skill.id ? (
                                    <>
                                        <button onClick={handleUpdate} className="text-green-600 hover:underline text-sm">Guardar</button>
                                        <button onClick={() => setEditingSkill(null)} className="text-gray-600 hover:underline text-sm">Cancelar</button>
                                    </>
                                ) : (
                                    <button onClick={() => setEditingSkill({ ...skill })} className="text-indigo-600 hover:underline text-sm p-1"><PencilIcon /></button>
                                )}
                                <button onClick={() => resourceService.delete('skills', skill.id)} className="text-red-600 p-1"><TrashIcon /></button>
                            </div>
                        }
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SkillsManagement;