import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  name!: string; // renamed from displayName to match API_CONTRACTS.md
}

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}
