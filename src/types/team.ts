// src/types/team.ts

export interface Player {
    name: string;
    alts: string[];
}

export interface Team {
    id: number;
    name: string;
    players: Player[];
}

export interface TeamResponse {
    teams: {
        name: string;
        players: {
            name: string;
            alts: string[];
        }[];
    }[];
}