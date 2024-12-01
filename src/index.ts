import { parse, type Submission } from '@conform-to/dom';
import { validate, validateSync, ValidationError } from 'class-validator';

export class ModelCreationError extends Error {}

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
          const { target, property, constraints, children } = current;

          // @ts-ignore
          const propFromTarget = target[property] as unknown;

          if (
            (Array.isArray(propFromTarget) &&
              propFromTarget.length > 0 &&
              !propFromTarget.some((arrayValue) => typeof arrayValue !== 'object')) ||
            Number(property) > -1
          ) {
            acc[property] = Object.values(resolveError(children as ValidationError[])).map(
              (error) =>
                Number(property) > -1 ? `[${property}]: ${error.join(', ')}` : error.join(', ')
            );
          } else {
            acc[property] = constraints ? Object.values(constraints) : [];
          }

          return acc;
        }, {});

      try {
        const model = new Model(payload as T);
        console.log('model', model);
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
      } catch (error) {
        console.log(error);
        if (error instanceof TypeError) {
          throw new ModelCreationError(`Failed to contruct Model for validation`);
        }
        throw new Error('Bad validation model passed!');
      }
    },
  });
}
