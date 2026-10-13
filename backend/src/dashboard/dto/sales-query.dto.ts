import { Transform } from 'class-transformer'
import { IsIn } from 'class-validator'

export class SalesQueryDto {
  @Transform(({ value }) => (value === undefined ? 7 : Number(value)))
  @IsIn([7, 30])
  days: number = 7
}
