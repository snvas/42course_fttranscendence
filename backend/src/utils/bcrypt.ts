import * as bcrypt from 'bcrypt';

export function hashPassword(password: string): string {
  const salt: string = bcrypt.genSaltSync();
  return bcrypt.hashSync(password, salt);
}

export function comparePassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}
