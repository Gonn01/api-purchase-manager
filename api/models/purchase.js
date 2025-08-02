
export class Purchase {
    constructor({ id, created_at, finalization_date, first_quota_date, ignored, image, amount, amount_per_quota, number_of_quotas, payed_quotas, currency_type, name, type, fixed_expense, logs = [] }) {
        this.id = id;
        this.created_at = created_at;
        this.finalization_date = finalization_date;
        this.first_quota_date = first_quota_date;
        this.ignored = ignored;
        this.image = image;
        this.amount = amount;
        this.amount_per_quota = amount_per_quota;
        this.number_of_quotas = number_of_quotas;
        this.payed_quotas = payed_quotas;
        this.currency_type = currency_type;
        this.name = name;
        this.type = type;
        this.fixed_expense = fixed_expense;
        this.logs = logs;
    }

    static fromJson(json) {
        return new Purchase({
            id: parseInt(json.id),
            created_at: new Date(json.created_at),
            finalization_date: json.finalization_date ? new Date(json.finalization_date) : null,
            first_quota_date: json.first_quota_date ? new Date(json.first_quota_date) : null,
            ignored: !!json.ignored,
            image: json.image,
            amount: parseFloat(json.amount),
            amount_per_quota: parseFloat(json.amount_per_quota),
            number_of_quotas: parseInt(json.number_of_quotas),
            payed_quotas: parseInt(json.payed_quotas),
            currency_type: currency_type.type(parseInt(json.currency_type)),
            name: json.name,
            type: PurchaseType.type(parseInt(json.type)),
            fixed_expense: !!json.fixed_expense,
            logs: json.logs ? json.logs.map(e => PurchaseLog.fromJson(e)) : [],
        });
    }

    copyWith({ id, created_at, finalization_date, first_quota_date, ignored, image, amount, amount_per_quota, number_of_quotas, payed_quotas, currency_type, name, type, fixed_expense, logs }) {
        return new Purchase({
            id: id !== undefined ? id : this.id,
            created_at: created_at !== undefined ? created_at : this.created_at,
            finalization_date: finalization_date !== undefined ? finalization_date : this.finalization_date,
            first_quota_date: first_quota_date !== undefined ? first_quota_date : this.first_quota_date,
            ignored: ignored !== undefined ? ignored : this.ignored,
            image: image !== undefined ? image : this.image,
            amount: amount !== undefined ? amount : this.amount,
            amount_per_quota: amount_per_quota !== undefined ? amount_per_quota : this.amount_per_quota,
            number_of_quotas: number_of_quotas !== undefined ? number_of_quotas : this.number_of_quotas,
            payed_quotas: payed_quotas !== undefined ? payed_quotas : this.payed_quotas,
            currency_type: currency_type !== undefined ? currency_type : this.currency_type,
            name: name !== undefined ? name : this.name,
            type: type !== undefined ? type : this.type,
            fixed_expense: fixed_expense !== undefined ? fixed_expense : this.fixed_expense,
            logs: logs !== undefined ? logs : this.logs,
        });
    }
}

export const currency_type = {
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