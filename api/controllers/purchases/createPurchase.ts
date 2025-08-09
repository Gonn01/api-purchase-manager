import { executeQuery } from "../../db";
import { PurchaseHomeDto } from "../../dtos/home/PurchaseHomeDto";
import { PurchaseCreateRequestDto } from "../../dtos/purchases/PurchaseCreateRequestDto";
import { logPurple } from "../../functions/logsCustom";
import CustomException from "../../models/CustomException";

export async function createPurchase(
    data: PurchaseCreateRequestDto,
    userId: number
): Promise<PurchaseHomeDto> {

    const fixed = Boolean(data.fixed_expense);

    let numberOfQuotas =
        fixed ? 0 : (data.number_of_quotas ?? 0);

    let payedQuotas =
        fixed ? 0 : Math.max(0, Math.min(data.payed_quotas ?? 0, numberOfQuotas));

    let amountPerQuota: number | null = null;

    if (!fixed && numberOfQuotas > 0) {
        amountPerQuota =
            Number((data.amount / numberOfQuotas).toFixed(2));
    }

    const image = data.image ?? null;

    const ignored = Boolean(data.ignored ?? false);

    // 2) Verifico que la FE exista, sea del usuario y no esté borrada
    const feCheck = `
    SELECT id FROM financial_entities
    WHERE id = $1 AND user_id = $2 AND deleted = false
    LIMIT 1
  `;
    const feRes = await executeQuery(feCheck, [data.financial_entity_id, userId], true);
    if (feRes.length === 0) {
        throw new CustomException({
            title: "Entidad financiera inválida",
            message: "La entidad no existe o no pertenece al usuario.",
        });
    }

    // 3) Inserto purchase
    const insert = `
    INSERT INTO purchases (
      name,
      amount,
      amount_per_quota,
      number_of_quotas,
      payed_quotas,
      currency_type,
      type,
      fixed_expense,
      finalization_date,
      image,
      ignored,
      financial_entity_id,
      deleted
    )
    VALUES (
      $1,  -- name
      $2,  -- amount
      $3,  -- amount_per_quota
      $4,  -- number_of_quotas
      $5,  -- payed_quotas
      $6,  -- currency_type
      $7,  -- type
      $8,  -- fixed_expense
      NULL, -- finalization_date (se seteará cuando corresponda)
      $9, -- image
      $10, -- ignored
      $11, -- financial_entity_id
      false
    )
    RETURNING
      id, name, amount, amount_per_quota, number_of_quotas, payed_quotas,
      currency_type, type, fixed_expense,  finalization_date,
      image, ignored, financial_entity_id
  `;

    const params = [
        data.name.trim(),
        data.amount,
        amountPerQuota,
        numberOfQuotas,
        payedQuotas,
        data.currency_type,
        data.type,
        fixed,
        image,
        ignored,
        data.financial_entity_id,
    ];
    logPurple(`Creating purchase with params: ${JSON.stringify(params)}`);
    const res = await executeQuery<any>(insert, params, false);
    const row = res[0];

    // 4) Devuelvo el DTO
    return {
        id: Number(row.id),
        name: row.name,
        amount: Number(row.amount),
        amount_per_quota: row.amount_per_quota != null ? Number(row.amount_per_quota) : null,
        number_of_quotas: row.number_of_quotas != null ? Number(row.number_of_quotas) : null,
        payed_quotas: row.payed_quotas != null ? Number(row.payed_quotas) : null,
        currency_type: Number(row.currency_type),
        type: Number(row.type),
        fixed_expense: Boolean(row.fixed_expense),
        first_quota_date: row.first_quota_date ? new Date(row.first_quota_date).toISOString() : null,
        finalization_date: row.finalization_date ? new Date(row.finalization_date).toISOString() : null,
        image: row.image,
        ignored: Boolean(row.ignored),
        financial_entity_id: Number(row.financial_entity_id),
    };
}
