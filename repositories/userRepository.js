const User = require('../models/User');

class UserRepository {
  async findByEmail(email) {
    return User.findOne({ email });
  }

  async create(userData) {
    const user = new User(userData);
    return user.save();
  }
}

// Export a single instance of the repository
module.exports = new UserRepository();