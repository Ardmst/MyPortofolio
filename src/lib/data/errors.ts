/**
 * The one error type the data layer lets escape.
 *
 * `message` is always safe to show to a visitor: it is one of a handful of
 * hand-written sentences, never a raw driver, filesystem or Supabase message.
 * The underlying cause is logged on the server instead.
 */
export class RepositoryError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "RepositoryError";
    this.status = status;
  }
}
