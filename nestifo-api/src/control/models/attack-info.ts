import { IsNotEmpty, IsOptional } from "class-validator";

export class AttackInfo {
    @IsNotEmpty()
    host: string;

    @IsNotEmpty()
    port: number;
  
    @IsOptional()
    concurrency?: string;
  
    @IsOptional()
    interval?: number;
}