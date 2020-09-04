declare interface Array<T> {
    sumBy(by: string | ((el: T) => number)): number;
}

declare interface Number {
    round(digits: number): number;
}
