import { executeQuery } from "../db";
import { logRed } from "./logsCustom";

/**
 * Crea un log de compra en la tabla purchases_logs.
 * @param purchaseId ID de la compra
 * @param content Contenido del log
 */
export async function createPurchaseLog(
    purchaseId: number,
    content: string
): Promise<void> {
    try {
        const query = `
      INSERT INTO purchases_logs (purchase_id, content)
      VALUES ($1, $2)
    `;
        const values = [purchaseId, content];
        await executeQuery(query, values);
    } catch (error: any) {
        logRed(`Error al crear log de compra: ${error.stack || error.message}`);
        throw error;
    }
}

/**
 * Crea múltiples logs de compra en una sola query.
 * @param purchaseIds Array de IDs de compras
 * @param content Contenido común para todos los logs
 */
export async function createMultiplePurchaseLogs(
    purchaseIds: number[],
    content: string
): Promise<void> {
    try {
        if (!purchaseIds.length) return;

        const values: (number | string)[] = [];
        const placeholders = purchaseIds
            .map((_, index) => {
                const offset = index * 2;
                values.push(purchaseIds[index], content);
                return `($${offset + 1}, $${offset + 2})`;
            })
            .join(", ");

        const query = `
      INSERT INTO purchases_logs (purchase_id, content)
      VALUES ${placeholders}
    `;

        await executeQuery(query, values);
    } catch (error: any) {
        logRed(
            `Error al crear múltiples logs de compra: ${error.stack || error.message}`
        );
        throw error;
    }
}

/**
 * Crea un log de entidad financiera en la tabla financial_entities_logs.
 * @param financialEntityId ID de la entidad financiera
 * @param content Contenido del log
 */
export async function createFinancialEntityLog(
    financialEntityId: number,
    content: string
): Promise<void> {
    try {
        const query = `
        INSERT INTO financial_entities_logs (financial_entity_id, content)
        VALUES ($1, $2)
        `;
        const values = [financialEntityId, content];
        await executeQuery(query, values);
    } catch (error: any) {
        logRed(
            `Error al crear log de entidad financiera: ${error.stack || error.message}`
        );
        throw error;
    }
}
