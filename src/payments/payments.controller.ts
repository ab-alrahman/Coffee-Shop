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
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Payment } from './entities/payment.entity';
import { AuthGuard } from 'src/user/guard/auth.guard';
import { AuthRolesGuard } from 'src/user/guard/auth-roles.guard';
import { Roles } from 'src/user/decorator/user-role.decorator';
import { UserType } from 'src/utils/enum';

@Controller('api/v1/payments')
@UseGuards(AuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createPaymentDto: CreatePaymentDto,
    @Request() req,
  ): Promise<Payment> {
    return this.paymentsService.create(createPaymentDto, req.user.id);
  }

  @Get()
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.ADMIN)
  findAll(@Request() req): Promise<Payment[]> {
    const userId = req.user.role === UserType.ADMIN ? undefined : req.user.id;
    return this.paymentsService.findAll(userId);
  }

  @Get('order/:orderId')
  findByOrder(
    @Param('orderId') orderId: string,
    @Request() req,
  ): Promise<Payment> {
    return this.paymentsService.findByOrder(
      orderId,
      req.user.id,
      req.user.role,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req): Promise<Payment> {
    return this.paymentsService.findOne(id, req.user.id, req.user.role);
  }

  @Patch(':id')
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.ADMIN)
  updateStatus(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
    @Request() req,
  ): Promise<Payment> {
    return this.paymentsService.updateStatus(
      id,
      updatePaymentDto,
      req.user.role,
    );
  }

  @Patch(':id/confirm')
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.ADMIN)
  confirmPayment(@Param('id') id: string, @Request() req): Promise<Payment> {
    return this.paymentsService.confirmPayment(id, req.user.role);
  }
}
