"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSONSerializer = exports.JSONParser = void 0;
var JSONParser = /** @class */ (function () {
    function JSONParser(source) {
        this.source = source;
        this.position = 0;
    }
    JSONParser.prototype.throwError = function (message) {
        throw new Error("JSON parsing error: ".concat(message));
    };
    JSONParser.prototype.consumeWhitespace = function () {
        while (this.position < this.source.length) {
            var char = this.source.charAt(this.position);
            if (char === ' ' || char === '\t' || char === '\n' || char === '\r')
                this.position++;
            else
                break;
        }
    };
    JSONParser.prototype.parseString = function () {
        var result = '';
        this.position++;
        while (this.position < this.source.length) {
            var char = this.source.charAt(this.position);
            if (char === '"') {
                this.position++;
                return result;
            }
            else if (char === '\\') {
                this.position++;
                var escapeChar = this.source.charAt(this.position);
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
                        this.throwError("Invalid escape sequence: \\".concat(escapeChar));
                }
            }
            else
                result += char;
            this.position++;
        }
        this.throwError('Unterminated string');
    };
    JSONParser.prototype.parseNumber = function () {
        var start = this.position;
        while (this.position < this.source.length) {
            var char = this.source.charAt(this.position);
            if (/[\d.eE+-]/.test(char))
                this.position++;
            else
                break;
        }
        var numberStr = this.source.substring(start, this.position);
        var number = parseFloat(numberStr);
        if (isNaN(number))
            this.throwError("Invalid number: ".concat(numberStr));
        return number;
    };
    JSONParser.prototype.parseObject = function () {
        var result = {};
        this.position++;
        while (this.position < this.source.length) {
            this.consumeWhitespace();
            var char = this.source.charAt(this.position);
            if (char === '}') {
                this.position++;
                return result;
            }
            else if (char === ',') {
                this.position++;
                this.consumeWhitespace();
            }
            else {
                var key = this.parseString();
                this.consumeWhitespace();
                if (this.source.charAt(this.position) !== ':')
                    this.throwError('Expected colon (:)');
                this.position++;
                result[key] = this.parseValue();
            }
        }
        this.throwError('Unterminated object');
    };
    JSONParser.prototype.parseArray = function () {
        var result = [];
        this.position++;
        while (this.position < this.source.length) {
            this.consumeWhitespace();
            var char = this.source.charAt(this.position);
            if (char === ']') {
                this.position++;
                return result;
            }
            else if (char === ',') {
                this.position++;
                this.consumeWhitespace();
            }
            else {
                var element = this.parseValue();
                result.push(element);
            }
        }
        this.throwError('Unterminated array');
    };
    JSONParser.prototype.parseValue = function () {
        this.consumeWhitespace();
        var char = this.source.charAt(this.position);
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
                }
                else {
                    this.throwError("Unexpected character: ".concat(char));
                }
        }
    };
    JSONParser.prototype.parse = function () {
        this.consumeWhitespace();
        var result = this.parseValue();
        this.consumeWhitespace();
        if (this.position !== this.source.length) {
            this.throwError('Unexpected characters after JSON');
        }
        return result;
    };
    return JSONParser;
}());
exports.JSONParser = JSONParser;
var JSONSerializer = /** @class */ (function () {
    function JSONSerializer() {
        this.result = '';
    }
    JSONSerializer.prototype.escapeString = function (str) {
        return str.replace(/[\\"\n\r\t]/g, function (match) {
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
    };
    JSONSerializer.prototype.serializeValue = function (value) {
        if (value === null)
            this.result += 'null';
        else if (typeof value === 'string')
            this.result += "\"".concat(this.escapeString(value), "\"");
        else if (typeof value === 'number' || typeof value === 'boolean')
            this.result += value.toString();
        else if (Array.isArray(value)) {
            this.result += '[';
            for (var i = 0; i < value.length; i++) {
                if (i > 0)
                    this.result += ', ';
                this.serializeValue(value[i]);
            }
            this.result += ']';
        }
        else if (typeof value === 'object') {
            this.result += '{';
            var isFirst = true;
            for (var key in value) {
                if (!value.hasOwnProperty(key))
                    continue;
                if (!isFirst)
                    this.result += ', ';
                this.result += "\"".concat(this.escapeString(key), "\": ");
                this.serializeValue(value[key]);
                isFirst = false;
            }
            this.result += '}';
        }
        else
            throw new Error("Unsupported data type: ".concat(typeof value));
    };
    JSONSerializer.prototype.stringify = function (data) {
        this.result = '';
        this.serializeValue(data);
        return this.result;
    };
    return JSONSerializer;
}());
exports.JSONSerializer = JSONSerializer;
