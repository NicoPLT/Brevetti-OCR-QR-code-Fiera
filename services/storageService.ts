
import { db } from "../firebaseConfig";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, getDocs, where, writeBatch, deleteField } from "firebase/firestore";
import { BusinessCardData, Fiera } from "../types";

const CONTACTS_COLLECTION = "contacts";
const FIERAS_COLLECTION = "fieras";

// Helper ricorsivo per pulire i dati (rimuove undefined o li converte in null)
const sanitizeData = (data: any): any => {
  if (data === undefined) return null;
  if (data === null) return null;
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item));
  }
  
  if (typeof data === 'object') {
    const clean: any = {};
    Object.keys(data).forEach(key => {
      const value = data[key];
      // Ricorsione per oggetti annidati
      clean[key] = sanitizeData(value);
    });
    return clean;
  }
  
  return data;
};

// --- CONTACTS ---

export const subscribeToContacts = (onUpdate: (data: BusinessCardData[]) => void) => {
  const q = query(collection(db, CONTACTS_COLLECTION), orderBy("timestamp", "desc"));
  
  return onSnapshot(q, (snapshot) => {
    const contacts: BusinessCardData[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      contacts.push({
        ...data,
        id: doc.id,
        timestamp: data.timestamp?.toMillis ? data.timestamp.toMillis() : data.timestamp
      } as BusinessCardData);
    });
    onUpdate(contacts);
  }, (error) => {
    console.error("Errore sync Firestore:", error);
  });
};

export const addContact = async (contact: Omit<BusinessCardData, 'id'>) => {
  try {
    const cleanContact = sanitizeData(contact);
    // Timestamp generato lato client per semplicità, Firestore lo accetta come number
    const docRef = await addDoc(collection(db, CONTACTS_COLLECTION), {
      ...cleanContact,
      timestamp: Date.now()
    });
    return docRef.id;
  } catch (e) {
    console.error("Errore salvataggio:", e);
    throw e;
  }
};

export const updateContact = async (id: string, contact: Partial<BusinessCardData>) => {
  try {
    const contactRef = doc(db, CONTACTS_COLLECTION, id);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _, ...dataToUpdate } = contact as any;
    const cleanData = sanitizeData(dataToUpdate);
    
    await updateDoc(contactRef, {
      ...cleanData,
      timestamp: Date.now() 
    });
  } catch (e) {
    console.error("Errore aggiornamento:", e);
    throw e;
  }
};

export const deleteContact = async (id: string) => {
  try {
    await deleteDoc(doc(db, CONTACTS_COLLECTION, id));
  } catch (e) {
    console.error("Errore eliminazione:", e);
    throw e;
  }
};

export const batchImportContacts = async (contacts: BusinessCardData[]) => {
    const promises = contacts.map(c => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...data } = c;
        const cleanData = sanitizeData(data);
        return addDoc(collection(db, CONTACTS_COLLECTION), cleanData);
    });
    await Promise.all(promises);
};

// --- FIERAS / EVENTS ---

export const subscribeToFieras = (onUpdate: (data: Fiera[]) => void) => {
  const q = query(collection(db, FIERAS_COLLECTION), orderBy("timestamp", "desc"));
  
  return onSnapshot(q, (snapshot) => {
    const fieras: Fiera[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      fieras.push({
        ...data,
        id: doc.id,
        timestamp: data.timestamp?.toMillis ? data.timestamp.toMillis() : data.timestamp
      } as Fiera);
    });
    onUpdate(fieras);
  }, (error) => {
    console.error("Errore sync Fiere:", error);
  });
};

export const addFiera = async (name: string) => {
  try {
    const docRef = await addDoc(collection(db, FIERAS_COLLECTION), {
      name,
      timestamp: Date.now()
    });
    return docRef.id;
  } catch (e) {
    console.error("Errore creazione fiera:", e);
    throw e;
  }
};

export const deleteFiera = async (id: string) => {
  try {
    await deleteDoc(doc(db, FIERAS_COLLECTION, id));
  } catch (e) {
    console.error("Errore eliminazione fiera:", e);
    throw e;
  }
};

export const reassignContactsFiera = async (oldFieraId: string, newFieraId?: string) => {
  try {
    const q = query(collection(db, CONTACTS_COLLECTION), where("fieraId", "==", oldFieraId));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return;

    const batch = writeBatch(db);
    snapshot.docs.forEach((d) => {
      const ref = doc(db, CONTACTS_COLLECTION, d.id);
      if (newFieraId) {
        batch.update(ref, { fieraId: newFieraId });
      } else {
        batch.update(ref, { fieraId: deleteField() });
      }
    });
    
    await batch.commit();
  } catch (e) {
    console.error("Errore riassegnazione contatti:", e);
    throw e;
  }
};
