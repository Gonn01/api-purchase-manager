export enum PurchaseTypeEnum {
    CurrentDebtorPurchase = 0,
    CurrentCreditorPurchase = 1,
    SettledDebtorPurchase = 2,
    SettledCreditorPurchase = 3,
}

export const PurchaseType = {
    type(value: number): PurchaseTypeEnum {
        switch (value) {
            case 0: return PurchaseTypeEnum.CurrentDebtorPurchase;
            case 1: return PurchaseTypeEnum.CurrentCreditorPurchase;
            case 2: return PurchaseTypeEnum.SettledDebtorPurchase;
            case 3: return PurchaseTypeEnum.SettledCreditorPurchase;
            default: throw new Error("Invalid purchase type");
        }
    },
    getValue(purchaseType: PurchaseTypeEnum): number {
        return purchaseType;
    },
};
