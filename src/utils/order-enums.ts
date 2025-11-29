export enum OrderStatus {
  PENDING = 'PENDING', // في انتظار التأكيد
  CONFIRMED = 'CONFIRMED', // تم التأكيد
  PREPARING = 'PREPARING', // قيد التحضير
  READY = 'READY', // جاهز للاستلام/التوصيل
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY', // في طريق التوصيل
  DELIVERED = 'DELIVERED', // تم التوصيل
  CANCELLED = 'CANCELLED', // ملغي
  REFUNDED = 'REFUNDED', // تم الاسترجاع
}

export enum PaymentStatus {
  PENDING = 'PENDING', // في انتظار الدفع
  PAID = 'PAID', // تم الدفع
  FAILED = 'FAILED', // فشل الدفع
  REFUNDED = 'REFUNDED', // تم الاسترجاع
}

export enum PaymentMethod {
  CASH = 'CASH', // نقداً
  CREDIT_CARD = 'CREDIT_CARD', // بطاقة ائتمان
  DEBIT_CARD = 'DEBIT_CARD', // بطاقة خصم
  MOBILE_WALLET = 'MOBILE_WALLET', // محفظة إلكترونية
}
