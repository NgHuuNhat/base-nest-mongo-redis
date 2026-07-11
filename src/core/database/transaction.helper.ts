import { Connection, ClientSession } from 'mongoose';

/**
 * Helper xử lý Transaction tự động đóng/mở và hoàn tác khi có lỗi
 * @param connection Mongoose Connection instance
 * @param work Callback chứa logic nghiệp vụ, nhận vào `session`
 * @returns Trả về đúng kiểu dữ liệu (Generic T) mà hàm `work` trả về
 */
export async function withTransaction<T>(
  connection: Connection,
  work: (session: ClientSession) => Promise<T>,
): Promise<T> {
  const session = await connection.startSession();
  session.startTransaction();

  try {
    // Chạy logic nghiệp vụ và hứng kết quả trả về
    const result = await work(session);

    // Nếu mượt mà thì commit
    await session.commitTransaction();
    return result;
  } catch (error) {
    // Nếu lỗi thì tự động rollback
    await session.abortTransaction();
    throw error; // Re-throw lỗi để tầng Controller hoặc Global Filter hứng và xử lý tiếp
  } finally {
    // Luôn luôn đóng session để giải phóng tài nguyên
    await session.endSession();
  }
}
