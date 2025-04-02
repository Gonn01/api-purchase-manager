import fs from "fs";
import dotenv from "dotenv";
import { executeQuery } from "./functions/db.js"; // Import your query function

dotenv.config({ path: process.env.ENV_FILE || ".env" });

async function importData() {
  try {
    console.log("📥 Loading JSON data...");
    const jsonData = JSON.parse(fs.readFileSync("dataGon.json", "utf8"));

    // Insert user and get generated ID
    const userResult = await executeQuery(
      "INSERT INTO users (name, email, firebase_user_id, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id",
      ["Default Name", "default@email.com", jsonData.idUser],
      true
    );
    const userId = userResult[0].id;

    console.log(`✅ User inserted with ID: ${userId}`);

    for (const category of jsonData.categorias) {
      // Insert category (financial entity)
      const categoryResult = await executeQuery(
        "INSERT INTO financial_entities (name, user_id, created_at, deleted) VALUES ($1, $2, NOW(), false) RETURNING id",
        [category.name, userId],
        true
      );
      const entityId = categoryResult[0].id;

      console.log(`📂 Category inserted: ${category.name} (ID: ${entityId})`);

      // Insert logs for the category
      for (const log of category.logs) {
        await executeQuery(
          "INSERT INTO financial_entities_logs (content, created_at, financial_entity_id) VALUES ($1, $2, $3)",
          [log, new Date().toISOString(), entityId]
        );
        console.log(`📝 Log inserted for category: ${log}`);
      }

      for (const purchase of category.compras) {
        const convertToISODate = (dateString) => {
          const date = new Date(dateString);
          return isNaN(date.getTime()) ? null : date.toISOString(); // If the date is valid, convert it to ISO
        };

        // Convert dates for purchases
        const finalizationDate = convertToISODate(purchase.lastQuotaDate);
        const firstQuotaDate = convertToISODate(purchase.firstQuotaDate);

        // Insert the purchase
        const purchaseResult = await executeQuery(
          "INSERT INTO purchases (name, amount, amount_per_quota, number_of_quotas, payed_quotas, currency_type, type, financial_entity_id, created_at, ignored, image, finalization_date, first_quota_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9, $10, $11, $12) RETURNING id",
          [
            purchase.nameOfProduct,
            purchase.totalAmount,
            purchase.amountPerQuota,
            purchase.amountOfQuotas,
            purchase.quotasPayed,
            purchase.currencyType,
            purchase.type,
            entityId,
            purchase.ignored,
            purchase.image,
            finalizationDate, // Use the converted date
            firstQuotaDate,   // Use the converted date
          ],
          true
        );
        const purchaseId = purchaseResult[0].id;

        console.log(`🛒 Purchase inserted: ${purchase.nameOfProduct}`);

        // Insert logs for the purchase
        for (const log of purchase.logs) {
          await executeQuery(
            "INSERT INTO purchases_logs (content, created_at, purchase_id) VALUES ($1, $2, $3)",
            [log, new Date().toISOString(), purchaseId]
          );
          console.log(`📝 Log inserted for purchase: ${log}`);
        }
      }
    }

    console.log("🎉 Data import completed successfully!");
  } catch (error) {
    console.error("❌ Error importing data:", error);
  }
}

// Run the import script
importData();
