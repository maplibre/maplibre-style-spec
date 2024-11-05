export class Projection {
    projection: string;
    interpolation;

    constructor(params: {projection: string} | { from: string; to: string; interpolation: number}) {
        
        if ('projection' in params) {
            this.projection = params.projection;
            this.interpolation = 1;
        } else {
            const {from, to, interpolation} = params;
            this.projection = `${from}-to-${to}`;
            this.interpolation = interpolation;
        }
    }

    toString(): string {
        return `["${this.projection}", ${this.interpolation}]`;
    }
}