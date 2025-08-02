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
export async function createMultiplePurchaseLogs(purchaseIds, content) {
    try {
        if (!purchaseIds.length) return;

        const now = new Date();
        const values = [];
        const placeholders = purchaseIds.map((_, index) => {
            const offset = index * 3;
            values.push(purchaseIds[index], content, now);
            return `($${offset + 1}, $${offset + 2}, $${offset + 3})`;
        }).join(", ");

        const query = `
        INSERT INTO purchases_logs (purchase_id, content, created_at)
        VALUES ${placeholders}
      `;

        await executeQuery(query, values);
    } catch (error) {
        logRed(`Error al crear múltiples logs de compra: ${error.stack}`);
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