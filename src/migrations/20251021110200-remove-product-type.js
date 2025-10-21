export async function up(queryInterface, Sequelize) {
  await queryInterface.removeColumn('products', 'type');
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.addColumn('products', 'type', {
    type: Sequelize.ENUM('gift', 'mattress', 'regular'),
    allowNull: false,
    defaultValue: 'regular'
  });
}
