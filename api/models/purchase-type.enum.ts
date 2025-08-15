export enum PurchaseTypeEnum {
    CurrentDebtorPurchase = 0,
    CurrentCreditorPurchase = 1,
    SettledDebtorPurchase = 2,
    SettledCreditorPurchase = 3,
}

/** Conjunto de valores válidos (en runtime) */
const _validPurchaseTypes = new Set<number>([
    PurchaseTypeEnum.CurrentDebtorPurchase,
    PurchaseTypeEnum.CurrentCreditorPurchase,
    PurchaseTypeEnum.SettledDebtorPurchase,
    PurchaseTypeEnum.SettledCreditorPurchase,
]);

/** Type guard: ¿es un PurchaseTypeEnum válido? */
export function isPurchaseType(value: unknown): value is PurchaseTypeEnum {
    return typeof value === "number" && _validPurchaseTypes.has(value);
}

/** Parser seguro desde DB/JSON (lanza error si es inválido) */
export function parsePurchaseType(value: unknown): PurchaseTypeEnum {
    if (isPurchaseType(value)) return value;
    throw new Error("Invalid purchase type");
}

/** Para guardar en DB (por claridad semántica; es un number) */
export function toDbPurchaseType(value: PurchaseTypeEnum): number {
    return value; // ya es number
}
