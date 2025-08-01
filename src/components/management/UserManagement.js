// src/components/management/UserManagement.js
import React, { useMemo, useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import resourceService from '../../services/resourceService';
import { PlusIcon, PencilIcon, TrashIcon } from '../core/Icons'; // TrashIcon importado
import UserEditModal from './UserEditModal';

const UserManagement = () => {
    const { allUsers } = useData();
    const { user: currentUser } = useAuth();
    const [editingUser, setEditingUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // ... (toda a lógica handleOpenModal, handleCloseModal, filteredUsers, etc. continua igual)
    const handleOpenModal = (userToEdit) => { setEditingUser(userToEdit); setIsModalOpen(true); };
    const handleCloseModal = () => { setIsModalOpen(false); setEditingUser(null); };
    const filteredUsers = useMemo(() => { if (!currentUser) return []; if (currentUser.role === 'diretor') { return allUsers; } if (currentUser.role === 'coordenador') { return allUsers.filter(user => user.role === 'colaborador'); } return []; }, [allUsers, currentUser]);
    const handleDeleteUser = (userToDelete) => { if (!currentUser) { alert("Não foi possível identificar o utilizador atual."); return; } if (currentUser.email === userToDelete.email) { alert("Você não pode excluir a si mesmo."); return; } if (currentUser.role === 'diretor') { if (userToDelete.status === 'pending_deletion') { if (userToDelete.markedForDeletionBy === currentUser.email) { alert("A exclusão deve ser confirmada por um diretor diferente."); return; } if (window.confirm(`CONFIRMAÇÃO FINAL: Excluir permanentemente ${userToDelete.name}?`)) { resourceService.delete('users', userToDelete.id); } } else { if (window.confirm(`Marcar ${userToDelete.name} para exclusão?`)) { const updatedUser = { ...userToDelete, status: 'pending_deletion', markedForDeletionBy: currentUser.email }; resourceService.save('users', updatedUser); } } } else if (currentUser.role === 'coordenador' && userToDelete.role === 'colaborador') { if (window.confirm(`Tem a certeza que quer excluir o colaborador ${userToDelete.name}?`)) { resourceService.delete('users', userToDelete.id); } } else { alert("Você não tem permissão para executar esta ação."); } };
    const getStatusClass = (status) => { switch (status) { case 'active': return 'bg-green-100 text-green-800'; case 'pending_deletion': return 'bg-yellow-100 text-yellow-800'; default: return 'bg-gray-100 text-gray-800'; } };


    return (
        <>
            <UserEditModal isOpen={isModalOpen} onClose={handleCloseModal} user={editingUser} />
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold">Gestão de Utilizadores</h4>
                    {currentUser?.role === 'diretor' && (
                        <button onClick={() => handleOpenModal(null)} className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                            <PlusIcon className="h-4 w-4 mr-1" /> Adicionar Utilizador
                        </button>
                    )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="p-3 text-sm font-semibold text-gray-700">Nome</th>
                                <th className="p-3 text-sm font-semibold text-gray-700">Email</th>
                                <th className="p-3 text-sm font-semibold text-gray-700">Papel</th>
                                <th className="p-3 text-sm font-semibold text-gray-700">Status</th>
                                <th className="p-3 text-sm font-semibold text-gray-700">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredUsers.map(user => (
                                <tr key={user.id} className={user.status === 'pending_deletion' ? 'bg-yellow-50' : ''}>
                                    <td className="p-3 font-medium">{user.name}</td>
                                    <td className="p-3 text-sm text-gray-600">{user.email}</td>
                                    <td className="p-3 text-sm capitalize">{user.role}</td>
                                    <td className="p-3"><span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(user.status)}`}>{user.status}</span></td>
                                    <td className="p-3 flex items-center gap-4">
                                        <button onClick={() => handleOpenModal(user)} className="text-indigo-600 hover:text-indigo-800"><PencilIcon /></button>
                                        {/* ===== ALTERAÇÃO AQUI ===== */}
                                        <button onClick={() => handleDeleteUser(user)} className="text-red-600 hover:text-red-800">
                                            <TrashIcon />
                                        </button>
                                        {/* ========================== */}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredUsers.length === 0 && (<div className="text-center py-8 text-gray-500">Nenhum utilizador para gerir.</div>)}
                </div>
            </div>
        </>
    );
};

export default UserManagement;