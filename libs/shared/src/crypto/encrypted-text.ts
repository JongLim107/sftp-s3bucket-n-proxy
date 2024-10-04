class EncryptedText {
  private key: string;
  private encrypted: string;

  constructor(key?: string, encrypted?: string) {
    this.key = key || "";
    this.encrypted = encrypted || "";
  }

  static fromStorable(stored: string): EncryptedText | null {
    if (stored != null && stored.length > 0) {
      if (stored.startsWith("{") && stored.charAt(stored.length - 1) === "}") {
        stored = stored.substring(1, stored.length - 1);
        const colon = stored.indexOf(":");
        if (colon > 0 && colon !== stored.length - 1) {
          return new EncryptedText(stored.substring(0, colon), stored.substring(colon + 1));
        } else {
          return null;
        }
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  getEncrypted(): string {
    return this.encrypted;
  }

  toStorable(): string {
    return `{${this.key}:${this.encrypted}}`;
  }
}

function stripEnd(encrypted: string, charToRemove: string): string {
  while (encrypted.endsWith(charToRemove)) {
    encrypted = encrypted.slice(0, -1);
  }
  return encrypted;
}

export { EncryptedText, stripEnd };
