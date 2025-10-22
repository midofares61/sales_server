export async function up(queryInterface, Sequelize) {
  // Add type to supplier_orders
  await queryInterface.addColumn('supplier_orders', 'type', {
    type: Sequelize.STRING(100),
    allowNull: true,
    comment: 'نوع الفاتورة (مثل: مراتب، اكسسوارات، مواد خام)'
  });

  // Add type to supplier_payments
  await queryInterface.addColumn('supplier_payments', 'type', {
    type: Sequelize.STRING(100),
    allowNull: true,
    comment: 'نوع الدفعة (مثل: نقدي، شيك، تحويل بنكي)'
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn('supplier_orders', 'type');
  await queryInterface.removeColumn('supplier_payments', 'type');
}
