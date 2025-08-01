// Corrigido: O caminho agora aponta para o ficheiro 'firebase.js' que está na mesma pasta.
import { db } from './firebase.js'; 
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

/**
 * Busca todos os documentos de uma coleção.
 * @param {string} resource - O nome da coleção.
 * @returns {Promise<Array>} Uma lista de documentos.
 */
const getAll = async (resource) => {
    const querySnapshot = await getDocs(collection(db, resource));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Adiciona um novo documento a uma coleção.
 * @param {string} resource - O nome da coleção.
 * @param {object} data - O objeto a ser adicionado.
 * @returns {Promise<string>} O ID do novo documento.
 */
const add = async (resource, data) => {
    const docRef = await addDoc(collection(db, resource), data);
    return docRef.id;
};

/**
 * Atualiza um documento existente.
 * @param {string} resource - O nome da coleção.
 * @param {string} id - O ID do documento a ser atualizado.
 * @param {object} data - Os novos dados do documento.
 */
const update = async (resource, id, data) => {
    const docRef = doc(db, resource, id);
    await updateDoc(docRef, data);
};

/**
 * Remove um documento.
 * @param {string} resource - O nome da coleção.
 * @param {string} id - O ID do documento a ser removido.
 */
const remove = async (resource, id) => {
    await deleteDoc(doc(db, resource, id));
};

// Agrupa todas as funções em um único objeto para exportação
const resourceService = {
    getAll,
    add,
    update,
    remove
};

// Exporta o objeto como padrão, que é a forma como o resto da aplicação espera recebê-lo.
export default resourceService;
