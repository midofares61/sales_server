/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  // Helper function to check if column exists
  const columnExists = async (table, column) => {
    const [results] = await queryInterface.sequelize.query(
      `SHOW COLUMNS FROM ${table} LIKE '${column}'`
    );
    return results.length > 0;
  };

  // Add username field to users table
  if (!(await columnExists('users', 'username'))) {
    await queryInterface.addColumn('users', 'username', {
      type: Sequelize.STRING(50),
      allowNull: true, // Initially nullable for migration
      unique: false, // Will be made unique after data migration
      after: 'name'
    });

    // Copy phone to username for existing users
    await queryInterface.sequelize.query(
      'UPDATE users SET username = phone WHERE username IS NULL'
    );

    // Now make username NOT NULL and UNIQUE
    await queryInterface.changeColumn('users', 'username', {
      type: Sequelize.STRING(50),
      allowNull: false,
      unique: true
    });
  }

  // Make phone nullable (optional)
  if (await columnExists('users', 'phone')) {
    await queryInterface.changeColumn('users', 'phone', {
      type: Sequelize.STRING(20),
      allowNull: true,
      unique: false
    });
  }

  // Add index for username
  try {
    await queryInterface.addIndex('users', ['username'], {
      name: 'idx_users_username',
      unique: true
    });
  } catch (e) {
    // Index might already exist
  }
}

export async function down(queryInterface, Sequelize) {
  // Remove username column
  const columnExists = async (table, column) => {
    const [results] = await queryInterface.sequelize.query(
      `SHOW COLUMNS FROM ${table} LIKE '${column}'`
    );
    return results.length > 0;
  };

  if (await columnExists('users', 'username')) {
    await queryInterface.removeColumn('users', 'username');
  }

  // Revert phone to NOT NULL and UNIQUE
  if (await columnExists('users', 'phone')) {
    await queryInterface.changeColumn('users', 'phone', {
      type: Sequelize.STRING(20),
      allowNull: false,
      unique: true
    });
  }

  // Remove index
  try {
    await queryInterface.removeIndex('users', 'idx_users_username');
  } catch (e) {
    // Index might not exist
  }
}
