import admin from "firebase-admin";
import mysql from "mysql2/promise";
import { readFile } from "fs/promises";

const serviceAccount = JSON.parse(
    await readFile(new URL("./serviceAccountKey.json", import.meta.url))
  );
  

// ✅ تهيئة Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

// ✅ إعداد MySQL
const mysqlConn = mysql.createPool({
  host: "localhost",       // غيره حسب السيرفر
  user: "root",            // يوزر MySQL
  password: "",    // باسورد MySQL
  database: "sales_db",        // اسم قاعدة البيانات
});

// ✅ دالة تسحب البيانات من Firestore وتخزنها في MySQL
async function migrate() {
  try {
    // مثال: نسحب الأوردرات من Firebase
    const snapshot = await db.collection("product").orderBy("code").get();

    for (const doc of snapshot.docs) {
      const data = doc.data();

      // إدخال في جدول ordersq
      await mysqlConn.query(
        `INSERT INTO products (code, name, count)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE code=VALUES(code), name=VALUES(name), count=VALUES(count)`,
        [
          data.code || "",
          data.name || "",
          data.count || "",
        ]
      );
    }

    console.log("✅ تم ترحيل البيانات من Firebase إلى MySQL بنجاح");
  } catch (err) {
    console.error("❌ خطأ أثناء الترحيل:", err);
  } finally {
    await mysqlConn.end();
  }
}

migrate();
