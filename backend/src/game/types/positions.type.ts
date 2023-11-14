export type Positions = {
    positionX: number
    positionY: number
}

export type Player = {
    id: string
    soketId: string
    pos: Positions
}

export type GameData = {
    matchId: string
    pos: Positions
    userId: string
}

export type ConsultData = {
    matchId: string
    userId: string
}