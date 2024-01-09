export async function asyncHandler<T>(
  p: Promise<T>,
): Promise<[any | undefined, T | undefined]> {
  try {
    return [, await p];
  } catch (e) {
    return [e, undefined];
  }
}

const formatter = Intl.DateTimeFormat('es-MX', {
  year: 'numeric',
  day: 'numeric',
  month: 'long',
});

export function dateToLongDate(d: Date) {
  return formatter.format(d);
}
