// src/components/management/UserEditModal.js
import React, { useState, useEffect } from 'react';
import resourceService from '../../services/resourceService';

const UserEditModal = ({ isOpen, onClose, user }) => {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        // Se recebermos um utilizador, estamos a editar. Senão, estamos a adicionar.
        if (user) {
            setFormData(user);
        } else {
            // Estado inicial para um novo utilizador
            setFormData({
                name: '',
                email: '',
                role: 'colaborador',
                status: 'active'
            });
        }
    }, [user, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        if (!formData.name || !formData.email) {
            alert("Por favor, preencha o nome e o email.");
            return;
        }
        resourceService.save('users', formData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-6">
                        {user?.id ? 'Editar Utilizador' : 'Adicionar Novo Utilizador'}
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
                            <input type="text" name="name" value={formData.name || ''} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Papel (Role)</label>
                            <select name="role" value={formData.role || 'colaborador'} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md bg-white">
                                <option value="colaborador">Colaborador</option>
                                <option value="coordenador">Coordenador</option>
                                <option value="diretor">Diretor</option>
                            </select>
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

export default UserEditModal;