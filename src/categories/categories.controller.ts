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
  UploadedFile,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('api/v1/categories')
@UseInterceptors(ClassSerializerInterceptor)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('category-image'))
  create(
    @Body() createCategoryDto: CreateCategoryDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<Category> {
    return this.categoriesService.create(createCategoryDto, file);
  }

  @Get()
  findAll(@Query('isActive') isActive?: boolean): Promise<Category[]> {
    const ac = isActive === undefined ? true : isActive;
    return this.categoriesService.findAll(ac);
  }

  @Get('with-count')
  getCategoriesWithProductCount() {
    return this.categoriesService.getCategoriesWithProductCount();
  }

  @Get('name/:name')
  findByName(@Param('name') name: string): Promise<Category> {
    return this.categoriesService.findByName(name);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query('includeProducts') includeProducts?: string,
  ): Promise<Category> {
    const includeProductsFlag = includeProducts === 'true';
    return this.categoriesService.findOne(id, includeProductsFlag);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('category-image'))
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<Category> {
    return this.categoriesService.update(id, updateCategoryDto, file);
  }

  @Patch(':id/toggle-status')
  toggleStatus(@Param('id') id: string): Promise<Category> {
    return this.categoriesService.toggleStatus(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.categoriesService.remove(id);
  }
}
