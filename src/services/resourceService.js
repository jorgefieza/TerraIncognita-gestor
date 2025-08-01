// src/services/resourceService.js
import { db, appId } from './firebase';
import { collection, onSnapshot, doc, addDoc, setDoc, deleteDoc } from 'firebase/firestore';

/**
 * Cria um listener em tempo real para uma coleção do Firestore.
 * @param {string} collectionName - O nome da coleção a ser ouvida.
 * @param {function} callback - Função a ser chamada com os dados atualizados.
 * @returns {function} Uma função para cancelar a subscrição (unsubscribe).
 */
const get = (collectionName, callback) => {
    const collectionPath = `artifacts/${appId}/public/data/${collectionName}`;
    const q = collection(db, collectionPath);
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
        callback(items);
    }, (error) => {
        console.error(`Erro ao buscar a coleção ${collectionName} em ${collectionPath}:`, error);
        callback([], error); // Retorna array vazio em caso de erro
    });
    return unsubscribe;
};

/**
 * Salva (cria ou atualiza) um documento numa coleção.
 * @param {string} collectionName - O nome da coleção.
 * @param {object} data - O objeto de dados a ser salvo. Deve conter um 'id' para atualização.
 */
const save = async (collectionName, data) => {
    const collectionPath = `artifacts/${appId}/public/data/${collectionName}`;
    const dataToSave = { ...data };

    if (dataToSave.id) {
        const docRef = doc(db, collectionPath, dataToSave.id);
        delete dataToSave.id; // Não guardar o ID dentro do documento
        await setDoc(docRef, dataToSave, { merge: true });
    } else {
        await addDoc(collection(db, collectionPath), dataToSave);
    }
};

/**
 * Exclui um documento de uma coleção.
 * @param {string} collectionName - O nome da coleção.
 * @param {string} id - O ID do documento a ser excluído.
 */
const remove = async (collectionName, id) => {
    const collectionPath = `artifacts/${appId}/public/data/${collectionName}`;
    await deleteDoc(doc(db, collectionPath, id));
};

export default { get, save, remove };