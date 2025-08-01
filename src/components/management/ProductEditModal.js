// src/components/management/ProductEditModal.js
import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext'; // Importado para permissões
import resourceService from '../../services/resourceService';
import ResourceSearchableList from './ResourceSearchableList';
import { format, addMonths } from 'date-fns';

const ProductEditModal = ({ isOpen, onClose, product }) => {
    const { allEquipment, allProfessionals } = useData();
    const { role, department } = useAuth(); // Obter role e departamento do utilizador logado
    const [formData, setFormData] = useState(null);
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const timeOptions = useMemo(() => Array.from({ length: 24 * 4 }, (_, i) => { const h = Math.floor(i / 4); const m = (i % 4) * 15; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`; }), []);

    useEffect(() => {
        if (isOpen) {
            // Se for um coordenador a criar, o departamento é o dele. Senão, o padrão é Turismo.
            const defaultDept = role === 'coordenador' ? department : 'Turismo';
            const defaultData = { name: '', department: defaultDept, defaultEquipment: [], defaultProfessionals: [], defaultStartTime: '09:00', defaultEndTime: '17:00', recurrence: { frequency: 'weekly', interval: 1, daysOfWeek: [], endCondition: 'never', endDate: format(addMonths(new Date(), 1), 'yyyy-MM-dd'), occurrences: 10 } };
            setFormData(product ? { ...defaultData, ...product } : defaultData);
        } else {
            setFormData(null);
        }
    }, [product, isOpen, role, department]);

    const handleChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
    const handleRecurrenceChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, recurrence: { ...prev.recurrence, [name]: value } })); };
    const handleWeekDayToggle = (dayIndex) => { setFormData(prev => { const daysOfWeek = prev.recurrence.daysOfWeek || []; const newDays = daysOfWeek.includes(dayIndex) ? daysOfWeek.filter(d => d !== dayIndex) : [...daysOfWeek, dayIndex]; return { ...prev, recurrence: { ...prev.recurrence, daysOfWeek: newDays.sort() } }; }); };
    const handleResourceToggle = (resourceName, type) => { setFormData(prev => { const list = prev[type] || []; const newList = list.includes(resourceName) ? list.filter(r => r !== resourceName) : [...list, resourceName]; return { ...prev, [type]: newList }; }); };

    const handleSave = () => {
        if (formData && formData.name) {
            resourceService.save('products', formData);
            onClose();
        }
    };

    if (!isOpen || !formData) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-full overflow-y-auto">
                <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-6">{product?.id ? 'Editar Produto' : 'Adicionar Novo Produto'}</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nome do Produto</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md" />
                            </div>
                            <div>
                                {/* ===== LÓGICA CONDICIONAL APLICADA AQUI ===== */}
                                <label className="block text-sm font-medium text-gray-700">Departamento</label>
                                {role === 'diretor' ? (
                                    <select name="department" value={formData.department} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md bg-white">
                                        <option>Turismo</option>
                                        <option>Comercial</option>
                                        <option>Escola</option>
                                    </select>
                                ) : (
                                    <input type="text" value={formData.department} disabled className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-md bg-gray-100 cursor-not-allowed" />
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Hora de Início Padrão</label>
                                <select name="defaultStartTime" value={formData.defaultStartTime} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md bg-white">
                                    {timeOptions.map(time => <option key={time} value={time}>{time}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Hora de Fim Padrão</label>
                                <select name="defaultEndTime" value={formData.defaultEndTime} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md bg-white">
                                    {timeOptions.map(time => <option key={time} value={time}>{time}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Equipamentos Padrão</label>
                                <ResourceSearchableList allResources={allEquipment} selectedResources={formData.defaultEquipment} onToggle={(name) => handleResourceToggle(name, 'defaultEquipment')} placeholder="Pesquisar equipamento..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Profissionais Padrão</label>
                                <ResourceSearchableList allResources={allProfessionals} selectedResources={formData.defaultProfessionals} onToggle={(name) => handleResourceToggle(name, 'defaultProfessionals')} placeholder="Pesquisar profissional..." />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Recorrência</label>
                            <div className="mt-1 space-y-3 p-3 border rounded-md">
                                <div className="flex items-center gap-2">
                                    <span>Repetir a cada</span>
                                    <input type="number" name="interval" value={formData.recurrence.interval} onChange={handleRecurrenceChange} className="w-16 px-2 py-1 border border-gray-300 rounded-md" />
                                    <select name="frequency" value={formData.recurrence.frequency} onChange={handleRecurrenceChange} className="px-3 py-1 border border-gray-300 rounded-md bg-white">
                                        <option value="daily">dias</option>
                                        <option value="weekly">semanas</option>
                                        <option value="monthly">meses</option>
                                    </select>
                                </div>
                                {formData.recurrence.frequency === 'weekly' && (
                                    <div className="flex gap-1">{weekDays.map((day, index) => (<button key={day} onClick={() => handleWeekDayToggle(index)} className={`w-8 h-8 rounded-full text-xs font-semibold ${formData.recurrence.daysOfWeek.includes(index) ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>{day.charAt(0)}</button>))}</div>
                                )}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Termina em</label>
                                    <div className="flex items-center gap-2"><input type="radio" name="endCondition" value="never" checked={formData.recurrence.endCondition === 'never'} onChange={handleRecurrenceChange} /><span>Nunca</span></div>
                                    <div className="flex items-center gap-2"><input type="radio" name="endCondition" value="date" checked={formData.recurrence.endCondition === 'date'} onChange={handleRecurrenceChange} /><span>Em</span><input type="date" name="endDate" value={formData.recurrence.endDate} onChange={handleRecurrenceChange} disabled={formData.recurrence.endCondition !== 'date'} className="px-2 py-1 border border-gray-300 rounded-md disabled:bg-gray-100" /></div>
                                    <div className="flex items-center gap-2"><input type="radio" name="endCondition" value="occurrences" checked={formData.recurrence.endCondition === 'occurrences'} onChange={handleRecurrenceChange} /><span>Após</span><input type="number" name="occurrences" value={formData.recurrence.occurrences} onChange={handleRecurrenceChange} disabled={formData.recurrence.endCondition !== 'occurrences'} className="w-20 px-2 py-1 border border-gray-300 rounded-md disabled:bg-gray-100" /><span>ocorrências</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end items-center mt-8 pt-4 border-t gap-3">
                        <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                        <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Guardar</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductEditModal;