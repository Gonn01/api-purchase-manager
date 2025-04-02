import { logRed } from "./logsCustom.js";
import { executeQuery } from "../db.js";

export async function createPurchaseLog(purchaseId, content) {
    try {
        const query = `
        INSERT INTO purchases_logs (purchase_id, content, created_at)
        VALUES ($1, $2, $3)
      `;
        const values = [purchaseId, content, new Date()];
        await executeQuery(query, values);
    } catch (error) {
        logRed(`Error al crear log de compra: ${error.stack}`);
        throw error;
    }
}

export async function createFinancialEntityLog(financialEntityId, content) {
    try {
        const query = `
        INSERT INTO financial_entities_logs (financial_entity_id, content, created_at)
        VALUES ($1, $2, $3)
      `;
        const values = [financialEntityId, content, new Date()];
        await executeQuery(query, values);
    } catch (error) {
        logRed(`Error al crear log de entidad financiera: ${error.stack}`);
        throw error;
    }
}