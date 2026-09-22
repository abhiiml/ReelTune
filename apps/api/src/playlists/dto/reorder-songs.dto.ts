import { IsArray, IsString } from 'class-validator';

export class ReorderSongsDto {
  @IsArray()
  @IsString({ each: true })
  songIds!: string[];
}
