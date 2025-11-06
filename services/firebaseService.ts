
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, Firestore } from 'firebase/firestore';
import { PlayerScore } from '../types';

// Configurazione di Firebase inserita direttamente nel codice per un funzionamento immediato.
const firebaseConfig = {
  apiKey: "AIzaSyDQHWZ_Z3Hfx6nX8a86ZxLpeRHg62ce8Is",
  authDomain: "gioco-metafonologia.firebaseapp.com",
  projectId: "gioco-metafonologia",
  storageBucket: "gioco-metafonologia.appspot.com",
  messagingSenderId: "197150231387",
  appId: "1:197150231387:web:87b2aff495f3fa3ae0287e",
};

let db: Firestore;

// Inizializzazione di Firebase
try {
    const app: FirebaseApp = initializeApp(firebaseConfig);
    db = getFirestore(app);
} catch (e) {
    console.error("Inizializzazione di Firebase fallita:", e);
}

const getScoresCollection = () => {
    if (!db) {
        throw new Error("Firebase non è stato inizializzato correttamente.");
    }
    return collection(db, 'scores');
}

export const saveScore = async (scoreData: Omit<PlayerScore, 'id' | 'date'>): Promise<void> => {
    const scoresCollection = getScoresCollection();
    await addDoc(scoresCollection, {
        ...scoreData,
        date: new Date().toISOString(),
    });
};

export const getScores = async (): Promise<PlayerScore[]> => {
    const scoresCollection = getScoresCollection();
    // Query aggiornata per ordinare prima per punteggio, poi per numero di parole
    const q = query(
        scoresCollection, 
        orderBy('score', 'desc'),
        orderBy('settings.wordCount', 'desc'),
        limit(25)
    );
    const querySnapshot = await getDocs(q);
    const scores: PlayerScore[] = [];
    querySnapshot.forEach((doc) => {
        scores.push({ id: doc.id, ...doc.data() } as PlayerScore);
    });
    return scores;
};
