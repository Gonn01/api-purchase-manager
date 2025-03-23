export class Purchase {
    constructor({
        id,
        createdAt,
        finalizationDate,
        firstQuotaDate,
        ignored,
        image,
        amount,
        amountPerQuota,
        numberOfQuotas,
        payedQuotas,
        currencyType,
        name,
        type,
        fixesExpenses,
    }) {
        this.id = id;
        this.createdAt = createdAt;
        this.finalizationDate = finalizationDate;
        this.firstQuotaDate = firstQuotaDate;
        this.ignored = ignored;
        this.image = image;
        this.amount = amount;
        this.amountPerQuota = amountPerQuota;
        this.numberOfQuotas = numberOfQuotas;
        this.payedQuotas = payedQuotas;
        this.currencyType = currencyType;
        this.name = name;
        this.type = type;
        this.fixesExpenses = fixesExpenses;
    }

    static fromJson(json) {
        return new Purchase({
            id: parseInt(json.id),
            createdAt: new Date(json.created_at),
            finalizationDate: json.finalization_date ? new Date(json.finalization_date) : null,
            firstQuotaDate: json.first_quota_date ? new Date(json.first_quota_date) : null,
            ignored: !!json.ignored,
            image: json.image,
            amount: parseFloat(json.amount),
            amountPerQuota: parseFloat(json.amount_per_quota),
            numberOfQuotas: parseInt(json.number_of_quotas),
            payedQuotas: parseInt(json.payed_quotas),
            currencyType: CurrencyType.type(parseInt(json.currency_type)),
            name: json.name,
            type: PurchaseType.type(parseInt(json.type)),
            fixesExpenses: !!json.fixed_expense,
        });
    }

    copyWith({
        id,
        createdAt,
        finalizationDate,
        firstQuotaDate,
        ignored,
        image,
        amount,
        amountPerQuota,
        numberOfQuotas,
        payedQuotas,
        currencyType,
        name,
        type,
        fixesExpenses,
    }) {
        return new Purchase({
            id: id !== undefined ? id : this.id,
            createdAt: createdAt !== undefined ? createdAt : this.createdAt,
            finalizationDate: finalizationDate !== undefined ? finalizationDate : this.finalizationDate,
            firstQuotaDate: firstQuotaDate !== undefined ? firstQuotaDate : this.firstQuotaDate,
            ignored: ignored !== undefined ? ignored : this.ignored,
            image: image !== undefined ? image : this.image,
            amount: amount !== undefined ? amount : this.amount,
            amountPerQuota: amountPerQuota !== undefined ? amountPerQuota : this.amountPerQuota,
            numberOfQuotas: numberOfQuotas !== undefined ? numberOfQuotas : this.numberOfQuotas,
            payedQuotas: payedQuotas !== undefined ? payedQuotas : this.payedQuotas,
            currencyType: currencyType !== undefined ? currencyType : this.currencyType,
            name: name !== undefined ? name : this.name,
            type: type !== undefined ? type : this.type,
            fixesExpenses: fixesExpenses !== undefined ? fixesExpenses : this.fixesExpenses,
        });
    }
}

export const CurrencyType = {
    pesoArgentino: 0,
    usDollar: 1,
    euro: 2,

    type: function (value) {
        switch (value) {
            case 0:
                return this.pesoArgentino;
            case 1:
                return this.usDollar;
            case 2:
                return this.euro;
            default:
                throw new Error('Invalid currency type');
        }
    },

    getValue: function (currency) {
        switch (currency) {
            case this.pesoArgentino:
                return 0;
            case this.usDollar:
                return 1;
            case this.euro:
                return 2;
            default:
                throw new Error('Invalid currency type');
        }
    },
};

export const PurchaseType = {
    currentDebtorPurchase: 0,
    currentCreditorPurchase: 1,
    settledDebtorPurchase: 2,
    settledCreditorPurchase: 3,

    type: function (value) {
        switch (value) {
            case 0:
                return this.currentDebtorPurchase;
            case 1:
                return this.currentCreditorPurchase;
            case 2:
                return this.settledDebtorPurchase;
            case 3:
                return this.settledCreditorPurchase;
            default:
                throw new Error('Invalid purchase type');
        }
    },

    getValue: function (purchaseType) {
        switch (purchaseType) {
            case this.currentDebtorPurchase:
                return 0;
            case this.currentCreditorPurchase:
                return 1;
            case this.settledDebtorPurchase:
                return 2;
            case this.settledCreditorPurchase:
                return 3;
            default:
                throw new Error('Invalid purchase type');
        }
    },
};