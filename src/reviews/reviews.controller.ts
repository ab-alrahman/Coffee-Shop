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
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewQueryDto } from './dto/review-query.dto';
import { Review } from './entities/review.entity';
import { AuthGuard } from 'src/user/guard/auth.guard';
import { UserType } from 'src/utils/enum';
import { Roles } from 'src/user/decorator/user-role.decorator';
import { AuthRolesGuard } from 'src/user/guard/auth-roles.guard';
import { CurrentUser } from 'src/user/decorator/current-user.decorator';
import { JwtPayloadType } from 'src/utils/types';

@Controller('api/v1/reviews')
@UseInterceptors(ClassSerializerInterceptor)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createReviewDto: CreateReviewDto,
    @CurrentUser() payload: JwtPayloadType,
  ): Promise<Review> {
    return this.reviewsService.create(createReviewDto, payload.id);
  }

  @Get()
  findAll(@Query() queryDto: ReviewQueryDto) {
    return this.reviewsService.findAll(queryDto);
  }

  @Get('product/:productId/stats')
  getProductStats(@Param('productId') productId: string) {
    return this.reviewsService.getProductStats(productId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Review> {
    return this.reviewsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @Request() req,
  ): Promise<Review> {
    return this.reviewsService.update(id, updateReviewDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, AuthRolesGuard)
  @Roles(UserType.ADMIN, UserType.CLIENT)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Request() req): Promise<void> {
    const isAdmin = req.user.role === UserType.ADMIN;
    return this.reviewsService.remove(id, req.user.id, isAdmin);
  }
}
