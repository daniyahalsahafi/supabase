async function mac(secret: string, value: string) {
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(value)));
}
export async function rotatingCode(secret: string, bucket: number) {
  const bytes=await mac(secret,`attendance:${bucket}`);
  const value=new DataView(bytes.buffer).getUint32(0);
  return String(value%1000000).padStart(6,'0');
}
export async function hashIdentity(secret: string, id: string) {
  return Array.from(await mac(secret,`voter:${id}`),b=>b.toString(16).padStart(2,'0')).join('');
}