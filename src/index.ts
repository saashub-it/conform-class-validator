import { type Submission, parse } from '@conform-to/dom';
import { type ValidationError, validate, validateSync } from 'class-validator';

class ConformClassValidatorModel<T extends Record<string, any>> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, sonarjs/no-useless-constructor
  constructor(data: T) {
    // dummy class just for typing purposes
  }
}

type TConformClassValidatorModelConstructor<T extends Record<string, any>> = new (
  data: T,
  ...args: any[]
) => ConformClassValidatorModel<T>;

type TError = Record<string, string[]>;

export function parseWithClassValidator<T extends Record<string, any>>(
  payload: FormData,
  config: {
    schema: TConformClassValidatorModelConstructor<T>;
    async?: false;
  }
): Submission<T, string[]>;

export function parseWithClassValidator<T extends Record<string, any>>(
  payload: FormData,
  config: {
    schema: TConformClassValidatorModelConstructor<T>;
    async: true;
  }
): Promise<Submission<T, string[]>>;

export function parseWithClassValidator<T extends Record<string, any>>(
  payload: FormData,
  config: {
    schema: TConformClassValidatorModelConstructor<T>;
    async?: boolean;
  }
): Submission<T, string[]> | Promise<Submission<T, string[]>> {
  return parse<T, string[]>(payload, {
    resolve(payload) {
      const { schema: Model } = config;

      const resolveError = (errors: ValidationError[]): TError =>
        errors.reduce((acc: TError, current: ValidationError) => {
          acc[current.property] = current.constraints ? Object.values(current.constraints) : [];

          return acc;
        }, {});

      try {
        const model = new Model(payload as T);

        const resolveSubmission = (
          errors: ValidationError[]
        ): { value: undefined; error: TError } | { value: T; error: undefined } => {
          if (errors.length > 0) {
            return { value: undefined, error: resolveError(errors) };
          }

          return {
            value: Object.getOwnPropertyNames(model).reduce((acc: T, modelPublicKey: string) => {
              // @ts-ignore
              acc[modelPublicKey] = model[modelPublicKey];

              return acc;
            }, {} as T),
            error: undefined,
          };
        };

        if (!config.async) {
          return resolveSubmission(validateSync(model));
        }

        return validate(model).then(resolveSubmission);
      } catch {
        throw new Error('Bad validation model passed!');
      }
    },
  });
}
