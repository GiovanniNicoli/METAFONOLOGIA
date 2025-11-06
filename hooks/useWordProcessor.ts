
import { useCallback } from 'react';
import { ActivityType } from '../types';

export const useWordProcessor = () => {
    const processWordList = useCallback((words: string[], activityType: ActivityType): string[] => {
        const transformWord = (word: string): string => {
            switch (activityType) {
                case ActivityType.DirectReversedWords:
                case ActivityType.InverseReversedWords:
                    return word.split('').reverse().join('');
                
                case ActivityType.DirectVowelInversion:
                case ActivityType.InverseVowelInversion: {
                    const vowels = word.match(/[aeiouàèéìòù]/gi);
                    if (vowels && vowels.length >= 2) {
                        const firstVowel = vowels[0];
                        const lastVowel = vowels[vowels.length - 1];
                        let firstReplaced = false;
                        let lastReplaced = false;
                        let vowelCopy = [...vowels];
                        return word.split('').map(char => {
                            if (/[aeiouàèéìòù]/i.test(char)) {
                                if (vowelCopy[0] === firstVowel && !firstReplaced) {
                                    firstReplaced = true;
                                    vowelCopy.shift();
                                    return lastVowel;
                                }
                                if (vowelCopy[vowelCopy.length-1] === lastVowel && !lastReplaced) {
                                   let isLastOccurrence = word.lastIndexOf(lastVowel) === word.indexOf(char, word.lastIndexOf(lastVowel));
                                   if (isLastOccurrence) {
                                       lastReplaced = true;
                                       vowelCopy.pop();
                                       return firstVowel;
                                   }
                                }
                                return vowelCopy.shift() || char;
                            }
                            return char;
                        }).join('');

                    }
                    return word;
                }
                
                case ActivityType.DirectRecovery:
                case ActivityType.InverseRecovery:
                default:
                    return word;
            }
        };

        const processedWords = words.map(transformWord);

        if (activityType === ActivityType.InverseRecovery || 
            activityType === ActivityType.InverseReversedWords ||
            activityType === ActivityType.InverseVowelInversion) {
            return processedWords.slice().reverse();
        }

        return processedWords;
    }, []);

    return { processWordList };
};
