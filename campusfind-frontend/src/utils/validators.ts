export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
};

export const validatePhone = (phone: string): boolean => {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10;
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 8;
};

export const validateStudentId = (studentId: string): boolean => {
  return studentId.trim().length >= 2;
};

export const validateDateNotFuture = (dateStr: string): boolean => {
  const selected = new Date(dateStr);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return selected <= today;
};
