import { IsString, IsNotEmpty } from 'class-validator';

export class SaveSongDto {
  @IsString()
  @IsNotEmpty()
  songId!: string;
}
