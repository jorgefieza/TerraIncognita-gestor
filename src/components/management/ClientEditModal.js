// src/components/management/ClientEditModal.js
import React, { useState, useEffect } from 'react';
import resourceService from '../../services/resourceService';

const ClientEditModal = ({ isOpen, onClose, client }) => {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (client) {
            setFormData(client);
        } else {
            setFormData({ name: '', nif: '', email: '', phone: '', type: 'Agência' });
        }
    }, [client, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        if (!formData.name) {
            alert("O nome do cliente é obrigatório.");
            return;
        }
        resourceService.save('clients', formData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-6">{client?.id ? 'Editar Cliente' : 'Adicionar Novo Cliente'}</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nome do Cliente</label>
                            <input type="text" name="name" value={formData.name || ''} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">NIF</label>
                                <input type="text" name="nif" value={formData.nif || ''} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Telefone</label>
                                <input type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email de Contacto</label>
                            <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tipo de Cliente</label>
                            <select name="type" value={formData.type || 'Agência'} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md bg-white">
                                <option>Agência</option>
                                <option>Comercial</option>
                                <option>Sponsor</option>
                                <option>Turismo</option>
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

export default ClientEditModal;