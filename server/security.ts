import { randomBytes, scrypt as nodeScrypt, timingSafeEqual, createHash } from "node:crypto";
import { promisify } from "node:util";
const scrypt = promisify(nodeScrypt);
export async function hashRoomPassword(password: string): Promise<string> { const salt=randomBytes(16).toString("base64url"); const derived=(await scrypt(password,salt,64)) as Buffer; return `scrypt$${salt}$${derived.toString("base64url")}`; }
export async function verifyRoomPassword(password:string,verifier:string):Promise<boolean>{const [algorithm,salt,encodedHash]=verifier.split("$");if(algorithm!=="scrypt"||!salt||!encodedHash)return false;const expected=Buffer.from(encodedHash,"base64url");const actual=(await scrypt(password,salt,expected.length)) as Buffer;return expected.length===actual.length&&timingSafeEqual(expected,actual);}
export function randomPublicId(prefix:string,bytes=8):string{return `${prefix}_${randomBytes(bytes).toString("base64url").toUpperCase()}`;}
export function stableSubjectHash(subject:string):string{return createHash("sha256").update(subject).digest("base64url");}
