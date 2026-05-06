import { Controller, Get, Query } from '@nestjs/common'
import { Public } from '../common/public.decorator'
import { PractitionerQueryDto } from './practitioners.dto'
import { PractitionersService } from './practitioners.service'

@Public()
@Controller('practitioners')
export class PractitionersController {
  constructor(private readonly practitionersService: PractitionersService) {}

  @Get()
  list(@Query() query: PractitionerQueryDto) {
    return this.practitionersService.list(query)
  }
}
