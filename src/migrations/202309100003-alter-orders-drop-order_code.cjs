/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.removeColumn('orders', 'order_code');
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('orders', 'order_code', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    });
  }
};
