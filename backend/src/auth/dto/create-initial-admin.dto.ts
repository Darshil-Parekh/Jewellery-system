import { Transform } from 'class-transformer'
import {
  IsEmail,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator'

export class CreateInitialAdminDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(254)
  email!: string

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  fullName!: string

  @IsString()
  @MinLength(12)
  @MaxLength(128)
  password!: string
}
