export class ProjectionDefinition {
    constructor(public from: string, public to: string, public transition: number){
        this.from = from;
        this.to = to;
        this.transition = transition;
    }
    
    toString() {
        return `["${this.from}", "${this.to}", ${this.transition}]`;
    }

    toJSON() {
        return [this.from, this.to, this.transition];
    }

    static interpolate(from: string, to: string, t: number) {
        return new ProjectionDefinition(from, to, t);
    }

    static parse(input?: any): ProjectionDefinition {
        if (input instanceof ProjectionDefinition) {
            return input;
        }
        if (Array.isArray(input) && input.length === 3) {
            return new ProjectionDefinition(input[0], input[1], input[2]);
        }
        if (typeof input === 'string') {
            return new ProjectionDefinition(input, input, 1);
        }
        return undefined;
    }
}