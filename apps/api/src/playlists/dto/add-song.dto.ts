import { IsString, IsNotEmpty } from 'class-validator';

export class AddSongDto {
  @IsString()
  @IsNotEmpty()
  songId!: string;
}
