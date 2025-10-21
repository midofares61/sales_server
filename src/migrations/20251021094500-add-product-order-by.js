export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('products', 'order_by', {
    type: Sequelize.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: 'Display order for products'
  });
  
  // Set default order_by to product id for existing products
  await queryInterface.sequelize.query(
    'UPDATE products SET order_by = id WHERE order_by IS NULL'
  );
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn('products', 'order_by');
}
