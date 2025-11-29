import { Expose } from 'class-transformer';

export class ProductResponseDto {
  @Expose()
  id: string;

  @Expose()
  nama: string;

  @Expose()
  description: string;

  @Expose()
  price: number;

  @Expose()
  image: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updateAt: Date;

  constructor(partial: Partial<ProductResponseDto>) {
    Object.assign(this, partial);
  }
}
