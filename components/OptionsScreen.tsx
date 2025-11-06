
import React, { useState, FormEvent, ChangeEvent } from 'react';
import { GameOptions, ActivityType, PresentationMode, WordType } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import SelectInput from './common/SelectInput';
import NumberInput from './common/NumberInput';

interface OptionsScreenProps {
    onStart: (options: GameOptions) => void;
    onViewLeaderboard: () => void;
}

const OptionsScreen: React.FC<OptionsScreenProps> = ({ onStart, onViewLeaderboard }) => {
    const [options, setOptions] = useState<Omit<GameOptions, 'playerName'>>({
        activityType: ActivityType.DirectRecovery,
        presentationMode: PresentationMode.Written,
        wordCount: 5,
        wordType: WordType.Bisillabi,
        listRepetitions: 3,
        presentationTime: 2000,
        writingTime: 5000,
    });
    const [playerName, setPlayerName] = useState('');

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setOptions(prev => ({
            ...prev,
            [name]: e.target.type === 'number' ? parseInt(value, 10) : value,
        }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (playerName.trim()) {
            onStart({ ...options, playerName: playerName.trim() });
        } else {
            alert('Per favore, inserisci il tuo nome.');
        }
    };

    return (
        <Card className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-indigo-600 dark:text-indigo-400">Training di Metafonologia</h1>
                <p className="mt-2 text-slate-600 dark:text-slate-400">Seleziona le opzioni per iniziare</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="playerName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Il tuo Nome</label>
                    <input
                        type="text"
                        id="playerName"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        className="block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Mario Rossi"
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SelectInput label="Tipo di Attività" name="activityType" value={options.activityType} onChange={handleChange}>
                        <option value={ActivityType.DirectRecovery}>Recupero Diretto</option>
                        <option value={ActivityType.InverseRecovery}>Recupero Inverso</option>
                        <option value={ActivityType.DirectReversedWords}>Recupero Diretto con Parole al Contrario</option>
                        <option value={ActivityType.InverseReversedWords}>Recupero Inverso con Parole al Contrario</option>
                        <option value={ActivityType.DirectVowelInversion}>Recupero Diretto con Inversione Vocali</option>
                        <option value={ActivityType.InverseVowelInversion}>Recupero Inverso con Inversione Vocali</option>
                    </SelectInput>

                    <SelectInput label="Modalità di Presentazione" name="presentationMode" value={options.presentationMode} onChange={handleChange}>
                        <option value={PresentationMode.Written}>Scritta</option>
                        <option value={PresentationMode.Auditory}>Uditiva</option>
                    </SelectInput>

                    <SelectInput label="Tipologia di Parole" name="wordType" value={options.wordType} onChange={handleChange}>
                        <option value={WordType.Bisillabi}>Bisillabi</option>
                        <option value={WordType.Trisillabi}>Trisillabi</option>
                        <option value={WordType.Quadrisillabi}>Quadrisillabi</option>
                        <option value={WordType.Pentasillabi}>Pentasillabi</option>
                        <option value={WordType.Frasi}>Frasi</option>
                        <option value={WordType.Mista}>Mista</option>
                    </SelectInput>

                    <NumberInput label="Parole per Lista" name="wordCount" value={options.wordCount} onChange={handleChange} min="1" max="10" />
                    
                    <NumberInput label="Numero di Liste" name="listRepetitions" value={options.listRepetitions} onChange={handleChange} min="1" max="20" />
                    
                    <NumberInput label="Tempo di Presentazione" name="presentationTime" value={options.presentationTime} onChange={handleChange} min="500" step="100" unit="ms" disabled={options.presentationMode === PresentationMode.Auditory} />
                    
                    <NumberInput label="Tempo per Risposta" name="writingTime" value={options.writingTime} onChange={handleChange} min="1000" step="500" unit="ms" />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button type="submit" className="w-full">Avvia il Compito</Button>
                    <Button type="button" variant="secondary" onClick={onViewLeaderboard} className="w-full">Classifica</Button>
                </div>
            </form>
        </Card>
    );
};

export default OptionsScreen;
