export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('marketer_payments', {
    id: {
      type: Sequelize.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    marketer_id: {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'marketers',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    },
    order_id: {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    },
    commission: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
    },
    payment_date: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    },
    notes: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    created_by: {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    }
  });

  // Add indexes for performance
  await queryInterface.addIndex('marketer_payments', ['marketer_id']);
  await queryInterface.addIndex('marketer_payments', ['order_id']);
  await queryInterface.addIndex('marketer_payments', ['payment_date']);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('marketer_payments');
}
