import { IsNotEmpty, IsOptional } from "class-validator";

export class AttackInfo {
    @IsNotEmpty()
    url: string;
  
    @IsOptional()
    concurrency?: string;
  
    @IsOptional()
    interval?: number;
}