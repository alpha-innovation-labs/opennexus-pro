let lock = Promise.resolve();

/**
 * Serializes durable annotation conversation store mutations in-process.
 *
 * @param action Store mutation to run exclusively.
 * @returns Mutation result.
 */
export async function withAnnotationConversationStoreLock<T>(action: () => Promise<T>): Promise<T> {
  const previous = lock;
  let release!: () => void;
  lock = new Promise<void>((resolve) => {
    release = resolve;
  });
  await previous;
  try {
    return await action();
  } finally {
    release();
  }
}
