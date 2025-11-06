import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameOptions, Result, WordType } from '../types';
import { wordLists } from '../constants';
import { useWordProcessor } from '../hooks/useWordProcessor';
import Card from './common/Card';
import Button from './common/Button';

interface TaskScreenProps {
    options: GameOptions;
    onEnd: (results: Result[], score: number) => void;
    onBack: () => void;
}

type GameState = 'presenting' | 'writing' | 'feedback' | 'finished';

const positiveReinforcements = [
    'Eccellente!',
    'Fantastico!',
    'Ottimo lavoro!',
    'Perfetto!',
    'Continua così!',
    'Grande!',
    'Molto bene!',
    'Incredibile!',
    'Sei un campione!',
];

const TaskScreen: React.FC<TaskScreenProps> = ({ options, onEnd, onBack }) => {
    const [currentListIndex, setCurrentListIndex] = useState(0);
    const [currentWords, setCurrentWords] = useState<string[]>([]);
    const [displayedWord, setDisplayedWord] = useState('');
    const [gameState, setGameState] = useState<GameState>('presenting');
    const [userInput, setUserInput] = useState('');
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [isCorrect, setIsCorrect] = useState(false);
    const [timeLeft, setTimeLeft] = useState(options.writingTime / 1000);
    const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

    const scoreRef = useRef(0);
    const resultsRef = useRef<Result[]>([]);
    const writingStartTimeRef = useRef(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const { processWordList } = useWordProcessor();

    useEffect(() => {
        const getVoices = () => {
            const voices = speechSynthesis.getVoices();
            if (voices.length === 0) return;
            const italianVoice = 
                voices.find(voice => voice.lang === 'it-IT' && /Female|Donna/i.test(voice.name) && voice.localService) ||
                voices.find(voice => voice.lang === 'it-IT' && /Alice|Federica|Paola|Elsa/i.test(voice.name)) ||
                voices.find(voice => voice.lang === 'it-IT' && voice.localService) ||
                voices.find(voice => voice.lang === 'it-IT');
            setSelectedVoice(italianVoice || null);
        };

        speechSynthesis.addEventListener('voiceschanged', getVoices);
        getVoices();

        return () => {
            speechSynthesis.removeEventListener('voiceschanged', getVoices);
            speechSynthesis.cancel();
        };
    }, []);

    const generateWordList = useCallback(() => {
        const sourceList = wordLists[options.wordType];
        const selectedWords: string[] = [];
        const usedIndices = new Set<number>();
        for (let i = 0; i < options.wordCount; i++) {
            let randomIndex;
            do {
                randomIndex = Math.floor(Math.random() * sourceList.length);
            } while (usedIndices.has(randomIndex));
            usedIndices.add(randomIndex);
            selectedWords.push(sourceList[randomIndex]);
        }
        return selectedWords;
    }, [options.wordCount, options.wordType]);
    
    const startNextList = useCallback(() => {
        speechSynthesis.cancel();
        setUserInput('');
        setFeedbackMessage('');
        const words = generateWordList();
        setCurrentWords(words);
        setGameState('presenting');
    }, [generateWordList]);

    useEffect(() => {
        if (currentListIndex < options.listRepetitions) {
            startNextList();
        } else {
            setGameState('finished');
        }
    }, [currentListIndex, options.listRepetitions, startNextList]);
    
    useEffect(() => {
      if (gameState === 'finished') {
        onEnd(resultsRef.current, scoreRef.current);
      }
    }, [gameState, onEnd]);

    useEffect(() => {
        if (gameState === 'presenting' && currentWords.length > 0) {
            if (options.presentationMode === 'scritta') {
                let wordIndex = 0;
                const interval = setInterval(() => {
                    if (wordIndex < currentWords.length) {
                        setDisplayedWord(currentWords[wordIndex].toUpperCase());
                        wordIndex++;
                    } else {
                        clearInterval(interval);
                        setDisplayedWord('');
                        setGameState('writing');
                    }
                }, options.presentationTime);
                return () => clearInterval(interval);
            } else { // 'uditiva'
                let wordIndex = 0;
                const speak = () => {
                    if (wordIndex < currentWords.length) {
                        const utterance = new SpeechSynthesisUtterance(currentWords[wordIndex]);
                        if (selectedVoice) utterance.voice = selectedVoice;
                        utterance.lang = 'it-IT';
                        utterance.rate = 0.9;
                        utterance.onend = () => {
                            wordIndex++;
                            setTimeout(speak, 500); // Pause between words
                        };
                        speechSynthesis.speak(utterance);
                    } else {
                        setGameState('writing');
                    }
                };
                speak();
            }
        }
    }, [gameState, currentWords, options.presentationMode, options.presentationTime, selectedVoice]);

    useEffect(() => {
        if (gameState === 'writing') {
            setTimeLeft(options.writingTime / 1000);
            writingStartTimeRef.current = performance.now();
            inputRef.current?.focus();
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        handleUserInputSubmit();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameState, options.writingTime]);

    const handleUserInputSubmit = useCallback(() => {
        if (gameState !== 'writing') return;
        
        const timeUsed = performance.now() - writingStartTimeRef.current;
        
        const userWords = options.wordType === WordType.Frasi
            ? userInput.trim().split(';').map(s => s.trim())
            : userInput.trim().split(' ').filter(Boolean);

        const correctSequence = processWordList(currentWords, options.activityType);
        
        const correctSequenceString = correctSequence.map(w => w.toUpperCase()).join(options.wordType === WordType.Frasi ? ';' : ' ');
        const userResponseString = userWords.map(w => w.toUpperCase()).join(options.wordType === WordType.Frasi ? ';' : ' ');

        const isResponseCorrect = userResponseString === correctSequenceString;
        
        setIsCorrect(isResponseCorrect);
        if (isResponseCorrect) {
            const reinforcement = positiveReinforcements[Math.floor(Math.random() * positiveReinforcements.length)];
            setFeedbackMessage(reinforcement);
            scoreRef.current += 1;
             if (options.presentationMode === 'uditiva') {
                const utterance = new SpeechSynthesisUtterance(reinforcement);
                if (selectedVoice) utterance.voice = selectedVoice;
                utterance.lang = 'it-IT';
                speechSynthesis.speak(utterance);
            }
        } else {
            const feedbackText = `Sbagliato! La sequenza corretta era: ${correctSequence.join(' ')}`;
            setFeedbackMessage(feedbackText);
            if (options.presentationMode === 'uditiva') {
                const utterance = new SpeechSynthesisUtterance("Non esattamente. La risposta corretta era...");
                if (selectedVoice) utterance.voice = selectedVoice;
                utterance.lang = 'it-IT';
                utterance.onend = () => {
                    const correctSequenceUtterance = new SpeechSynthesisUtterance(correctSequence.join(', '));
                    if (selectedVoice) correctSequenceUtterance.voice = selectedVoice;
                    correctSequenceUtterance.lang = 'it-IT';
                    correctSequenceUtterance.rate = 0.8;
                    speechSynthesis.speak(correctSequenceUtterance);
                };
                speechSynthesis.speak(utterance);
            }
        }

        resultsRef.current.push({
            stimulus: currentWords.join(' '),
            response: userInput,
            correct: isResponseCorrect,
            timeUsed: timeUsed / 1000
        });
        
        setGameState('feedback');
    }, [gameState, userInput, currentWords, options.activityType, options.wordType, processWordList, options.presentationMode, selectedVoice]);

    const handleNext = () => {
        setCurrentListIndex(prev => prev + 1);
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleUserInputSubmit();
        }
    };
    
    return (
        <Card className="flex flex-col items-center justify-center min-h-[500px]">
            <div className="w-full flex justify-between items-start mb-4">
              <span className="text-lg font-semibold">Lista {Math.min(currentListIndex + 1, options.listRepetitions)} / {options.listRepetitions}</span>
              <Button onClick={onBack} variant="secondary" size-sm>Indietro</Button>
            </div>

            <div className="flex-grow flex flex-col items-center justify-center w-full text-center">
                {gameState === 'presenting' && (
                    <div className="text-5xl md:text-7xl font-bold text-indigo-600 dark:text-indigo-400 animate-pulse">
                        {options.presentationMode === 'scritta' ? displayedWord : 'Ascolta...'}
                    </div>
                )}

                {gameState === 'writing' && (
                    <div className="w-full max-w-xl">
                        <label htmlFor="userInput" className="block text-xl font-medium mb-4">
                            Riscrivi la sequenza:
                        </label>
                        <input
                            ref={inputRef}
                            id="userInput"
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full p-4 text-2xl text-center border-2 border-slate-300 dark:border-slate-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800"
                        />
                        {options.wordType === WordType.Frasi && (
                           <p className="text-sm text-slate-500 mt-2">Per le frasi, separare con punto e virgola (;)</p>
                        )}
                        <div className="mt-4 text-lg font-mono">Tempo rimanente: {timeLeft}s</div>
                    </div>
                )}
                
                {gameState === 'feedback' && (
                    <div className="flex flex-col items-center gap-6">
                        <p className={`text-3xl font-bold ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                            {feedbackMessage}
                        </p>
                        <Button onClick={handleNext}>
                            {currentListIndex + 1 < options.listRepetitions ? 'Prossima Lista' : 'Vai ai Risultati'}
                        </Button>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default TaskScreen;