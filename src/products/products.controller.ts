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
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { Product } from './entities/product.entity';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('api/v1/products')
@UseInterceptors(ClassSerializerInterceptor)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('product-image'))
  create(@Body() createProductDto: CreateProductDto , @UploadedFile() file ?: Express.Multer.File): Promise<Product> {
    return this.productsService.create(createProductDto , file);
  }

  @Get()
  findAll(
    @Query() queryDto: ProductQueryDto,
  ): Promise<{
    products: Product[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.productsService.findAll(queryDto);
  }

  @Get('category/:categoryId')
  findByCategory(@Param('categoryId') categoryId: string): Promise<Product[]> {
    return this.productsService.findByCategory(categoryId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Product> {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('product-image'))
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<Product> {
    return this.productsService.update(id, updateProductDto, file);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.productsService.remove(id);
  }
}
