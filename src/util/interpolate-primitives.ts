export function interpolateNumber(from: number, to: number, t: number): number {
    return from + t * (to - from);
}

export function interpolateArray<T extends number[]>(from: T, to: T, t: number): T {
    return from.map((d, i) => {
        return interpolateNumber(d, to[i], t);
    }) as T;
}
