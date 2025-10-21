export async function up(queryInterface, Sequelize) {
  // Set order_by to id for all products that have order_by = 0 or null
  await queryInterface.sequelize.query(
    'UPDATE products SET order_by = id WHERE order_by = 0 OR order_by IS NULL'
  );
}

export async function down(queryInterface, Sequelize) {
  // Reset order_by to 0
  await queryInterface.sequelize.query(
    'UPDATE products SET order_by = 0'
  );
}
