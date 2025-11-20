import bcrypt from 'bcrypt';

const password = process.argv[2] || 'ChangeMe123!';

async function main() {
  const hash = await bcrypt.hash(password, 10);
  console.log('Password:', password);
  console.log('Hash:', hash);
}

main().catch((err) => {
  console.error('Error hashing password:', err);
  process.exit(1);
});
