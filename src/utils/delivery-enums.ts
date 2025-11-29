export enum DeliveryStatus {
  PENDING = 'PENDING', // في الانتظار
  ASSIGNED = 'ASSIGNED', // تم التعيين لسائق
  PICKED_UP = 'PICKED_UP', // تم الاستلام من المحل
  IN_TRANSIT = 'IN_TRANSIT', // في الطريق
  DELIVERED = 'DELIVERED', // تم التوصيل
  FAILED = 'FAILED', // فشل التوصيل
}
