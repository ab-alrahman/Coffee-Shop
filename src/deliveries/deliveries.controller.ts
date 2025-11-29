import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  HttpStatus,
  HttpCode,
  UseInterceptors,
  ClassSerializerInterceptor,
  UseGuards,
  Request,
} from '@nestjs/common';
import { DeliveriesService } from './deliveries.service';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';
import { Delivery } from './entities/delivery.entity';
import { AuthGuard } from 'src/user/guard/auth.guard';
import { AuthRolesGuard } from 'src/user/guard/auth-roles.guard';
import { Roles } from 'src/user/decorator/user-role.decorator';
import { UserType } from 'src/utils/enum';
import { DeliveryStatus } from 'src/utils/delivery-enums';
import { JwtPayloadType } from 'src/utils/types';
import { CurrentUser } from 'src/user/decorator/current-user.decorator';

@Controller('api/v1/deliveries')
@UseGuards(AuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  @Post()
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDeliveryDto: CreateDeliveryDto): Promise<Delivery> {
    return this.deliveriesService.create(createDeliveryDto);
  }

  @Get()
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.ADMIN)
  findAll(@CurrentUser() payload : JwtPayloadType): Promise<Delivery[]> {
    const userId = payload.userType === UserType.ADMIN ? undefined : payload.id;
    return this.deliveriesService.findAll(userId);
  }

  @Get('order/:orderId')
  findByOrder(
    @Param('orderId') orderId: string,
    @CurrentUser() payload : JwtPayloadType,
  ): Promise<Delivery> {
    return this.deliveriesService.findByOrder(
      orderId,
      payload.id,
      payload.userType,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req): Promise<Delivery> {
    return this.deliveriesService.findOne(id, req.user.id, req.user.role);
  }

  @Patch(':id')
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateDeliveryDto: UpdateDeliveryDto,
    @Request() req,
  ): Promise<Delivery> {
    return this.deliveriesService.update(id, updateDeliveryDto, req.user.role);
  }

  @Patch(':id/assign-driver')
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.ADMIN)
  assignDriver(
    @Param('id') id: string,
    @Body() body: { driverName: string; driverPhone: string },
    @Request() req,
  ): Promise<Delivery> {
    return this.deliveriesService.assignDriver(
      id,
      body.driverName,
      body.driverPhone,
      req.user.role,
    );
  }

  @Patch(':id/status/:status')
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.ADMIN)
  updateStatus(
    @Param('id') id: string,
    @Param('status') status: DeliveryStatus,
    @Request() req,
  ): Promise<Delivery> {
    return this.deliveriesService.updateStatus(id, status, req.user.role);
  }
}
