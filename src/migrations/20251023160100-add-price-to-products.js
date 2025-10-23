/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('products', 'price', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'سعر المنتج'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('products', 'price');
  }
};
