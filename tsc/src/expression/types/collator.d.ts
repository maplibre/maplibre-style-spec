declare class Intl$Collator {
    constructor(locales?: string | string[], options?: CollatorOptions);
    compare(a: string, b: string): number;
    resolvedOptions(): any;
}
type CollatorOptions = {
    localeMatcher?: 'lookup' | 'best fit';
    usage?: 'sort' | 'search';
    sensitivity?: 'base' | 'accent' | 'case' | 'variant';
    ignorePunctuation?: boolean;
    numeric?: boolean;
    caseFirst?: 'upper' | 'lower' | 'false';
};
export default class Collator {
    locale: string | null;
    sensitivity: 'base' | 'accent' | 'case' | 'variant';
    collator: Intl$Collator;
    constructor(caseSensitive: boolean, diacriticSensitive: boolean, locale: string | null);
    compare(lhs: string, rhs: string): number;
    resolvedLocale(): string;
}
export {};
