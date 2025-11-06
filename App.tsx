import React, { useState, useCallback } from 'react';
import OptionsScreen from './components/OptionsScreen';
import TaskScreen from './components/TaskScreen';
import SummaryScreen from './components/SummaryScreen';
import LeaderboardScreen from './components/LeaderboardScreen';
import { Page, GameOptions, Result } from './types';
import { saveScore } from './services/firebaseService';

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>(Page.Options);
    const [gameOptions, setGameOptions] = useState<GameOptions | null>(null);
    const [results, setResults] = useState<Result[]>([]);
    const [finalScore, setFinalScore] = useState(0);

    const handleStartGame = (options: GameOptions) => {
        setGameOptions(options);
        setResults([]);
        setFinalScore(0);
        setCurrentPage(Page.Task);
    };

    const handleGameEnd = (finalResults: Result[], score: number) => {
        setResults(finalResults);
        setFinalScore(score);
        setCurrentPage(Page.Summary);
    };

    const handleSaveToLeaderboard = useCallback(async () => {
        if (gameOptions) {
            const percentageScore = Math.round((finalScore / gameOptions.listRepetitions) * 100);
            const { playerName, ...settings } = gameOptions;
            try {
                await saveScore({
                    name: playerName,
                    score: percentageScore,
                    settings: {
                        activityType: settings.activityType,
                        presentationMode: settings.presentationMode,
                        wordCount: settings.wordCount,
                        wordType: settings.wordType,
                        listRepetitions: settings.listRepetitions,
                    }
                });
                setCurrentPage(Page.Leaderboard);
            } catch (error: any) {
                console.error("Failed to save score to Firebase:", error);
                if (error.message === "Firebase not configured.") {
                    alert("Impossibile salvare il punteggio: la configurazione di Firebase è mancante. Controlla il file `firebaseConfig.ts`.");
                } else {
                    alert("Impossibile salvare il punteggio. Controlla la console per i dettagli.");
                }
            }
        }
    }, [finalScore, gameOptions]);

    const handlePlayAgain = () => {
        setCurrentPage(Page.Options);
    };

    const handleViewLeaderboard = () => {
        setCurrentPage(Page.Leaderboard);
    };
    
    const handleGoHome = () => {
        setCurrentPage(Page.Options);
    };

    const renderPage = () => {
        switch (currentPage) {
            case Page.Task:
                return gameOptions && <TaskScreen options={gameOptions} onEnd={handleGameEnd} onBack={handleGoHome} />;
            case Page.Summary:
                return (
                    <SummaryScreen
                        results={results}
                        options={gameOptions!}
                        finalScore={finalScore}
                        onSaveToLeaderboard={handleSaveToLeaderboard}
                        onPlayAgain={handlePlayAgain}
                        onViewLeaderboard={handleViewLeaderboard}
                    />
                );
            case Page.Leaderboard:
                return <LeaderboardScreen onGoHome={handleGoHome} />;
            case Page.Options:
            default:
                return <OptionsScreen onStart={handleStartGame} onViewLeaderboard={handleViewLeaderboard} />;
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <main className="w-full max-w-4xl mx-auto">
                {renderPage()}
            </main>
        </div>
    );
};

export default App;