import { SortOrder } from 'mongoose';

/**
 * Chuyển đổi chuỗi query "field:order" thành object sort của Mongoose
 * Ví dụ: "createdAt:desc" -> { createdAt: -1 }
 */
export function parseSortQuery(sortOption?: string): Record<string, SortOrder> {
  // Nếu không truyền sort, mặc định sắp xếp theo dữ liệu mới nhất
  if (!sortOption) {
    return { createdAt: -1 };
  }

  const [field, order] = sortOption.split(':');

  // Xác định hướng sort dựa vào chuỗi order truyền lên
  const sortOrder: SortOrder = order?.toLowerCase() === 'asc' ? 1 : -1;

  return { [field]: sortOrder };
}
