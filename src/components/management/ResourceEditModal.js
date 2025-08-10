// src/components/management/ResourceEditModal.js
import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import resourceService from '../../services/resourceService';
import StarRating from '../core/StarRating';

const ResourceEditModal = ({ isOpen, onClose, resource }) => {
    const { allSkills } = useData();
    const { permissions } = useAuth();
    const [formData, setFormData] = useState(null);

    useEffect(() => {
        if (resource) {
            const defaultData = resource.resourceType === 'professionals'
                ? { name: '', email: '', phone: '', nif: '', iban: '', status: 'Ativo', priority: 3, skills: [], address: '' }
                : { name: '', code: '', custoHora: 0, capacidade: 0, preparationTime: 0, cleanupTime: 0, minProfessionals: 0 };
            setFormData({ ...defaultData, ...resource });
        } else {
            setFormData(null);
        }
    }, [resource]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSkillToggle = (skillId) => {
        const currentSkills = formData.skills || [];
        const existingSkillIndex = currentSkills.findIndex(s => s.id === skillId);
        let newSkills;

        if (existingSkillIndex > -1) {
            newSkills = currentSkills.filter(s => s.id !== skillId);
        } else {
            newSkills = [...currentSkills, { id: skillId, rating: 3, costPerHour: null }];
        }
        setFormData(prev => ({ ...prev, skills: newSkills }));
    };

    const handleSkillRatingChange = (skillId, rating) => {
        const newSkills = formData.skills.map(s => s.id === skillId ? { ...s, rating } : s);
        setFormData(prev => ({ ...prev, skills: newSkills }));
    };

    const handleSkillCostChange = (skillId, cost) => {
        const newSkills = formData.skills.map(s =>
            s.id === skillId ? { ...s, costPerHour: Number(cost) } : s
        );
        setFormData(prev => ({ ...prev, skills: newSkills }));
    };

    const handleSave = () => {
        if (resource?.id && !permissions.canEditResources) {
            alert("Você não tem permissão para editar recursos.");
            return;
        }
        const { resourceType, ...data } = formData;
        resourceService.save(resourceType, data);
        onClose();
    };

    if (!isOpen || !formData) return null;

    const isEditingDisabled = !!resource?.id && !permissions.canEditResources;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-full overflow-y-auto">
                <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-6">{resource.id ? 'Editar' : 'Adicionar'} {resource.resourceType === 'professionals' ? 'Profissional' : 'Equipamento'}</h3>
                    <fieldset disabled={isEditingDisabled} className={isEditingDisabled ? 'cursor-not-allowed opacity-60' : ''}>
                        <div className="space-y-4">
                            {resource.resourceType === 'professionals' ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div><label className="block text-sm font-medium text-gray-700">Nome</label><input type="text" name="name" value={formData.name || ''} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md" /></div>
                                        <div><label className="block text-sm font-medium text-gray-700">Email</label><input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md" /></div>
                                        <div><label className="block text-sm font-medium text-gray-700">Telefone</label><input type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md" /></div>
                                        <div><label className="block text-sm font-medium text-gray-700">NIF</label><input type="text" name="nif" value={formData.nif || ''} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md" /></div>
                                        <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700">Endereço</label><input type="text" name="address" value={formData.address || ''} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md" /></div>
                                        <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700">IBAN</label><input type="text" name="iban" value={formData.iban || ''} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md" /></div>
                                        <div><label className="block text-sm font-medium text-gray-700">Status</label><select name="status" value={formData.status || 'Ativo'} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md bg-white"><option>Ativo</option><option>Inativo</option></select></div>
                                        <div><label className="block text-sm font-medium text-gray-700">Prioridade</label><StarRating rating={formData.priority} setRating={(r) => setFormData(p => ({...p, priority: r}))} className="text-blue-500" /></div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Habilidades</label>
                                        <div className="p-3 border rounded-md max-h-48 overflow-y-auto space-y-3">
                                            {allSkills.map(skill => {
                                                const skillData = formData.skills?.find(s => s.id === skill.id);
                                                const isChecked = !!skillData;
                                                return (
                                                    <div key={skill.id}>
                                                        <div className="flex items-center">
                                                            <input type="checkbox" id={`skill-${skill.id}`} checked={isChecked} onChange={() => handleSkillToggle(skill.id)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                                                            <label htmlFor={`skill-${skill.id}`} className="ml-2 text-sm text-gray-700">{skill.name}</label>
                                                        </div>
                                                        {isChecked && (
                                                            <div className="ml-6 mt-1 flex items-center gap-4">
                                                                <StarRating
                                                                    rating={skillData.rating}
                                                                    setRating={(r) => handleSkillRatingChange(skill.id, r)}
                                                                />
                                                                <div className="flex items-center">
                                                                    <input
                                                                        type="number"
                                                                        value={skillData.costPerHour ?? ''}
                                                                        onChange={(e) => handleSkillCostChange(skill.id, e.target.value)}
                                                                        placeholder={`Padrão: ${skill.defaultCostPerHour || '0'}`}
                                                                        className="w-24 px-2 py-1 border border-gray-300 rounded-md text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                                        disabled={!permissions.canSetCustomCosts}
                                                                    />
                                                                    <span className="ml-1 text-sm text-gray-600">€/h</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div><label className="block text-sm font-medium text-gray-700">Nome do Equipamento</label><input type="text" name="name" value={formData.name || ''} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md" /></div>
                                    <div><label className="block text-sm font-medium text-gray-700">Código</label><input type="text" name="code" value={formData.code || ''} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md" /></div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div><label className="block text-sm font-medium text-gray-700">Tempo de preparação (min)</label><input type="number" step="15" name="preparationTime" value={formData.preparationTime || ''} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md" /></div>
                                        <div><label className="block text-sm font-medium text-gray-700">Tempo de arrumação (min)</label><input type="number" step="15" name="cleanupTime" value={formData.cleanupTime || ''} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md" /></div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div><label className="block text-sm font-medium text-gray-700">Mínimo de Profissionais</label><input type="number" name="minProfessionals" value={formData.minProfessionals || ''} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md" /></div>
                                        <div><label className="block text-sm font-medium text-gray-700">Capacidade</label><input type="number" name="capacidade" value={formData.capacidade || ''} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md" /></div>
                                    </div>
                                    <div><label className="block text-sm font-medium text-gray-700">Custo por Hora (€)</label><input type="number" name="custoHora" value={formData.custoHora || ''} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md" /></div>
                                </div>
                            )}
                        </div>
                    </fieldset>
                    <div className="flex justify-end items-center mt-8 pt-4 border-t gap-3">
                        <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                        <button onClick={handleSave} disabled={isEditingDisabled} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed">Guardar</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResourceEditModal;