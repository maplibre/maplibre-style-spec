export class ProjectionDefinition {
    readonly from: string;
    readonly to: string;
    readonly transition: number;

    constructor(from: string, to: string, transition: number){
        this.from = from;
        this.to = to;
        this.transition = transition;
    }

    static interpolate(from: string, to: string, t: number) {
        return new ProjectionDefinition(from, to, t);
    }

    static parse(input?: any): ProjectionDefinition {
        if (input instanceof ProjectionDefinition) {
            return input;
        }
        if (Array.isArray(input) && input.length === 3 && typeof input[0] === 'string' && typeof input[1] === 'string' && typeof input[2] === 'number') {
            return new ProjectionDefinition(input[0], input[1], input[2]);
        }

        if (typeof input === 'object' && typeof input.from === 'string' && typeof input.to === 'string' && typeof input.transition === 'number') {
            return new ProjectionDefinition(input.from, input.to, input.transition);
        }

        if (typeof input === 'string') {
            return new ProjectionDefinition(input, input, 1);
        }
        return undefined;
    }
}