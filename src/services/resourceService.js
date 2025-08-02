// src/services/resourceService.js
import { db, appId } from './firebase'; 
import { collection, getDocs, onSnapshot, addDoc, setDoc, deleteDoc, doc } from 'firebase/firestore';

const getCollectionPath = (resource) => `artifacts/${appId}/public/data/${resource}`;

/**
 * Cria um listener em tempo real para uma coleção.
 * @param {string} resource - O nome da coleção.
 * @param {function} callback - Função a ser chamada com os dados.
 * @returns {function} Uma função para cancelar a subscrição (unsubscribe).
 */
const get = (resource, callback) => {
    const collectionRef = collection(db, getCollectionPath(resource));
    const unsubscribe = onSnapshot(collectionRef, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(data);
    }, (error) => {
        console.error(`Erro ao buscar dados de ${resource}:`, error);
        callback([], error);
    });
    return unsubscribe;
};

/**
 * Busca todos os documentos de uma coleção uma única vez.
 * @param {string} resource - O nome da coleção.
 * @returns {Promise<Array>} Uma lista de documentos.
 */
const getAll = async (resource) => {
    const querySnapshot = await getDocs(collection(db, getCollectionPath(resource)));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Salva (adiciona ou atualiza) um documento.
 * @param {string} resource - O nome da coleção.
 * @param {object} data - O objeto a ser salvo. Deve conter um 'id' para atualização.
 */
const save = async (resource, data) => {
    const collectionPath = getCollectionPath(resource);
    if (data.id) {
        const docRef = doc(db, collectionPath, data.id);
        const { id, ...dataToUpdate } = data; // Não guardar o ID dentro do documento
        await setDoc(docRef, dataToUpdate, { merge: true });
    } else {
        await addDoc(collection(db, collectionPath), data);
    }
};

/**
 * Remove um documento.
 * @param {string} resource - O nome da coleção.
 * @param {string} id - O ID do documento a ser removido.
 */
const remove = async (resource, id) => {
    await deleteDoc(doc(db, getCollectionPath(resource), id));
};

const resourceService = {
    get,      // Para listeners em tempo real
    getAll,   // Para buscas únicas
    save,     // Para adicionar ou atualizar
    delete: remove
};

export default resourceService;