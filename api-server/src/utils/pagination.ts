export function encodeCursor(cursor: object): string {
  return Buffer.from(JSON.stringify(cursor)).toString("base64");
}

export function decodeCursor(cursor: string): any {
  return JSON.parse(Buffer.from(cursor, "base64").toString("utf-8"));
}
