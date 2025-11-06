import React, { useState, useEffect } from 'react';
import { getScores } from '../services/firebaseService';
import { PlayerScore, ActivityType, PresentationMode, WordType } from '../types';
import Card from './common/Card';
import Button from './common/Button';

const activityTypeMap: Record<ActivityType, string> = {
    [ActivityType.DirectRecovery]: "Recupero Diretto",
    [ActivityType.InverseRecovery]: "Recupero Inverso",
    [ActivityType.DirectReversedWords]: "Diretto Parole Contrarie",
    [ActivityType.InverseReversedWords]: "Inverso Parole Contrarie",
    [ActivityType.DirectVowelInversion]: "Diretto Inversione Vocali",
    [ActivityType.InverseVowelInversion]: "Inverso Inversione Vocali",
};

const wordTypeMap: Record<WordType, string> = {
    [WordType.Bisillabi]: "Bisillabi",
    [WordType.Trisillabi]: "Trisillabi",
    [WordType.Quadrisillabi]: "Quadrisillabi",
    [WordType.Pentasillabi]: "Pentasillabi",
    [WordType.Frasi]: "Frasi",
    [WordType.Mista]: "Mista",
};

const presentationModeMap: Record<PresentationMode, string> = {
    [PresentationMode.Written]: "Scritta",
    [PresentationMode.Auditory]: "Uditiva",
};

const LeaderboardScreen: React.FC<{ onGoHome: () => void }> = ({ onGoHome }) => {
    const [scores, setScores] = useState<PlayerScore[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchScores = async () => {
            try {
                setLoading(true);
                setError(null);
                const fetchedScores = await getScores();
                setScores(fetchedScores);
            } catch (err: any) {
                console.error(err);
                if (err.message === "Firebase not configured.") {
                    setError("La configurazione di Firebase è mancante o non valida. Aggiungi le tue credenziali nel file `firebaseConfig.ts` per abilitare la classifica.");
                } else {
                    setError("Impossibile caricare la classifica. Assicurati che l'indice di Firestore sia stato creato. Se l'errore persiste, controlla la console per un link per crearlo.");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchScores();
    }, []);

    return (
        <Card>
            <h1 className="text-3xl font-bold text-center mb-6">Classifica Globale</h1>
            {loading ? (
                <p className="text-center text-slate-500 py-8">Caricamento classifica...</p>
            ) : error ? (
                 <div className="text-center text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                    <p className="font-semibold">Azione Richiesta</p>
                    <p className="text-sm mt-1">{error}</p>
                </div>
            ) : scores.length > 0 ? (
                <div className="space-y-3">
                    {scores.map((score, index) => (
                        <div key={score.id} className="p-4 rounded-lg bg-slate-100 dark:bg-slate-700/50 transition-all duration-300 ease-in-out">
                            <div className="flex items-center justify-between">
                                <div className="flex items-start gap-4">
                                    <span className="text-xl font-bold w-8 text-center text-slate-500">{index + 1}.</span>
                                    <div>
                                        <p className="font-bold text-lg text-indigo-600 dark:text-indigo-400">{score.name}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(score.date).toLocaleString('it-IT')}</p>
                                    </div>
                                </div>
                                <span className="text-3xl font-bold text-slate-800 dark:text-slate-200">{score.score}%</span>
                            </div>
                            <div className="mt-3 pl-12 flex flex-wrap gap-2 text-xs">
                                <span className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 px-2 py-1 rounded-full">{activityTypeMap[score.settings.activityType]}</span>
                                <span className="bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300 px-2 py-1 rounded-full">{score.settings.wordCount} {wordTypeMap[score.settings.wordType]}</span>
                                <span className="bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300 px-2 py-1 rounded-full">{presentationModeMap[score.settings.presentationMode]}</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-slate-500 py-8">Nessun punteggio ancora. Gioca per entrare in classifica!</p>
            )}
            <div className="mt-8 text-center">
                <Button onClick={onGoHome} variant="secondary">Torna alla Home</Button>
            </div>
        </Card>
    );
};

export default LeaderboardScreen;