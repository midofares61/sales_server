/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add order_code if missing
    const table = await queryInterface.describeTable('orders');
    if (!table.order_code) {
      await queryInterface.addColumn('orders', 'order_code', {
        type: Sequelize.STRING,
        allowNull: true
      });
      // Unique index on order_code (allows multiple NULLs in MySQL)
      try {
        await queryInterface.addIndex('orders', ['order_code'], {
          unique: true,
          name: 'ux_orders_order_code'
        });
      } catch (e) { /* ignore if exists */ }
    }
  },
  async down(queryInterface) {
    try { await queryInterface.removeIndex('orders', 'ux_orders_order_code'); } catch (e) {}
    try { await queryInterface.removeColumn('orders', 'order_code'); } catch (e) {}
  }
};





