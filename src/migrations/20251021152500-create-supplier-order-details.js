export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('supplier_order_details', {
    id: {
      type: Sequelize.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    supplier_order_id: {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'supplier_orders',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    product_id: {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    },
    quantity: {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false
    },
    price: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
    },
    total: {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: false
    }
  });

  // Add indexes
  await queryInterface.addIndex('supplier_order_details', ['supplier_order_id']);
  await queryInterface.addIndex('supplier_order_details', ['product_id']);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('supplier_order_details');
}
