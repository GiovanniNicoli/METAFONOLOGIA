import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, Firestore } from 'firebase/firestore';
import { firebaseConfig } from '../firebaseConfig';
import { PlayerScore } from '../types';

let db: Firestore | null = null;

// A simple check to see if the config is a placeholder or not.
const isConfigured = firebaseConfig && firebaseConfig.apiKey && firebaseConfig.apiKey !== "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";

if (isConfigured) {
    try {
        const app: FirebaseApp = initializeApp(firebaseConfig);
        db = getFirestore(app);
    } catch (e) {
        console.error("Firebase initialization failed. Please check your firebaseConfig.ts:", e);
        // db remains null, and the app will show the "Firebase not configured" message.
    }
}

const getScoresCollection = () => {
    if (!db) {
        throw new Error("Firebase not configured.");
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
    const q = query(scoresCollection, orderBy('score', 'desc'), limit(20));
    const querySnapshot = await getDocs(q);
    const scores: PlayerScore[] = [];
    querySnapshot.forEach((doc) => {
        scores.push({ id: doc.id, ...doc.data() } as PlayerScore);
    });
    return scores;
};
