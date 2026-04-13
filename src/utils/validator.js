class Validator {

  static isNumber(value) {
    return !isNaN(value);
  }

  static isValidTime(input) {
    return /^(\d+[smhd])+$/i.test(input);
  }

  static isValidHex(color) {
    return /^#?[0-9A-F]{6}$/i.test(color);
  }

  static isNotEmpty(value) {
    return value !== null && value !== undefined && value !== "";
  }

  static isPositiveNumber(value) {
    return this.isNumber(value) && Number(value) > 0;
  }

  static isDiscordId(id) {
    return /^\d{17,20}$/.test(id);
  }
}

module.exports = Validator;