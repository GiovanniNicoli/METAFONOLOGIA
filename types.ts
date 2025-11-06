export enum ActivityType {
    DirectRecovery = 'recupero-diretto',
    InverseRecovery = 'recupero-inverso',
    DirectReversedWords = 'recupero-diretto-parole-contrario',
    InverseReversedWords = 'recupero-inverso-parole-contrario',
    DirectVowelInversion = 'recupero-diretto-inversione-vocali',
    InverseVowelInversion = 'recupero-inverso-inversione-vocali',
}

export enum PresentationMode {
    Written = 'scritta',
    Auditory = 'uditiva',
}

export enum WordType {
    Bisillabi = 'bisillabi',
    Trisillabi = 'trisillabi',
    Quadrisillabi = 'quadrisillabi',
    Pentasillabi = 'pentasillabi',
    Frasi = 'frasi',
    Mista = 'mista',
}

export enum Page {
    Options,
    Task,
    Summary,
    Leaderboard,
}

export interface GameOptions {
    playerName: string;
    activityType: ActivityType;
    presentationMode: PresentationMode;
    wordCount: number;
    wordType: WordType;
    listRepetitions: number;
    presentationTime: number;
    writingTime: number;
}

export interface Result {
    stimulus: string;
    response: string;
    correct: boolean;
    timeUsed: number;
}

export interface PlayerScore {
    id?: string;
    name: string;
    score: number;
    date: string;
    settings: {
        activityType: ActivityType;
        presentationMode: PresentationMode;
        wordCount: number;
        wordType: WordType;
        listRepetitions: number;
    };
}