
import React from 'react';
import { Result, GameOptions } from '../types';
import Card from './common/Card';
import Button from './common/Button';

interface SummaryScreenProps {
    results: Result[];
    options: GameOptions;
    finalScore: number;
    onSaveToLeaderboard: () => void;
    onPlayAgain: () => void;
    onViewLeaderboard: () => void;
}

const SummaryScreen: React.FC<SummaryScreenProps> = ({ results, options, finalScore, onSaveToLeaderboard, onPlayAgain, onViewLeaderboard }) => {
    
    const downloadCSV = () => {
        let csvContent = "data:text/csv;charset=utf-8,Stimulus,Response,Correct,TimeUsed(s)\n";
        results.forEach(row => {
            csvContent += `"${row.stimulus}","${row.response}",${row.correct ? 1 : 0},${row.timeUsed.toFixed(2)}\n`;
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `risultati_${options.playerName}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const percentageScore = Math.round((finalScore / options.listRepetitions) * 100);

    return (
        <Card className="text-center">
            <h1 className="text-3xl font-bold mb-4">Risultato Finale</h1>
            <p className="text-xl mb-2">
                Bravo, <span className="font-semibold text-indigo-600 dark:text-indigo-400">{options.playerName}</span>!
            </p>
            <p className="text-5xl font-bold my-6">
                {finalScore} / {options.listRepetitions}
            </p>
            <p className="text-2xl mb-8">Punteggio: <span className="font-bold text-indigo-600 dark:text-indigo-400">{percentageScore}%</span></p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 flex-wrap">
                <Button onClick={onSaveToLeaderboard}>Salva e vedi Classifica</Button>
                <Button onClick={downloadCSV} variant="secondary">Scarica Risultati (CSV)</Button>
                <Button onClick={onPlayAgain} variant="secondary">Gioca Ancora</Button>
                <Button onClick={onViewLeaderboard} variant="secondary">Classifica</Button>
            </div>
        </Card>
    );
};

export default SummaryScreen;
