import { executeQuery } from "../../db.js";
import { logRed, logYellow } from "../../funciones/logsCustom.js";
import { Purchase } from "../../models/purchase.js";

export async function editPurchase(
  id,
  ignored,
  image,
  amount,
  number_of_quotas,
  payed_quotas,
  currency_type,
  name,
  type,
  financialEntityId,
  fixedExpense
) {
  logYellow(`editPurchase: ${id}, ${ignored}, ${image}, ${amount}, ${number_of_quotas}, ${payed_quotas}, ${currency_type}, ${name}, ${type}, ${financialEntityId}, ${fixedExpense}`);
  try {
    // Verificar que la compra exista
    const checkQuery = "SELECT id FROM purchases WHERE id = $1";
    const checkResult = await executeQuery(checkQuery, [id]);
    if (checkResult.length === 0) {
      logRed(`No se encontró la compra con ID ${id}`);
      throw new Error("No se encontró la compra con el ID proporcionado.");
    }

    // Recalcular amount_per_quota basándose en amount y number_of_quotas
    const recalculatedAmountPerQuota = parseFloat(amount) / parseInt(number_of_quotas);

    // Si las payed_quotas son iguales a number_of_quotas, se establece la fecha de finalización en la fecha actual; de lo contrario, se deja en null.
    const finalizationDate =
      parseInt(payed_quotas) === parseInt(number_of_quotas)
        ? new Date().toISOString()
        : null;

    // Actualizar la compra, incluyendo la finalization_date
    const query = `
      UPDATE purchases
      SET ignored = $1,
          image = $2,
          amount = $3,
          amount_per_quota = $4,
          number_of_quotas = $5,
          payed_quotas = $6,
          currency_type = $7,
          name = $8,
          type = $9,
          financial_entity_id = $10,
          fixed_expense = $11,
          finalization_date = $12
      WHERE id = $13
      RETURNING *
    `;
    const result = await executeQuery(
      query,
      [
        ignored,                      // $1
        image ?? null,                // $2
        amount,                       // $3
        recalculatedAmountPerQuota,   // $4
        number_of_quotas,             // $5
        payed_quotas,                 // $6
        currency_type,                // $7
        name,                         // $8  <-- debe ser "test"
        type,                         // $9  <-- debe ser 0
        financialEntityId,            // $10
        fixedExpense,                 // $11
        finalizationDate,             // $12
        id,                           // $13
      ],
      true
    );


    if (result.length === 0) {
      logRed("No se pudo actualizar la compra.");
      throw new Error("No se pudo actualizar la compra.");
    }

    // Retornar la compra actualizada como instancia del modelo Purchase
    return Purchase.fromJson(result[0]);
  } catch (error) {
    logRed(`Error en editPurchase: ${error.stack}`);
    throw error;
  }
}
