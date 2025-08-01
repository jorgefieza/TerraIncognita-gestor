// src/services/eventService.js
import { db, appId } from './firebase';
import { collection, doc, addDoc, setDoc, deleteDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';

const eventsCollectionPath = `artifacts/${appId}/public/data/events`;
const eventsCollection = collection(db, eventsCollectionPath);

/**
 * Cria um listener em tempo real para a coleção de eventos,
 * convertendo Timestamps do Firestore para strings ISO.
 * @param {function} callback - Função a ser chamada com os dados dos eventos.
 * @returns {function} Uma função para cancelar a subscrição (unsubscribe).
 */
const get = (callback) => {
    const unsubscribe = onSnapshot(eventsCollection, (snapshot) => {
        const events = snapshot.docs.map(doc => {
            const data = doc.data();
            // Converte Timestamps para strings ISO para consistência
            const start = data.start?.toDate ? data.start.toDate().toISOString() : data.start;
            const end = data.end?.toDate ? data.end.toDate().toISOString() : data.end;
            return { id: doc.id, ...data, start, end };
        });
        callback(events);
    }, (error) => {
        console.error(`Erro ao buscar eventos em ${eventsCollectionPath}:`, error);
        callback([], error);
    });
    return unsubscribe;
};

const save = async (eventData, user) => {
    const dataToSave = {
        ...eventData,
        lastModifiedAt: serverTimestamp(),
        lastModifiedBy: user?.name || 'Sistema', // Garante que não quebra se o user for undefined e define um fallback.
    };

    if (dataToSave.id) {
        const docRef = doc(db, eventsCollectionPath, dataToSave.id);
        delete dataToSave.id; // Não guardar o ID dentro do documento
        await setDoc(docRef, dataToSave, { merge: true });
    } else {
        await addDoc(eventsCollection, dataToSave);
    }
};

const deleteEvent = async (eventId) => {
    await deleteDoc(doc(db, eventsCollectionPath, eventId));
};

export default { get, save, delete: deleteEvent };