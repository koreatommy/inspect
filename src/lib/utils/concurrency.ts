/**
 * 동시성 제한 유틸리티
 * 
 * 주어진 아이템 배열에 대해 비동기 함수를 동시성 제한과 함께 실행합니다.
 * Promise.all과 달리 동시에 실행되는 작업 수를 제한합니다.
 */
export async function mapWithConcurrency<T, R>(
  items: T[],
  fn: (item: T, index: number) => Promise<R>,
  concurrency: number,
): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let currentIndex = 0

  async function worker() {
    while (currentIndex < items.length) {
      const index = currentIndex++
      const item = items[index]!
      results[index] = await fn(item, index)
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => worker(),
  )

  await Promise.all(workers)
  return results
}

/**
 * 배열을 지정된 크기의 청크로 분할합니다.
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}
