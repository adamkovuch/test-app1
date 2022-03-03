import { IsNotEmpty, IsOptional } from "class-validator";
import { AttackInfo } from "./attack-info";

export class BotInfo {
    @IsNotEmpty()
    botUrl: string;

    @IsOptional()
    target: AttackInfo | null;

    @IsNotEmpty()
    loop: number;

    @IsNotEmpty()
    success: number;

    @IsNotEmpty()
    error: number;

    @IsOptional()
    status: 'working' | 'idle' | 'offline';
}
