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
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { Order } from './entities/order.entity';
import { AuthGuard } from 'src/user/guard/auth.guard';
import { AuthRolesGuard } from 'src/user/guard/auth-roles.guard';
import { Roles } from 'src/user/decorator/user-role.decorator';
import { UserType } from 'src/utils/enum';
import { JwtPayloadType } from 'src/utils/types';
import { CurrentUser } from 'src/user/decorator/current-user.decorator';

@Controller('api/v1/orders')
@UseGuards(AuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() payload: JwtPayloadType,
  ): Promise<Order> {
    return this.ordersService.create(createOrderDto, payload.id);
  }

  @Get()
  findAll(
    @Query() queryDto: OrderQueryDto,
    @CurrentUser() payload: JwtPayloadType,
  ) {
    return this.ordersService.findAll(queryDto, payload.id, payload.userType);
  }

  @Get('stats')
  getStats(@CurrentUser() payload: JwtPayloadType) {
    const userId = payload.userType === UserType.ADMIN ? undefined : payload.id;
    return this.ordersService.getStats(userId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() payload: JwtPayloadType,
  ): Promise<Order> {
    return this.ordersService.findOne(id, payload.id, payload.userType);
  }

  @Patch(':id')
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.ADMIN)
  updateStatus(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @CurrentUser() payload: JwtPayloadType,
  ): Promise<Order> {
    return this.ordersService.updateStatus(
      id,
      updateOrderDto,
      payload.id,
      payload.userType,
    );
  }

  @Patch(':id/cancel')
  cancel(
    @Param('id') id: string,
    @CurrentUser() payload: JwtPayloadType,
  ): Promise<Order> {
    return this.ordersService.cancel(id, payload.id, payload.userType);
  }
}
