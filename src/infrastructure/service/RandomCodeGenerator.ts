import crypto from "crypto";
import { CodeGenerator } from "../../application/port/CodeGenerator";

export class RandomCodeGenerator implements CodeGenerator {
    private readonly digits: number;

    constructor(digits: number = 6) {
        this.digits = digits;
    }

    generateCode(): string {
        const min = Math.pow(10, this.digits - 1);
        const max = Math.pow(10, this.digits) - 1;
        return crypto.randomInt(min, max + 1).toString();
    }
}
