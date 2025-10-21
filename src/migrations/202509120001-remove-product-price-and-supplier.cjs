/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove FK constraint if exists, then drop columns
    // Try to find and remove foreign key constraint on products.supplier_id
    try {
      const constraints = await queryInterface.getForeignKeyReferencesForTable('products');
      const supplierFk = constraints.find(c => c.columnName === 'supplier_id');
      if (supplierFk && supplierFk.constraintName) {
        await queryInterface.removeConstraint('products', supplierFk.constraintName);
      }
    } catch (e) {
      // ignore if helper not supported by dialect/older CLI
    }

    // Drop columns if they exist
    try { await queryInterface.removeColumn('products', 'supplier_id'); } catch (e) {}
    try { await queryInterface.removeColumn('products', 'price'); } catch (e) {}
  },
  async down(queryInterface, Sequelize) {
    // Re-add columns
    await queryInterface.addColumn('products', 'price', { type: Sequelize.DECIMAL(10,2), allowNull: false, defaultValue: 0 });
    await queryInterface.addColumn('products', 'supplier_id', { type: Sequelize.INTEGER.UNSIGNED, allowNull: false });

    // Recreate FK to suppliers
    try {
      await queryInterface.addConstraint('products', {
        fields: ['supplier_id'],
        type: 'foreign key',
        name: 'fk_products_supplier_id_suppliers_id',
        references: { table: 'suppliers', field: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      });
    } catch (e) {}
  }
};





