export function makeProjection(projection: string) {
    return new Projection(projection, projection, 1);
}
export class Projection {

    from: Projection | string;
    to: Projection | string;
    transition: number;

    constructor(from: Projection | string, to: Projection | string, transition: number) {
        this.from = from;
        this.to = to;
        this.transition = transition;
    }

    
    // toString(): string {
    //     return `["${this.from.toString()}", "${this.to.toString()}", ${this.transition}]`;
    // }
}

