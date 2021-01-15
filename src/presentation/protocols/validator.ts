export interface Validator <T> {
  validate (entity: T | undefined): Promise<T>
}
