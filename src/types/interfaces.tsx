export interface Pic {
    name: string,
    path: string,
    timestamp?: number,
    caseName: string
}

export interface PicFilterResult {
    pic: Pic,
    index: number
}


export class CaseExistsError extends Error {
    constructor(message: string) {
        super(message); 
        this.name = "CaseExistsError";
    }
}