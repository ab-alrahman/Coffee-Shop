import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly cloudService: CloudinaryService,
  ) {}

  async create(
    createCategoryDto: CreateCategoryDto,
    file?: Express.Multer.File,
  ): Promise<Category> {
    const existingCategory = await this.categoryRepository.findOne({
      where: { name: createCategoryDto.name },
    });

    if (existingCategory) {
      throw new ConflictException('فئة بهذا الاسم موجودة بالفعل');
    }

    if (file) {
      const result = await this.cloudService.uploadFile(file);
      createCategoryDto.image = result.secure_url;
    }
    try {
      const category = this.categoryRepository.create(createCategoryDto);
      return await this.categoryRepository.save(category);
    } catch (error) {
      throw new BadRequestException('فشل في إنشاء الفئة');
    }
  }

  async findAll(includeInactive?: boolean): Promise<Category[]> {
    const whereCondition = includeInactive
      ? { isActive: true }
      : { isActive: false };
    return await this.categoryRepository.find({
      where: whereCondition,
      relations: ['products'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, includeProducts = false): Promise<Category> {
    const relations = includeProducts ? ['products'] : [];

    const category = await this.categoryRepository.findOne({
      where: { id },
      relations,
    });

    if (!category) {
      throw new NotFoundException(`الفئة بالمعرف ${id} غير موجودة`);
    }

    return category;
  }

  async findByName(name: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { name },
      relations: ['products'],
    });

    if (!category) {
      throw new NotFoundException(`الفئة بالاسم ${name} غير موجودة`);
    }

    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    file?: Express.Multer.File,
  ): Promise<Category> {
    const category = await this.findOne(id);

    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const existingCategory = await this.categoryRepository.findOne({
        where: { name: updateCategoryDto.name },
      });

      if (existingCategory) {
        throw new ConflictException('فئة بهذا الاسم موجودة بالفعل');
      }
    }

    if (file) {
      const result = await this.cloudService.uploadFile(file);
      updateCategoryDto.image = result.secure_url;
    }
    Object.assign(category, updateCategoryDto);

    try {
      return await this.categoryRepository.save(category);
    } catch (error) {
      throw new BadRequestException('فشل في تحديث الفئة');
    }
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id, true);

    if (category.products && category.products.length > 0) {
      throw new BadRequestException(
        'لا يمكن حذف فئة تحتوي على منتجات. قم بحذف المنتجات أولاً أو انقلها لفئة أخرى',
      );
    }

    try {
      await this.categoryRepository.remove(category);
    } catch (error) {
      throw new BadRequestException('فشل في حذف الفئة');
    }
  }

  async toggleStatus(id: string): Promise<Category> {
    const category = await this.findOne(id);
    category.isActive = !category.isActive;

    return await this.categoryRepository.save(category);
  }

  async getCategoriesWithProductCount(): Promise<Category[]> {
    return await this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.products', 'product')
      .select([
        'category.id',
        'category.name',
        'category.description',
        'category.isActive',
        'category.createdAt',
      ])
      .loadRelationCountAndMap('category.productCount', 'category.products')
      .where('category.isActive = :isActive', { isActive: true })
      .orderBy('category.createdAt', 'DESC')
      .getMany();
  }
}
