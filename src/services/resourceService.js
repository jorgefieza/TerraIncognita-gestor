import { db } from 'firebaseConfig'; // Corrigido: Usando o caminho absoluto a partir de 'src', conforme jsconfig.json
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

/**
 * Busca todos os documentos de uma coleção.
 * @param {string} resource - O nome da coleção.
 * @returns {Promise<Array>} Uma lista de documentos.
 */
export const getAll = async (resource) => {
    console.log(`Buscando todos os documentos da coleção: ${resource}`); // Log adicionado
    try {
        const querySnapshot = await getDocs(collection(db, resource));
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log(`Dados de '${resource}' carregados com sucesso.`); // Log adicionado
        return data;
    } catch (error) {
        console.error(`Erro ao buscar dados de '${resource}':`, error); // Log de erro
        throw error; // Propaga o erro para ser tratado no DataContext
    }
};

/**
 * Adiciona um novo documento a uma coleção.
 * @param {string} resource - O nome da coleção.
 * @param {object} data - O objeto a ser adicionado.
 * @returns {Promise<string>} O ID do novo documento.
 */
export const add = async (resource, data) => {
    const docRef = await addDoc(collection(db, resource), data);
    return docRef.id;
};

/**
 * Atualiza um documento existente.
 * @param {string} resource - O nome da coleção.
 * @param {string} id - O ID do documento a ser atualizado.
 * @param {object} data - Os novos dados do documento.
 */
export const update = async (resource, id, data) => {
    const docRef = doc(db, resource, id);
    await updateDoc(docRef, data);
};

/**
 * Remove um documento.
 * @param {string} resource - O nome da coleção.
 * @param {string} id - O ID do documento a ser removido.
 */
export const remove = async (resource, id) => {
    await deleteDoc(doc(db, resource, id));
};
