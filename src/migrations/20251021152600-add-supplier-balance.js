export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('suppliers', 'balance', {
    type: Sequelize.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Current balance (positive = we owe supplier, negative = supplier owes us)'
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn('suppliers', 'balance');
}
