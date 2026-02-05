import bcrypt from 'bcrypt';

async function verifyPassword(password) {
  const hash = '$2b$10$y46HLKs9u4vtr9MbN9iIqeTbqWY6fqqH5tlupdrWypdZW2nkKioS.';
  const isMatch = await bcrypt.compare(password, hash);
  return isMatch;
}

// Example usage:
async function checkPassword() {
  const password = 'password123'; // Change this to test different passwords
  const isValid = await verifyPassword(password);
  console.log(`The password "${password}" ${isValid ? 'matches' : 'does not match'} the hash`);
  return isValid;
}

checkPassword().catch(console.error);
