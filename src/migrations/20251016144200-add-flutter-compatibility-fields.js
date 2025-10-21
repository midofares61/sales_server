/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
    // Helper function to check if column exists
    const columnExists = async (table, column) => {
      const [results] = await queryInterface.sequelize.query(
        `SHOW COLUMNS FROM ${table} LIKE '${column}'`
      );
      return results.length > 0;
    };

    // Helper function to check if table exists
    const tableExists = async (table) => {
      const [results] = await queryInterface.sequelize.query(
        `SHOW TABLES LIKE '${table}'`
      );
      return results.length > 0;
    };

    // Add orderCode and dateTime to orders table
    if (!(await columnExists('orders', 'order_code'))) {
      await queryInterface.addColumn('orders', 'order_code', {
      type: Sequelize.STRING(50),
      allowNull: true,
      unique: true,
      after: 'id'
      });
    }

    if (!(await columnExists('orders', 'date_time'))) {
      await queryInterface.addColumn('orders', 'date_time', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      after: 'city'
      });
    }

    // Add index for orderCode
    try {
      await queryInterface.addIndex('orders', ['order_code'], {
        name: 'idx_orders_order_code',
        unique: true
      });
    } catch (e) {
      // Index might already exist
    }

    // Add index for dateTime
    try {
      await queryInterface.addIndex('orders', ['date_time'], {
        name: 'idx_orders_date_time'
      });
    } catch (e) {
      // Index might already exist
    }

    // Add city index for filtering
    try {
      await queryInterface.addIndex('orders', ['city'], {
        name: 'idx_orders_city'
      });
    } catch (e) {
      // Index might already exist
    }

    // Add type field to products table
    if (!(await columnExists('products', 'type'))) {
      await queryInterface.addColumn('products', 'type', {
      type: Sequelize.ENUM('gift', 'mattress', 'regular'),
      allowNull: false,
      defaultValue: 'regular',
      after: 'count'
      });
    }

    // Add permissions field to users table (JSON)
    if (!(await columnExists('users', 'permissions'))) {
      await queryInterface.addColumn('users', 'permissions', {
      type: Sequelize.JSON,
      allowNull: true,
      after: 'role'
      });
    }

    // Update role enum to include 'sales'
    await queryInterface.changeColumn('users', 'role', {
      type: Sequelize.ENUM('admin', 'marketer', 'mandobe', 'sales'),
      allowNull: false
    });

    // Create vault table
    if (!(await tableExists('vault'))) {
      await queryInterface.createTable('vault', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
      },
      balance: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
      });

      // Insert initial vault record
      await queryInterface.bulkInsert('vault', [{
        balance: 0,
        updated_at: new Date()
      }]);
    }

    // Create vault_transactions table
    if (!(await tableExists('vault_transactions'))) {
      await queryInterface.createTable('vault_transactions', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
      },
      type: {
        type: Sequelize.ENUM('in', 'out'),
        allowNull: false
      },
      amount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      note: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      date_time: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
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
      }
      });

      // Add indexes for vault_transactions
      await queryInterface.addIndex('vault_transactions', ['type'], {
        name: 'idx_vault_transactions_type'
      });

      await queryInterface.addIndex('vault_transactions', ['date_time'], {
        name: 'idx_vault_transactions_date_time'
      });
    }

    // Create product_history table for stock tracking
    if (!(await tableExists('product_history'))) {
      await queryInterface.createTable('product_history', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
      },
      product_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      count_delta: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Positive for increase, negative for decrease'
      },
      count_before: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      count_after: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      note: {
        type: Sequelize.STRING,
        allowNull: true
      },
      date_time: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
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
      }
    });

      // Add indexes for product_history
      await queryInterface.addIndex('product_history', ['product_id'], {
        name: 'idx_product_history_product_id'
      });

      await queryInterface.addIndex('product_history', ['date_time'], {
        name: 'idx_product_history_date_time'
      });
    }

    // Create mandobe_payments table
    if (!(await tableExists('mandobe_payments'))) {
      await queryInterface.createTable('mandobe_payments', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
      },
      mandobe_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'mandobes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      amount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      note: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      date_time: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
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
      }
      });

      // Add indexes for mandobe_payments
      await queryInterface.addIndex('mandobe_payments', ['mandobe_id'], {
        name: 'idx_mandobe_payments_mandobe_id'
      });

      await queryInterface.addIndex('mandobe_payments', ['date_time'], {
        name: 'idx_mandobe_payments_date_time'
      });
    }

    // Create supplier_orders table
    if (!(await tableExists('supplier_orders'))) {
      await queryInterface.createTable('supplier_orders', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
      },
      supplier_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'suppliers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      total: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
      },
      status: {
        type: Sequelize.ENUM('pending', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      date_time: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
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
      }
      });

      // Add indexes for supplier_orders
      await queryInterface.addIndex('supplier_orders', ['supplier_id'], {
        name: 'idx_supplier_orders_supplier_id'
      });

      await queryInterface.addIndex('supplier_orders', ['status'], {
        name: 'idx_supplier_orders_status'
      });

      await queryInterface.addIndex('supplier_orders', ['date_time'], {
        name: 'idx_supplier_orders_date_time'
      });
    }

    // Create supplier_payments table
    if (!(await tableExists('supplier_payments'))) {
      await queryInterface.createTable('supplier_payments', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
      },
      supplier_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'suppliers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      amount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      note: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      date_time: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
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
      }
      });

      // Add indexes for supplier_payments
      await queryInterface.addIndex('supplier_payments', ['supplier_id'], {
        name: 'idx_supplier_payments_supplier_id'
      });

      await queryInterface.addIndex('supplier_payments', ['date_time'], {
        name: 'idx_supplier_payments_date_time'
      });
    }

    // Create order_codes table for sequential numbering
    if (!(await tableExists('order_codes'))) {
      await queryInterface.createTable('order_codes', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
      },
      current: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
      });

      // Insert initial order_code record
      await queryInterface.bulkInsert('order_codes', [{
        current: 0,
        updated_at: new Date()
      }]);
    }
}

export async function down(queryInterface, Sequelize) {
    // Drop new tables
    await queryInterface.dropTable('order_codes');
    await queryInterface.dropTable('supplier_payments');
    await queryInterface.dropTable('supplier_orders');
    await queryInterface.dropTable('mandobe_payments');
    await queryInterface.dropTable('product_history');
    await queryInterface.dropTable('vault_transactions');
    await queryInterface.dropTable('vault');

    // Remove columns from orders
    await queryInterface.removeColumn('orders', 'order_code');
    await queryInterface.removeColumn('orders', 'date_time');

    // Remove column from products
    await queryInterface.removeColumn('products', 'type');

    // Remove column from users
    await queryInterface.removeColumn('users', 'permissions');

    // Revert role enum
    await queryInterface.changeColumn('users', 'role', {
      type: Sequelize.ENUM('admin', 'marketer', 'mandobe'),
      allowNull: false
    });
}
