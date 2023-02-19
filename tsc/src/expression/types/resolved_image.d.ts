export type ResolvedImageOptions = {
    name: string;
    available: boolean;
};
export default class ResolvedImage {
    name: string;
    available: boolean;
    constructor(options: ResolvedImageOptions);
    toString(): string;
    static fromString(name: string): ResolvedImage | null;
}
