// src/services/resourceService.js
import { collection, doc, addDoc, updateDoc, deleteDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, appId } from './firebase';

const resourceService = {
    save: async (resourceType, resourceData, user) => {
        const { id, ...dataToSave } = resourceData;
        const collectionPath = `artifacts/${appId}/public/data/${resourceType}`;
        
        const metadata = {
            lastModifiedAt: serverTimestamp(),
            lastModifiedBy: user ? user.name : 'Sistema'
        };

        try {
            if (id) {
                // Se um ID for fornecido (como a data da nota diária),
                // usamos setDoc, que CRIA se não existir ou ATUALIZA se existir.
                await setDoc(doc(db, collectionPath, id), { ...dataToSave, ...metadata });
            } else {
                // Se não houver ID, o Firebase gera um automaticamente.
                await addDoc(collection(db, collectionPath), { ...dataToSave, ...metadata, createdAt: serverTimestamp() });
            }
        } catch (error) {
            console.error("Error saving resource:", error);
            throw error;
        }
    },
    delete: async (resourceType, id) => {
        if (!id || !resourceType) return;
        try {
            await deleteDoc(doc(db, `artifacts/${appId}/public/data/${resourceType}`, id));
        } catch (error) {
            console.error("Error deleting resource: ", error);
            throw error;
        }
    }
};

export default resourceService;