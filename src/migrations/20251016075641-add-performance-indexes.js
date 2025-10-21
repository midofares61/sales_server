/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
    // Add indexes for better performance
    
    // Orders table indexes
    await queryInterface.addIndex('orders', ['customer_name'], {
      name: 'idx_orders_customer_name'
    });
    
    await queryInterface.addIndex('orders', ['phone'], {
      name: 'idx_orders_phone'
    });
    
    await queryInterface.addIndex('orders', ['status'], {
      name: 'idx_orders_status'
    });
    
    await queryInterface.addIndex('orders', ['created_at'], {
      name: 'idx_orders_created_at'
    });
    
    await queryInterface.addIndex('orders', ['marketer_id'], {
      name: 'idx_orders_marketer_id'
    });
    
    await queryInterface.addIndex('orders', ['mandobe_id'], {
      name: 'idx_orders_mandobe_id'
    });
    
    // Products table indexes
    await queryInterface.addIndex('products', ['name'], {
      name: 'idx_products_name'
    });
    
    // Users table indexes
    await queryInterface.addIndex('users', ['phone'], {
      name: 'idx_users_phone'
    });
    
    await queryInterface.addIndex('users', ['role'], {
      name: 'idx_users_role'
    });
    
    // Order details table indexes
    await queryInterface.addIndex('order_details', ['order_id'], {
      name: 'idx_order_details_order_id'
    });
    
    await queryInterface.addIndex('order_details', ['product_id'], {
      name: 'idx_order_details_product_id'
    });
    
    // Suppliers table indexes
    await queryInterface.addIndex('suppliers', ['name'], {
      name: 'idx_suppliers_name'
    });
    
    await queryInterface.addIndex('suppliers', ['phone'], {
      name: 'idx_suppliers_phone'
    });
    
    // Marketers table indexes
    await queryInterface.addIndex('marketers', ['name'], {
      name: 'idx_marketers_name'
    });
    
    await queryInterface.addIndex('marketers', ['phone'], {
      name: 'idx_marketers_phone'
    });
    
    // Mandobes table indexes
    await queryInterface.addIndex('mandobes', ['name'], {
      name: 'idx_mandobes_name'
    });
    
    await queryInterface.addIndex('mandobes', ['phone'], {
      name: 'idx_mandobes_phone'
    });
}

export async function down(queryInterface, Sequelize) {
    // Remove indexes
    const indexes = [
      'idx_orders_customer_name',
      'idx_orders_phone',
      'idx_orders_status',
      'idx_orders_created_at',
      'idx_orders_marketer_id',
      'idx_orders_mandobe_id',
      'idx_products_name',
      'idx_users_phone',
      'idx_users_role',
      'idx_order_details_order_id',
      'idx_order_details_product_id',
      'idx_suppliers_name',
      'idx_suppliers_phone',
      'idx_marketers_name',
      'idx_marketers_phone',
      'idx_mandobes_name',
      'idx_mandobes_phone'
    ];
    
    for (const indexName of indexes) {
      try {
        await queryInterface.removeIndex('orders', indexName);
      } catch (e) {
        // Index might not exist, continue
      }
    }
}