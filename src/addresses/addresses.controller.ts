import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  UseInterceptors,
  ClassSerializerInterceptor,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { Address } from './entities/address.entity';
import { AuthGuard } from 'src/user/guard/auth.guard';
import { CurrentUser } from 'src/user/decorator/current-user.decorator';
import { JwtPayloadType } from 'src/utils/types';

@Controller('api/v1/addresses')
@UseGuards(AuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createAddressDto: CreateAddressDto,
    @CurrentUser() payload : JwtPayloadType,
  ): Promise<Address> {
    return this.addressesService.create(createAddressDto, payload.id);
  }

  @Get()
  findAll(@CurrentUser() payload : JwtPayloadType): Promise<Address[]> {
    return this.addressesService.findAll(payload.id);
  }

  @Get('default')
  findDefault(@CurrentUser() payload : JwtPayloadType): Promise<Address> {
    return this.addressesService.findDefault(payload.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() payload : JwtPayloadType): Promise<Address> {
    return this.addressesService.findOne(id, payload.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAddressDto: UpdateAddressDto,
    @CurrentUser() payload : JwtPayloadType,
  ): Promise<Address> {
    return this.addressesService.update(id, updateAddressDto, payload.id);
  }

  @Patch(':id/set-default')
  setDefault(@Param('id') id: string, @CurrentUser() payload : JwtPayloadType): Promise<Address> {
    return this.addressesService.setDefault(id, payload.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Request() req): Promise<void> {
    return this.addressesService.remove(id, req.user.id);
  }
}
