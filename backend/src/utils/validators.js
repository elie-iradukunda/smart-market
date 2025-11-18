export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  const re = /^[\+]?[1-9][\d]{0,15}$/;
  return re.test(phone);
};

export const validateRequired = (fields, body) => {
  const missing = fields.filter(field => !body[field]);
  return missing.length === 0 ? null : `Missing required fields: ${missing.join(', ')}`;
};

export const validateDecimal = (value, precision = 12, scale = 2) => {
  const re = new RegExp(`^\\d{1,${precision-scale}}(\\.\\d{1,${scale}})?$`);
  return re.test(value.toString());
};