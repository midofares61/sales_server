export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('order_notes', {
    id: {
      type: Sequelize.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    order_id: {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    note: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    created_by: {
      type: Sequelize.STRING(100),
      allowNull: true
    },
    updated_by: {
      type: Sequelize.STRING(100),
      allowNull: true
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
    }
  });

  // Add index on order_id for faster lookups
  await queryInterface.addIndex('order_notes', ['order_id'], {
    name: 'idx_order_notes_order_id'
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('order_notes');
}

