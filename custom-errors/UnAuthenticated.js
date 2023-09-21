const CustomError = require('./customError');

class UnAuthenticated extends CustomError {
  constructor(message) {
    super(message);
    this.statusCode = 401;
  }
}

module.exports = UnAuthenticated;
