class CustomErrors extends Error {
  constructor(message) {
    super(message);
  }
}

module.exports = CustomErrors;
