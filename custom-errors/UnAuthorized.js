const CustomError = require('./customError');


class UnAuthorized extends CustomError {
  constructor(message) {
    super(message);
    this.statusCode = 401;
  }
}

module.exports = UnAuthorized;