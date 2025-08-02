export enum CurrencyType {
    PesoArgentino = 0,
    UsDollar = 1,
    Euro = 2,
}
export const currency_type = {
    type(value: number): CurrencyType {
        switch (value) {
            case 0: return CurrencyType.PesoArgentino;
            case 1: return CurrencyType.UsDollar;
            case 2: return CurrencyType.Euro;
            default: throw new Error("Invalid currency type");
        }
    },
    getValue(currency: CurrencyType): number {
        return currency;
    },
};