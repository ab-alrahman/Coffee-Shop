import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewQueryDto } from './dto/review-query.dto';
import { Review } from './entities/review.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {}

  async create(
    createReviewDto: CreateReviewDto,
    userId: string,
  ): Promise<Review> {
    // التحقق من عدم وجود مراجعة سابقة من نفس المستخدم لنفس المنتج
    const existingReview = await this.reviewRepository.findOne({
      where: {
        userId,
        productId: createReviewDto.productId,
      },
    });

    if (existingReview) {
      throw new BadRequestException('لقد قمت بإضافة مراجعة لهذا المنتج مسبقاً');
    }

    try {
      const review = this.reviewRepository.create({
        ...createReviewDto,
        userId,
      });
      return await this.reviewRepository.save(review);
    } catch (error) {
      throw new BadRequestException('فشل في إنشاء المراجعة');
    }
  }

  async findAll(queryDto?: ReviewQueryDto): Promise<{
    reviews: Review[];
    total: number;
    page: number;
    limit: number;
    avgRating?: number;
  }> {
    const { page = 1, limit = 10, productId, userId, rating } = queryDto || {};
    const skip = (page - 1) * limit;

    const queryBuilder = this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .leftJoinAndSelect('review.product', 'product');

    if (productId) {
      queryBuilder.andWhere('review.productId = :productId', { productId });
    }

    if (userId) {
      queryBuilder.andWhere('review.userId = :userId', { userId });
    }

    if (rating) {
      queryBuilder.andWhere('review.rating = :rating', { rating });
    }

    queryBuilder.orderBy('review.createdAt', 'DESC').skip(skip).take(limit);

    const [reviews, total] = await queryBuilder.getManyAndCount();

    // حساب متوسط التقييم إذا كان البحث لمنتج معين
    let avgRating: number | undefined;
    if (productId && total > 0) {
      const result = await this.reviewRepository
        .createQueryBuilder('review')
        .select('AVG(review.rating)', 'avg')
        .where('review.productId = :productId', { productId })
        .getRawOne();
      avgRating = parseFloat(result.avg) || 0;
    }

    return {
      reviews,
      total,
      page,
      limit,
      ...(avgRating !== undefined && { avgRating }),
    };
  }

  async findOne(id: string): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['user', 'product'],
    });

    if (!review) {
      throw new NotFoundException(`المراجعة بالمعرف ${id} غير موجودة`);
    }

    return review;
  }

  async getProductStats(productId: string): Promise<{
    avgRating: number;
    totalReviews: number;
    ratingDistribution: { rating: number; count: number }[];
  }> {
    const stats = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avgRating')
      .addSelect('COUNT(review.id)', 'totalReviews')
      .where('review.productId = :productId', { productId })
      .getRawOne();

    const distribution = await this.reviewRepository
      .createQueryBuilder('review')
      .select('review.rating', 'rating')
      .addSelect('COUNT(review.id)', 'count')
      .where('review.productId = :productId', { productId })
      .groupBy('review.rating')
      .orderBy('review.rating', 'DESC')
      .getRawMany();

    return {
      avgRating: parseFloat(stats.avgRating) || 0,
      totalReviews: parseInt(stats.totalReviews) || 0,
      ratingDistribution: distribution.map((d) => ({
        rating: parseInt(d.rating),
        count: parseInt(d.count),
      })),
    };
  }

  async update(
    id: string,
    updateReviewDto: UpdateReviewDto,
    userId: string,
  ): Promise<Review> {
    const review = await this.findOne(id);

    // التحقق من أن المستخدم هو صاحب المراجعة
    if (review.userId !== userId) {
      throw new ForbiddenException('ليس لديك صلاحية لتعديل هذه المراجعة');
    }

    Object.assign(review, updateReviewDto);

    try {
      return await this.reviewRepository.save(review);
    } catch (error) {
      throw new BadRequestException('فشل في تحديث المراجعة');
    }
  }

  async remove(
    id: string,
    userId: string,
    isAdmin: boolean = false,
  ): Promise<void> {
    const review = await this.findOne(id);

    // التحقق من الصلاحية (صاحب المراجعة أو أدمن)
    if (!isAdmin && review.userId !== userId) {
      throw new ForbiddenException('ليس لديك صلاحية لحذف هذه المراجعة');
    }

    try {
      await this.reviewRepository.remove(review);
    } catch (error) {
      throw new BadRequestException('فشل في حذف المراجعة');
    }
  }
}
