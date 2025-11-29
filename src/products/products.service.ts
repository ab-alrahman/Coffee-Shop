import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    try {
      const product = this.productRepository.create(createProductDto);
      await this.productRepository.save(product);
      return product;
    } catch (error) {
      throw new BadRequestException(error,'فشل في إنشاء المنتج');
    }
  }

  async findAll(
    queryDto?: ProductQueryDto,
  ): Promise<{
    products: Product[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      page = 1,
      limit = 10,
      search,
      minPrice,
      maxPrice,
      categoryId,
    } = queryDto || {};
    const skip = (page - 1) * limit;

    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.reviews', 'reviews');

    if (search) {
      queryBuilder.where(
        '(product.name ILIKE :search OR product.description ILIKE :search OR category.name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (categoryId) {
      queryBuilder.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    if (minPrice !== undefined && maxPrice !== undefined) {
      queryBuilder.andWhere('product.price BETWEEN :minPrice AND :maxPrice', {
        minPrice,
        maxPrice,
      });
    } else if (minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
    } else if (maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    queryBuilder.orderBy('product.createdAt', 'DESC').skip(skip).take(limit);

    const [products, total] = await queryBuilder.getManyAndCount();

    // إضافة الخصائص المحسوبة (avg_rating & rating_count)
    const productsWithRatings = products.map((product) => {
      const ratings = product.reviews || [];
      const avgRating =
        ratings.length > 0
          ? ratings.reduce((sum, review) => sum + review.rating, 0) /
            ratings.length
          : 0;

      return {
        ...product,
        avgRating: parseFloat(avgRating.toFixed(2)),
        ratingCount: ratings.length,
      };
    });

    return {
      products: productsWithRatings,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string, includeCategory = true): Promise<Product> {
    const relations = includeCategory
      ? ['category', 'reviews', 'reviews.user']
      : ['reviews', 'reviews.user'];

    const product = await this.productRepository.findOne({
      where: { id },
      relations,
    });

    if (!product) {
      throw new NotFoundException(`المنتج بالمعرف ${id} غير موجود`);
    }

    // إضافة الخصائص المحسوبة
    const ratings = product.reviews || [];
    const avgRating =
      ratings.length > 0
        ? ratings.reduce((sum, review) => sum + review.rating, 0) /
          ratings.length
        : 0;

    return {
      ...product,
      avgRating: parseFloat(avgRating.toFixed(2)),
      ratingCount: ratings.length,
    } as any;
  }

  async findByCategory(categoryId: string): Promise<Product[]> {
    return await this.productRepository.find({
      where: { categoryId },
      relations: ['category'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, updateProductDto);
    try {
      return await this.productRepository.save(product);
    } catch (error) {
      throw new BadRequestException('فشل في تحديث المنتج');
    }
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    try {
      await this.productRepository.remove(product);
    } catch (error) {
      throw new BadRequestException('فشل في حذف المنتج');
    }
  }
}
