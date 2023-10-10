export declare class JSONParser {
    private source;
    private position;
    constructor(source: string);
    private throwError;
    private consumeWhitespace;
    private parseString;
    private parseNumber;
    private parseObject;
    private parseArray;
    private parseValue;
    parse(): any;
}
export declare class JSONSerializer {
    private result;
    constructor();
    private escapeString;
    private serializeValue;
    stringify(data: any): string;
}
