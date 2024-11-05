export class Projection {
    
    projection: string;
    
    constructor(projection: string) {
        this.projection = projection;
    }

    toString(): string {
        return this.projection;
    }
}

export class ProjectionTransition {

    from: Projection;
    to: Projection;
    interpolation: number;

    constructor(from: Projection, to: Projection, interpolation: number) {
        this.from = from;
        this.to = to;
        this.interpolation = interpolation;
    }

    toString(): string {
        return `["${this.from}", "${this.to}", ${this.interpolation}]`;
    }
}