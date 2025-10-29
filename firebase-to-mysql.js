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
  host: "srv1973.hstgr.io",       // غيره حسب السيرفر
  user: "u990838923_sales_db",            // يوزر MySQL
  password: "Sales_db12345##",    // باسورد MySQL
  database: "u990838923_sales_db",        // اسم قاعدة البيانات
});

// ✅ دالة تسحب البيانات من Firestore وتخزنها في MySQL
async function migrate() {
  try {
    // مثال: نسحب الأوردرات من Firebase
    const snapshot = await db.collection("code").get();

    for (const doc of snapshot.docs) {
      const data = doc.data();

      // إدخال في جدول ordersq
      await mysqlConn.query(
        `INSERT INTO marketers (name, phone)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE name=VALUES(name), phone=VALUES(phone)`,
        [
          data.name || "",
          data.phone || "",
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
