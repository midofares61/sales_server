/** @type {import('sequelize-cli').Migration} */
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface) {
    const hash = await bcrypt.hash('admin123', 10);
    await queryInterface.bulkInsert('users', [{
      name: 'Admin',
      username: 'admin',
      phone: '01000000000',
      password_hash: hash,
      role: 'admin'
    }]);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('users', { username: 'admin' });
  }
};
