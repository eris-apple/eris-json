export class JSONParser {
  private source: string;
  private position: number;

  constructor(source: string) {
    this.source = source;
    this.position = 0;
  }

  private throwError(message: string): never {
    throw new Error(`JSON parsing error: ${message}`);
  }

  private consumeWhitespace() {
    while (this.position < this.source.length) {
      const char = this.source.charAt(this.position);
      if (char === ' ' || char === '\t' || char === '\n' || char === '\r') this.position++;
      else break;
    }
  }

  private parseString(): string {
    let result = '';
    this.position++;
    while (this.position < this.source.length) {
      const char = this.source.charAt(this.position);
      if (char === '"') {
        this.position++;
        return result;
      } else if (char === '\\') {
        this.position++;
        const escapeChar = this.source.charAt(this.position);
        switch (escapeChar) {
          case 'n':
            result += '\n';
            break;
          case 'r':
            result += '\r';
            break;
          case 't':
            result += '\t';
            break;
          case '\\':
          case '"':
            result += escapeChar;
            break;
          default:
            this.throwError(`Invalid escape sequence: \\${escapeChar}`);
        }
      } else result += char;

      this.position++;
    }
    this.throwError('Unterminated string');
  }

  private parseNumber(): number {
    const start = this.position;
    while (this.position < this.source.length) {
      const char = this.source.charAt(this.position);

      if (/[\d.eE+-]/.test(char)) this.position++;
      else break;
    }
    const numberStr = this.source.substring(start, this.position);
    const number = parseFloat(numberStr);

    if (isNaN(number)) this.throwError(`Invalid number: ${numberStr}`);

    return number;
  }

  private parseObject(): Record<string, any> {
    const result: Record<string, any> = {};
    this.position++;

    while (this.position < this.source.length) {
      this.consumeWhitespace();
      const char = this.source.charAt(this.position);
      if (char === '}') {
        this.position++;
        return result;
      } else if (char === ',') {
        this.position++;
        this.consumeWhitespace();
      } else {
        const key = this.parseString();
        this.consumeWhitespace();

        if (this.source.charAt(this.position) !== ':') this.throwError('Expected colon (:)');

        this.position++;
        result[key] = this.parseValue();
      }
    }
    this.throwError('Unterminated object');
  }

  private parseArray(): any[] {
    const result: any[] = [];
    this.position++;

    while (this.position < this.source.length) {
      this.consumeWhitespace();
      const char = this.source.charAt(this.position);
      if (char === ']') {
        this.position++;
        return result;
      } else if (char === ',') {
        this.position++;
        this.consumeWhitespace();
      } else {
        const element = this.parseValue();
        result.push(element);
      }
    }
    this.throwError('Unterminated array');
  }

  private parseValue(): any {
    this.consumeWhitespace();
    const char = this.source.charAt(this.position);
    switch (char) {
      case '"':
        return this.parseString();
      case '{':
        return this.parseObject();
      case '[':
        return this.parseArray();
      case 't':
        this.position += 4;
        return true;
      case 'f':
        this.position += 5;
        return false;
      case 'n':
        this.position += 4;
        return null;
      default:
        if (/[-\d]/.test(char)) {
          return this.parseNumber();
        } else {
          this.throwError(`Unexpected character: ${char}`);
        }
    }
  }

  public parse(): any {
    this.consumeWhitespace();
    const result = this.parseValue();
    this.consumeWhitespace();
    if (this.position !== this.source.length) {
      this.throwError('Unexpected characters after JSON');
    }
    return result;
  }
}

export class JSONSerializer {
  private result: string;

  constructor() {
    this.result = '';
  }

  private escapeString(str: string): string {
    return str.replace(/[\\"\n\r\t]/g, (match) => {
      switch (match) {
        case '\\':
          return '\\\\';
        case '"':
          return '\\"';
        case '\n':
          return '\\n';
        case '\r':
          return '\\r';
        case '\t':
          return '\\t';
        default:
          return match;
      }
    });
  }

  private serializeValue(value: any) {
    if (value === null) this.result += 'null';
    else if (typeof value === 'string') this.result += `"${this.escapeString(value)}"`;
    else if (typeof value === 'number' || typeof value === 'boolean') this.result += value.toString();
    else if (Array.isArray(value)) {
      this.result += '[';

      for (let i = 0; i < value.length; i++) {
        if (i > 0) this.result += ', ';
        this.serializeValue(value[i]);
      }

      this.result += ']';
    } else if (typeof value === 'object') {
      this.result += '{';
      let isFirst = true;

      for (const key in value) {
        if (!value.hasOwnProperty(key)) continue;
        if (!isFirst) this.result += ', ';

        this.result += `"${this.escapeString(key)}": `;
        this.serializeValue(value[key]);
        isFirst = false;
      }

      this.result += '}';
    } else throw new Error(`Unsupported data type: ${typeof value}`);
  }

  public stringify(data: any): string {
    this.result = '';
    this.serializeValue(data);
    return this.result;
  }
}
