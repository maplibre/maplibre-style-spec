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

    projection: string;
    interpolation;

    constructor(from: Projection, to: Projection, interpolation: number) {
        
        this.projection = `${from}-to-${to}`;
        this.interpolation = interpolation;

    }

    toString(): string {
        return `["${this.projection}", ${this.interpolation}]`;
    }
}