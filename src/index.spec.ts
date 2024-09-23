/* eslint-disable max-lines-per-function */
/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable sonarjs/no-hardcoded-ip */

import {
  ArrayContains,
  ArrayMaxSize,
  ArrayMinSize,
  ArrayNotContains,
  ArrayNotEmpty,
  ArrayUnique,
  Contains,
  Equals,
  IsAlpha,
  IsAlphanumeric,
  IsAscii,
  IsBase32,
  IsBase58,
  IsBase64,
  IsBIC,
  IsBooleanString,
  IsBtcAddress,
  IsByteLength,
  IsCreditCard,
  IsCurrency,
  IsDataURI,
  IsDateString,
  IsDecimal,
  IsDefined,
  IsDivisibleBy,
  IsEAN,
  IsEmail,
  IsEmpty,
  IsEnum,
  IsEthereumAddress,
  IsFirebasePushId,
  IsFQDN,
  IsFullWidth,
  IsHalfWidth,
  IsHash,
  IsHexadecimal,
  IsHexColor,
  IsHSL,
  IsIBAN,
  IsIdentityCard,
  IsIn,
  IsIP,
  IsISBN,
  IsISIN,
  IsISO31661Alpha2,
  IsISO31661Alpha3,
  IsISO4217CurrencyCode,
  IsISRC,
  IsISSN,
  IsJSON,
  IsJWT,
  IsLatitude,
  IsLatLong,
  IsLongitude,
  IsLowercase,
  IsMACAddress,
  IsMagnetURI,
  IsMilitaryTime,
  IsMimeType,
  IsMobilePhone,
  IsMongoId,
  IsMultibyte,
  IsNegative,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNotIn,
  IsNumberString,
  IsObject,
  IsOctal,
  IsPassportNumber,
  IsPhoneNumber,
  IsPort,
  IsPositive,
  IsPostalCode,
  IsRFC3339,
  IsRgbColor,
  IsSemVer,
  IsStrongPassword,
  IsSurrogatePair,
  IsTaxId,
  IsTimeZone,
  IsUppercase,
  IsUrl,
  IsUUID,
  IsVariableWidth,
  Length,
  Matches,
  Max,
  MaxDate,
  MaxLength,
  Min,
  MinDate,
  MinLength,
  NotContains,
  NotEquals,
} from 'class-validator';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { ModelCreationError, parseWithClassValidator } from './index';

const createFormData = (entries: Array<[string, FormDataEntryValue]>): FormData => {
  const formData = new FormData();

  for (const [name, value] of entries) {
    formData.append(name, value);
  }

  return formData;
};

beforeEach(() => {
  vi.unstubAllGlobals();
});

const enum ETestEnum {
  VALUE = 'VALUE',
  NO_VALUE = 'NO_VALUE',
}

interface IBasicPayload {
  name: string;
  qty: string;
  casting?: any;
}

interface ITypePayload {
  name: string;
  qty: number;
  date: Date;
  fraction: number;
  tags: Array<string>;
  bool: boolean;
  enum: ETestEnum;
  obj: string;
}

describe('conform-class-validator', () => {
  describe('parseWithClassValidator', () => {
    describe('Basic functionality', () => {
      class TestModel {
        constructor(data: IBasicPayload) {
          this.name = data.name;
          this.qty = Number(data.qty);

          this.casting = data.casting ? data.casting.test.notHere : undefined;
        }

        @IsNotEmpty({ message: 'IsNotEmpty' })
        @MinLength(3, { message: 'MinLength' })
        name: string;

        @Min(1, { message: 'Min' })
        qty: number;

        casting?: Date;
      }

      test('no data', () => {
        expect(
          parseWithClassValidator(
            createFormData([
              ['name', ''],
              ['qty', ''],
            ]),
            {
              schema: TestModel,
            }
          )
        ).toEqual({
          status: 'error',
          payload: { name: '', qty: '' },
          error: { name: ['MinLength', 'IsNotEmpty'], qty: ['Min'] },
          reply: expect.any(Function),
        });
      });

      test('no name', () => {
        expect(
          parseWithClassValidator(createFormData([['qty', '5']]), {
            schema: TestModel,
          })
        ).toEqual({
          status: 'error',
          payload: { qty: '5' },
          error: { name: ['MinLength', 'IsNotEmpty'] },
          reply: expect.any(Function),
        });
      });

      test('no qty', () => {
        expect(
          parseWithClassValidator(createFormData([['name', 'John']]), {
            schema: TestModel,
          })
        ).toEqual({
          status: 'error',
          payload: { name: 'John' },
          error: { qty: ['Min'] },
          reply: expect.any(Function),
        });
      });

      test('all good', () => {
        expect(
          parseWithClassValidator(
            createFormData([
              ['name', 'John'],
              ['qty', '5'],
            ]),
            {
              schema: TestModel,
            }
          )
        ).toEqual({
          status: 'success',
          payload: { name: 'John', qty: '5' },
          value: { name: 'John', qty: 5 },
          reply: expect.any(Function),
        });
      });

      test('it throws a ModelCreationError on failed construction', () => {
        try {
          parseWithClassValidator(createFormData([['casting', 'test']]), {
            schema: TestModel,
          });
        } catch (e: any) {
          expect(e).toBeInstanceOf(ModelCreationError);
        }
      });
    });
    describe('Data type checks', () => {
      describe('@IsDefined', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsDefined()
          name: string;
        }

        test('it does not show errors if value is defined', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'John']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'success',
            payload: { name: 'John' },
            value: { name: 'John' },
            reply: expect.any(Function),
          });
        });

        test('it does not show errors if value is empty', () => {
          expect(
            parseWithClassValidator(createFormData([['name', '']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'success',
            payload: { name: '' },
            value: { name: '' },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value is undefined', () => {
          expect(
            // @ts-expect-error We are testing an invalid input
            parseWithClassValidator(createFormData([[]]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            error: {
              name: ['name should not be null or undefined'],
            },
            payload: { undefined: 'undefined' },
            reply: expect.any(Function),
          });
        });
      });
      describe('@Equals', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @Equals('test')
          name: string;
        }

        test('it does not show errors if value matches the expected', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'test']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'success',
            payload: { name: 'test' },
            value: { name: 'test' },
            reply: expect.any(Function),
          });
        });
        test('it shows an error on a different value', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'invalid']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: 'invalid' },
            error: {
              name: ['name must be equal to test'],
            },
            reply: expect.any(Function),
          });
        });
        test('it shows an error on a undefined field', () => {
          expect(
            // @ts-expect-error We are testing an invalid input
            parseWithClassValidator(createFormData([[]]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { undefined: 'undefined' },
            error: {
              name: ['name must be equal to test'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@NotEquals', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @NotEquals('test')
          name: string;
        }

        test('it does not show errors if value is not forbidden', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'notTest']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'success',
            payload: { name: 'notTest' },
            value: { name: 'notTest' },
            reply: expect.any(Function),
          });
        });
        test('it shows an error on forbidden value', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'test']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: 'test' },
            error: {
              name: ['name should not be equal to test'],
            },
            reply: expect.any(Function),
          });
        });
        test('it does not show an error on a undefined field', () => {
          expect(
            // @ts-expect-error We are testing an invalid input
            parseWithClassValidator(createFormData([[]]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'success',
            payload: { undefined: 'undefined' },
            value: { name: undefined },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsEmpty', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsEmpty()
          name: string;
        }

        test('it does not show errors if value is empty', () => {
          expect(
            // @ts-expect-error We are testing an invalid input
            parseWithClassValidator(createFormData([[]]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'success',
            payload: { undefined: 'undefined' },
            value: { name: undefined },
            reply: expect.any(Function),
          });
        });

        test('it shows errors on any value', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'value']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: 'value' },
            error: { name: ['name must be empty'] },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsNotEmpty', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsNotEmpty()
          name: string;
        }

        test('it does not show errors if value is not empty', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'value']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'success',
            payload: { name: 'value' },
            value: { name: 'value' },
            reply: expect.any(Function),
          });
        });

        test('it shows errors on empty value', () => {
          expect(
            parseWithClassValidator(createFormData([['name', '']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: '' },
            error: { name: ['name should not be empty'] },
            reply: expect.any(Function),
          });
        });

        test('it shows errors on no value', () => {
          expect(
            // @ts-expect-error We are testing an invalid input
            parseWithClassValidator(createFormData([[]]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { undefined: 'undefined' },
            error: { name: ['name should not be empty'] },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsIn', () => {
        const valueArray = ['test', 'value'];

        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsIn(valueArray)
          name: string;
        }

        test('it does not show errors if value is in array', () => {
          expect(
            parseWithClassValidator(createFormData([['name', valueArray[0]]]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'success',
            payload: { name: valueArray[0] },
            value: { name: valueArray[0] },
            reply: expect.any(Function),
          });
        });

        test('it shows an error presented an value outside of array', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'notInArray']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: 'notInArray' },
            error: {
              name: ['name must be one of the following values: test, value'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsNotIn', () => {
        const valueArray = ['test', 'value'];

        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsNotIn(valueArray)
          name: string;
        }

        test('it does not show errors if value is outside of array', () => {
          expect(
            parseWithClassValidator(createFormData([['name', valueArray[0]]]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: valueArray[0] },
            error: {
              name: ['name should not be one of the following values: test, value'],
            },
            reply: expect.any(Function),
          });
        });

        test('it doet not show an error presented an value outside of array', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'notInArray']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'success',
            payload: { name: 'notInArray' },
            value: { name: 'notInArray' },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsEnum', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.enum = data.enum;
          }
          // @ts-expect-error We are testing an invalid input
          @IsEnum(ETestEnum)
          enum: ETestEnum;
        }

        test('it shows an error if value does not fulfill the enum', () => {
          expect(
            parseWithClassValidator(createFormData([['enum', 'test']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { enum: 'test' },
            error: {
              enum: ['enum must be one of the following values: VALUE, NO_VALUE'],
            },
            reply: expect.any(Function),
          });
        });

        test('it does not show an error if the value fulfills the enum', () => {
          expect(
            parseWithClassValidator(createFormData([['enum', ETestEnum.VALUE]]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'success',
            payload: { enum: ETestEnum.VALUE },
            value: { enum: ETestEnum.VALUE },
            reply: expect.any(Function),
          });
        });
      });
      describe('@Min', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.qty = Number(data.qty);
          }

          @Min(4)
          qty: number;
        }

        test('it shows an error if value is lower then minimum', () => {
          expect(
            parseWithClassValidator(createFormData([['qty', '1']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { qty: '1' },
            error: { qty: ['qty must not be less than 4'] },
            reply: expect.any(Function),
          });
        });

        test('it does not show an error if the value is larger than minimum', () => {
          expect(
            parseWithClassValidator(createFormData([['qty', '10']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'success',
            payload: { qty: '10' },
            value: { qty: 10 },
            reply: expect.any(Function),
          });
        });
      });
      describe('@Max', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.qty = Number(data.qty);
          }

          @Max(4)
          qty: number;
        }

        test('it shows an error if value is higher than maximum', () => {
          expect(
            parseWithClassValidator(createFormData([['qty', '5']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { qty: '5' },
            error: { qty: ['qty must not be greater than 4'] },
            reply: expect.any(Function),
          });
        });

        test('it does not show an error if the value is smaller than maximum', () => {
          expect(
            parseWithClassValidator(createFormData([['qty', '2']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'success',
            payload: { qty: '2' },
            value: { qty: 2 },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsDivisibleBy', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.qty = Number(data.qty);
          }

          @IsDivisibleBy(2)
          qty: number;
        }

        test('it shows an error if value is not divisible by 2', () => {
          expect(
            parseWithClassValidator(createFormData([['qty', '5']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { qty: '5' },
            error: { qty: ['qty must be divisible by 2'] },
            reply: expect.any(Function),
          });
        });

        test('it does not show an error if the value is devisible by 2', () => {
          expect(
            parseWithClassValidator(createFormData([['qty', '2']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'success',
            payload: { qty: '2' },
            value: { qty: 2 },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsPositive', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.qty = Number(data.qty);
          }

          @IsPositive()
          qty: number;
        }

        test('it shows an error if value is not positive', () => {
          expect(
            parseWithClassValidator(createFormData([['qty', '-5']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { qty: '-5' },
            error: { qty: ['qty must be a positive number'] },
            reply: expect.any(Function),
          });
        });

        test('it does not show an error if the value is positive', () => {
          expect(
            parseWithClassValidator(createFormData([['qty', '2']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'success',
            payload: { qty: '2' },
            value: { qty: 2 },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsNegative', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.qty = Number(data.qty);
          }

          @IsNegative()
          qty: number;
        }

        test('it shows an error if value is not negative', () => {
          expect(
            parseWithClassValidator(createFormData([['qty', '5']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { qty: '5' },
            error: { qty: ['qty must be a negative number'] },
            reply: expect.any(Function),
          });
        });

        test('it does not show an error if the value is positive', () => {
          expect(
            parseWithClassValidator(createFormData([['qty', '-2']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'success',
            payload: { qty: '-2' },
            value: { qty: -2 },
            reply: expect.any(Function),
          });
        });
      });
      describe('@MinDate', () => {
        const testDateString = 'Sun Sep 15 2024 00:06:25 GMT+0200';

        class TestModel {
          constructor(data: ITypePayload) {
            this.date = new Date(data.date);
          }

          @MinDate(new Date(testDateString))
          date: Date;
        }

        test('it shows an error if value before than minimum date', () => {
          expect(
            parseWithClassValidator(
              createFormData([['date', 'Sun Sep 14 2024 00:06:25 GMT+0200']]),
              {
                schema: TestModel,
              }
            )
          ).toEqual({
            status: 'error',
            payload: { date: 'Sun Sep 14 2024 00:06:25 GMT+0200' },
            error: {
              date: [
                'minimal allowed date for date is Sun Sep 15 2024 00:06:25 GMT+0200 (czas środkowoeuropejski letni)',
              ],
            },
            reply: expect.any(Function),
          });
        });

        test('it does not show an error if the value after minimum date', () => {
          expect(
            parseWithClassValidator(
              createFormData([['date', 'Sun Sep 16 2024 00:06:25 GMT+0200']]),
              {
                schema: TestModel,
              }
            )
          ).toEqual({
            status: 'success',
            payload: { date: 'Sun Sep 16 2024 00:06:25 GMT+0200' },
            value: { date: new Date('Sun Sep 16 2024 00:06:25 GMT+0200') },
            reply: expect.any(Function),
          });
        });
      });
      describe('@MaxDate', () => {
        const testDateString = 'Sun Sep 15 2024 00:06:25 GMT+0200';

        class TestModel {
          constructor(data: ITypePayload) {
            this.date = new Date(data.date);
          }

          @MaxDate(new Date(testDateString))
          date: Date;
        }

        test('it shows an error if value after than max date', () => {
          expect(
            parseWithClassValidator(
              createFormData([['date', 'Sun Sep 24 2024 00:06:25 GMT+0200']]),
              {
                schema: TestModel,
              }
            )
          ).toEqual({
            status: 'error',
            payload: { date: 'Sun Sep 24 2024 00:06:25 GMT+0200' },
            error: {
              date: [
                'maximal allowed date for date is Sun Sep 15 2024 00:06:25 GMT+0200 (czas środkowoeuropejski letni)',
              ],
            },
            reply: expect.any(Function),
          });
        });

        test('it does not show an error if the value before maximum date', () => {
          expect(
            parseWithClassValidator(
              createFormData([['date', 'Sun Sep 12 2024 00:06:25 GMT+0200']]),
              {
                schema: TestModel,
              }
            )
          ).toEqual({
            status: 'success',
            payload: { date: 'Sun Sep 12 2024 00:06:25 GMT+0200' },
            value: { date: new Date('Sun Sep 12 2024 00:06:25 GMT+0200') },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsBooleanString', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsBooleanString()
          name: string;
        }

        test('it does not show errors if value is a boolean string', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'false']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'success',
            payload: { name: 'false' },
            value: { name: 'false' },
            reply: expect.any(Function),
          });
        });

        test('it shows errors on a non boolean value', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'value']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: 'value' },
            error: { name: ['name must be a boolean string'] },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsDateString', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsDateString()
          name: string;
        }

        test('it does not show errors if value is a date string', () => {
          expect(
            parseWithClassValidator(createFormData([['name', '2016-09-18T17:34:02.666Z']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'success',
            payload: { name: '2016-09-18T17:34:02.666Z' },
            value: { name: '2016-09-18T17:34:02.666Z' },
            reply: expect.any(Function),
          });
        });

        test('it shows errors on a non date value', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'value']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: 'value' },
            error: { name: ['name must be a valid ISO 8601 date string'] },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsNumberString', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsNumberString()
          name: string;
        }

        test('it does not show errors if value is a number string', () => {
          expect(
            parseWithClassValidator(createFormData([['name', '45']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'success',
            payload: { name: '45' },
            value: { name: '45' },
            reply: expect.any(Function),
          });
        });

        test('it shows errors on a non number value', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'value']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: 'value' },
            error: { name: ['name must be a number string'] },
            reply: expect.any(Function),
          });
        });
      });
      describe('@Contains', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @Contains('test')
          name: string;
        }

        test('it does not show errors if value contains the seed', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'A fancy test string']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'success',
            payload: { name: 'A fancy test string' },
            value: { name: 'A fancy test string' },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value does not contain a seed', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'value']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: 'value' },
            error: { name: ['name must contain a test string'] },
            reply: expect.any(Function),
          });
        });
      });
      describe('@NotContains', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @NotContains('test')
          name: string;
        }

        test('it does not show errors if value contains the seed', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'A fancy string']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'success',
            payload: { name: 'A fancy string' },
            value: { name: 'A fancy string' },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value does contain a seed', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'test']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: 'test' },
            error: { name: ['name should not contain a test string'] },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsAlpha', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsAlpha()
          name: string;
        }

        test('it does not show errors if value contains the alpha characters only', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'AFancyString']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'success',
            payload: { name: 'AFancyString' },
            value: { name: 'AFancyString' },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value contains numeric characters', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'test123']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: 'test123' },
            error: { name: ['name must contain only letters (a-zA-Z)'] },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsAlphanumeric', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsAlphanumeric()
          name: string;
        }

        test('it does not show errors if value contains the alphanumeric characters only', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'AFancyString123']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'success',
            payload: { name: 'AFancyString123' },
            value: { name: 'AFancyString123' },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value contains spaces characters', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'test123 test']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: 'test123 test' },
            error: { name: ['name must contain only letters and numbers'] },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsDecimal', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsDecimal()
          name: string;
        }

        test('it does not show errors if value a valid decimal', () => {
          expect(
            parseWithClassValidator(createFormData([['name', '9.11']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'success',
            payload: { name: '9.11' },
            value: { name: '9.11' },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value is not a valid decimal', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'test']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: 'test' },
            error: { name: ['name is not a valid decimal number.'] },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsAscii', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsAscii()
          name: string;
        }

        test('it does not show errors if value contains only ASCII characters', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'a!1?/{}[]']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'success',
            payload: { name: 'a!1?/{}[]' },
            value: { name: 'a!1?/{}[]' },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value contains non ASCII characters', () => {
          expect(
            parseWithClassValidator(createFormData([['name', '💩💩💩💩']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: '💩💩💩💩' },
            error: { name: ['name must contain only ASCII characters'] },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsBase32', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsBase32()
          name: string;
        }

        test('it does not show errors if value is not Base32 encoded', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'KRSXG5BAKRSXG5A=']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'success',
            payload: { name: 'KRSXG5BAKRSXG5A=' },
            value: { name: 'KRSXG5BAKRSXG5A=' },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value is not base 32 encoded', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'test']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: 'test' },
            error: { name: ['name must be base32 encoded'] },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsBase58', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsBase58()
          name: string;
        }

        test('it does not show errors if value is not Base52 encoded', () => {
          expect(
            parseWithClassValidator(createFormData([['name', '7YHPehwVrU9e2b']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'success',
            payload: { name: '7YHPehwVrU9e2b' },
            value: { name: '7YHPehwVrU9e2b' },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value is not base 58 encoded', () => {
          expect(
            parseWithClassValidator(createFormData([['name', '123!!!']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: '123!!!' },
            error: { name: ['name must be base58 encoded'] },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsBase64', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsBase64()
          name: string;
        }

        test('it does not show errors if value is not Base64 encoded', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'dGVzdCB0ZXN0']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'success',
            payload: { name: 'dGVzdCB0ZXN0' },
            value: { name: 'dGVzdCB0ZXN0' },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value is not base64 encoded', () => {
          expect(
            parseWithClassValidator(createFormData([['name', '123!!!']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: '123!!!' },
            error: { name: ['name must be base64 encoded'] },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsIBAN', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsIBAN()
          name: string;
        }

        test('it does not show errors if value is a IBAN number', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'PL10105000997603123456789123']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'success',
            payload: { name: 'PL10105000997603123456789123' },
            value: { name: 'PL10105000997603123456789123' },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value is not a valid IBAN', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'test']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: 'test' },
            error: { name: ['name must be an IBAN'] },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsBIC', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsBIC()
          name: string;
        }

        test('it does not show errors if value is a BIC number', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'HBUKGB4B']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'success',
            payload: { name: 'HBUKGB4B' },
            value: { name: 'HBUKGB4B' },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value is not a valid BIC', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'test']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: 'test' },
            error: { name: ['name must be a BIC or SWIFT code'] },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsByteLength', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsByteLength(2, 10)
          name: string;
        }

        test('it does not show errors if value is within the byte length', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'Test']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'success',
            payload: { name: 'Test' },
            value: { name: 'Test' },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value does not meet the minimum byte length', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 't']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: 't' },
            error: {
              name: ["name's byte length must fall into (2, 10) range"],
            },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value does not meet the maximum byte length', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'test test test test']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: 'test test test test' },
            error: {
              name: ["name's byte length must fall into (2, 10) range"],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsCreditCard', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsCreditCard()
          name: string;
        }

        test('it does not show errors if value is a valid credit card number', () => {
          expect(
            parseWithClassValidator(createFormData([['name', '5425233430109903']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'success',
            payload: { name: '5425233430109903' },
            value: { name: '5425233430109903' },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value is not a valid credit card number', () => {
          expect(
            parseWithClassValidator(createFormData([['name', '0000000000000']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: '0000000000000' },
            error: {
              name: ['name must be a credit card'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsCurrency', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsCurrency()
          name: string;
        }

        test('it does not show errors if value is a valid currency string', () => {
          expect(
            parseWithClassValidator(createFormData([['name', '$15.01']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'success',
            payload: { name: '$15.01' },
            value: { name: '$15.01' },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value is not a valid currency string', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'test']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: 'test' },
            error: {
              name: ['name must be a currency'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsISO4217CurrencyCode', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsISO4217CurrencyCode()
          name: string;
        }

        test('it does not show errors if value is a valid currency cude', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'USD']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'success',
            payload: { name: 'USD' },
            value: { name: 'USD' },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value is not a valid currency code', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'test']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: 'test' },
            error: {
              name: ['name must be a valid ISO4217 currency code'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsEthereumAddress', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsEthereumAddress()
          name: string;
        }

        test('it does not show errors if value is a valid Ethereum Address', () => {
          expect(
            parseWithClassValidator(
              createFormData([['name', '0x71C7656EC7ab88b098defB751B7401B5f6d8976F']]),
              {
                schema: TestModel,
              }
            )
          ).toEqual({
            status: 'success',
            payload: { name: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F' },
            value: { name: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F' },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value is not a valid Ethereum adress', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'test']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: 'test' },
            error: {
              name: ['name must be an Ethereum address'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsBtcAddress', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsBtcAddress()
          name: string;
        }

        test('it does not show errors if value is a valid BTC address', () => {
          expect(
            parseWithClassValidator(
              createFormData([['name', '3FZbgi29cpjq2GjdwV111HuJJnkLtktZc5']]),
              {
                schema: TestModel,
              }
            )
          ).toEqual({
            status: 'success',
            payload: { name: '3FZbgi29cpjq2GjdwV111HuJJnkLtktZc5' },
            value: { name: '3FZbgi29cpjq2GjdwV111HuJJnkLtktZc5' },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value is not a valid BTC address', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'test']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: 'test' },
            error: {
              name: ['name must be a BTC address'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsDataURI', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsDataURI()
          name: string;
        }

        test('it does not show errors if value is a valid data URI', () => {
          expect(
            parseWithClassValidator(
              createFormData([
                [
                  'name',
                  'data:image/gif;base64,R0lGODlhEAAQAMQAAORHHOVSKudfOulrSOp3WOyDZu6QdvCchPGolfO0o/XBs/fNwfjZ0frl3/zy7////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAkAABAALAAAAAAQABAAAAVVICSOZGlCQAosJ6mu7fiyZeKqNKToQGDsM8hBADgUXoGAiqhSvp5QAnQKGIgUhwFUYLCVDFCrKUE1lBavAViFIDlTImbKC5Gm2hB0SlBCBMQiB0UjIQA7',
                ],
              ]),
              {
                schema: TestModel,
              }
            )
          ).toEqual({
            status: 'success',
            payload: {
              name: 'data:image/gif;base64,R0lGODlhEAAQAMQAAORHHOVSKudfOulrSOp3WOyDZu6QdvCchPGolfO0o/XBs/fNwfjZ0frl3/zy7////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAkAABAALAAAAAAQABAAAAVVICSOZGlCQAosJ6mu7fiyZeKqNKToQGDsM8hBADgUXoGAiqhSvp5QAnQKGIgUhwFUYLCVDFCrKUE1lBavAViFIDlTImbKC5Gm2hB0SlBCBMQiB0UjIQA7',
            },
            value: {
              name: 'data:image/gif;base64,R0lGODlhEAAQAMQAAORHHOVSKudfOulrSOp3WOyDZu6QdvCchPGolfO0o/XBs/fNwfjZ0frl3/zy7////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAkAABAALAAAAAAQABAAAAVVICSOZGlCQAosJ6mu7fiyZeKqNKToQGDsM8hBADgUXoGAiqhSvp5QAnQKGIgUhwFUYLCVDFCrKUE1lBavAViFIDlTImbKC5Gm2hB0SlBCBMQiB0UjIQA7',
            },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value is not a valid data URI', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'test']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: 'test' },
            error: {
              name: ['name must be a data uri format'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsEmail', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsEmail()
          name: string;
        }

        test('it does not show errors if value is a valid email', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'contact@trackbook.it']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'success',
            payload: {
              name: 'contact@trackbook.it',
            },
            value: {
              name: 'contact@trackbook.it',
            },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value is not a valid email', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'test']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: 'test' },
            error: {
              name: ['name must be an email'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsFQDN', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsFQDN()
          name: string;
        }

        test('it does not show errors if value is a valid domain', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'trackbook.it']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'success',
            payload: {
              name: 'trackbook.it',
            },
            value: {
              name: 'trackbook.it',
            },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value is not a valid domain', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'test']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: 'test' },
            error: {
              name: ['name must be a valid domain name'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsFullWidth', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsFullWidth()
          name: string;
        }

        test('it does not show errors if value contains full width chars', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'test ⓵']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'success',
            payload: {
              name: 'test ⓵',
            },
            value: {
              name: 'test ⓵',
            },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value does not contain a full width character', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'test']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: 'test' },
            error: {
              name: ['name must contain a full-width characters'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsHalfWidth', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsHalfWidth()
          name: string;
        }

        test('it does not show errors if value contains half width characters', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'test']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'success',
            payload: {
              name: 'test',
            },
            value: {
              name: 'test',
            },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value does not contain a half width characters', () => {
          expect(
            parseWithClassValidator(createFormData([['name', '⓵⓵⓵⓵']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: '⓵⓵⓵⓵' },
            error: {
              name: ['name must contain a half-width characters'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsVariableWidth', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsVariableWidth()
          name: string;
        }

        test('it does not show errors if value contains a mix if half and full width characters', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'test ⓵']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'success',
            payload: {
              name: 'test ⓵',
            },
            value: {
              name: 'test ⓵',
            },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value does not contain a mix if half and full width characters', () => {
          expect(
            parseWithClassValidator(createFormData([['name', '⓵⓵⓵⓵']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: '⓵⓵⓵⓵' },
            error: {
              name: ['name must contain a full-width and half-width characters'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsHexColor', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsHexColor()
          name: string;
        }

        test('it does not show errors if value is a hex color', () => {
          expect(
            parseWithClassValidator(createFormData([['name', '#111111']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'success',
            payload: {
              name: '#111111',
            },
            value: {
              name: '#111111',
            },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value is not a hex color', () => {
          expect(
            parseWithClassValidator(createFormData([['name', '⓵⓵⓵⓵']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: '⓵⓵⓵⓵' },
            error: {
              name: ['name must be a hexadecimal color'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsHSL', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsHSL()
          name: string;
        }

        test('it does not show errors if value is a hsl color', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'hsl(0, 0%, 7%)']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'success',
            payload: {
              name: 'hsl(0, 0%, 7%)',
            },
            value: {
              name: 'hsl(0, 0%, 7%)',
            },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value is not a hsl color', () => {
          expect(
            parseWithClassValidator(createFormData([['name', '⓵⓵⓵⓵']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: '⓵⓵⓵⓵' },
            error: {
              name: ['name must be a HSL color'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsRgbColor', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsRgbColor()
          name: string;
        }

        test('it does not show errors if value is a RGB color', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'rgb(0,0,0)']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'success',
            payload: {
              name: 'rgb(0,0,0)',
            },
            value: {
              name: 'rgb(0,0,0)',
            },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value is not a RGB color', () => {
          expect(
            parseWithClassValidator(createFormData([['name', '⓵⓵⓵⓵']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: '⓵⓵⓵⓵' },
            error: {
              name: ['name must be RGB color'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsIdentityCard', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsIdentityCard('PL')
          name: string;
        }

        test('it does not show errors if value is a valid ID number', () => {
          expect(
            parseWithClassValidator(createFormData([['name', '04060421139']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'success',
            payload: {
              name: '04060421139',
            },
            value: {
              name: '04060421139',
            },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value is not a valid ID number', () => {
          expect(
            parseWithClassValidator(createFormData([['name', '⓵⓵⓵⓵']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: '⓵⓵⓵⓵' },
            error: {
              name: ['name must be a identity card number'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsPassportNumber', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsPassportNumber('PL')
          name: string;
        }

        test('it does not show errors if value is a valid passport number', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'EN7313144']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'success',
            payload: {
              name: 'EN7313144',
            },
            value: {
              name: 'EN7313144',
            },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value is not a valid passport number', () => {
          expect(
            parseWithClassValidator(createFormData([['name', '⓵⓵⓵⓵']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: '⓵⓵⓵⓵' },
            error: {
              name: ['name must be valid passport number'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsPostalCode', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsPostalCode('PL')
          name: string;
        }

        test('it does not show errors if value is a valid postal code', () => {
          expect(
            parseWithClassValidator(createFormData([['name', '91-464']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'success',
            payload: {
              name: '91-464',
            },
            value: {
              name: '91-464',
            },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value is not a valid postal code', () => {
          expect(
            parseWithClassValidator(createFormData([['name', '⓵⓵⓵⓵']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: '⓵⓵⓵⓵' },
            error: {
              name: ['name must be a postal code'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsHexadecimal', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsHexadecimal()
          name: string;
        }

        test('it does not show errors if value is a hexadecimal number', () => {
          expect(
            parseWithClassValidator(createFormData([['name', '123']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'success',
            payload: {
              name: '123',
            },
            value: {
              name: '123',
            },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value is not a hexadecimal number', () => {
          expect(
            parseWithClassValidator(createFormData([['name', '1-1']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: '1-1' },
            error: {
              name: ['name must be a hexadecimal number'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsOctal', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsOctal()
          name: string;
        }

        test('it does not show errors if value is a octal number', () => {
          expect(
            parseWithClassValidator(createFormData([['name', '123']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'success',
            payload: {
              name: '123',
            },
            value: {
              name: '123',
            },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value is not a octal number', () => {
          expect(
            parseWithClassValidator(createFormData([['name', '89']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: '89' },
            error: {
              name: ['name must be valid octal number'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsMACAddress', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsMACAddress()
          name: string;
        }

        test('it does not show errors if value is a MAC address', () => {
          expect(
            parseWithClassValidator(createFormData([['name', '89-F2-78-8F-CA-5B']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'success',
            payload: {
              name: '89-F2-78-8F-CA-5B',
            },
            value: {
              name: '89-F2-78-8F-CA-5B',
            },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value is not a valid MAC address', () => {
          expect(
            parseWithClassValidator(createFormData([['name', '00-0']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: '00-0' },
            error: {
              name: ['name must be a MAC Address'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsIP', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsIP()
          name: string;
        }

        test('it does not show errors if value is a IP address', () => {
          expect(
            parseWithClassValidator(createFormData([['name', '46.105.108.213']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'success',
            payload: {
              name: '46.105.108.213',
            },
            value: {
              name: '46.105.108.213',
            },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value is not a valid IP address', () => {
          expect(
            parseWithClassValidator(createFormData([['name', '00-0']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: '00-0' },
            error: {
              name: ['name must be an ip address'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsPort', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsPort()
          name: string;
        }

        test('it does not show errors if value is a valid port number', () => {
          expect(
            parseWithClassValidator(createFormData([['name', '5741']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'success',
            payload: {
              name: '5741',
            },
            value: {
              name: '5741',
            },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value is not a valid port number', () => {
          expect(
            parseWithClassValidator(createFormData([['name', '00']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: '00' },
            error: {
              name: ['name must be a port'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsISBN', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsISBN()
          name: string;
        }

        test('it does not show errors if value is a valid ISBN number', () => {
          expect(
            parseWithClassValidator(createFormData([['name', '978-83-240-9979-5']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'success',
            payload: {
              name: '978-83-240-9979-5',
            },
            value: {
              name: '978-83-240-9979-5',
            },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value is not a valid ISBN number', () => {
          expect(
            parseWithClassValidator(createFormData([['name', '00']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: '00' },
            error: {
              name: ['name must be an ISBN'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsEAN', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsEAN()
          name: string;
        }

        test('it does not show errors if value is a valid EAN number', () => {
          expect(
            parseWithClassValidator(createFormData([['name', '9788324099795']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'success',
            payload: {
              name: '9788324099795',
            },
            value: {
              name: '9788324099795',
            },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value is not a valid EAN number', () => {
          expect(
            parseWithClassValidator(createFormData([['name', '00']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: '00' },
            error: {
              name: ['name must be an EAN (European Article Number)'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsISIN', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsISIN()
          name: string;
        }

        test('it does not show errors if value is a valid ISIN number', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'US0004026250']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'success',
            payload: {
              name: 'US0004026250',
            },
            value: {
              name: 'US0004026250',
            },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value is not a valid ISIN number', () => {
          expect(
            parseWithClassValidator(createFormData([['name', '00']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: '00' },
            error: {
              name: ['name must be an ISIN (stock/security identifier)'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsJSON', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsJSON()
          name: string;
        }

        test('it does not show errors if value is a valid JSON string', () => {
          expect(
            parseWithClassValidator(
              createFormData([['name', '{"test":"test"}']]),

              {
                schema: TestModel,
              }
            )
          ).toEqual({
            status: 'success',
            payload: {
              name: '{"test":"test"}',
            },
            value: {
              name: '{"test":"test"}',
            },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value is not a valid JSON string', () => {
          expect(
            parseWithClassValidator(createFormData([['name', '00']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: '00' },
            error: {
              name: ['name must be a json string'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsJWT', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsJWT()
          name: string;
        }

        test('it does not show errors if value is a valid JWT string', () => {
          expect(
            parseWithClassValidator(
              createFormData([
                [
                  'name',
                  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
                ],
              ]),

              {
                schema: TestModel,
              }
            )
          ).toEqual({
            status: 'success',
            payload: {
              name: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
            },
            value: {
              name: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
            },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value is not a valid JWT string', () => {
          expect(
            parseWithClassValidator(createFormData([['name', '00']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: '00' },
            error: {
              name: ['name must be a jwt string'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsObject', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.obj = JSON.parse(data.obj);
          }

          @IsObject()
          obj: object;
        }

        test('it does not show errors if value is a valid object', () => {
          expect(
            parseWithClassValidator(
              createFormData([['obj', '{"test":"test"}']]),

              {
                schema: TestModel,
              }
            )
          ).toEqual({
            status: 'success',
            payload: {
              obj: '{"test":"test"}',
            },
            value: {
              obj: { test: 'test' },
            },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value is not a valid object', () => {
          expect(
            parseWithClassValidator(createFormData([['obj', 'null']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { obj: 'null' },
            error: {
              obj: ['obj must be an object'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsNotEmptyObject', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.obj = JSON.parse(data.obj);
          }

          @IsNotEmptyObject()
          obj: object;
        }

        test('it does not show errors if value is a not empty object', () => {
          expect(
            parseWithClassValidator(
              createFormData([['obj', '{"test":"test"}']]),

              {
                schema: TestModel,
              }
            )
          ).toEqual({
            status: 'success',
            payload: {
              obj: '{"test":"test"}',
            },
            value: {
              obj: { test: 'test' },
            },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value is a empty object', () => {
          expect(
            parseWithClassValidator(createFormData([['obj', '{}']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { obj: '{}' },
            error: {
              obj: ['obj must be a non-empty object'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsLowercase', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsLowercase()
          name: string;
        }

        test('it does not show errors if value lowercase only', () => {
          expect(
            parseWithClassValidator(
              createFormData([['name', 'test']]),

              {
                schema: TestModel,
              }
            )
          ).toEqual({
            status: 'success',
            payload: {
              name: 'test',
            },
            value: {
              name: 'test',
            },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value has a uppercase char', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'Test']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: 'Test' },
            error: {
              name: ['name must be a lowercase string'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsLatLong', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsLatLong()
          name: string;
        }

        test('it does not show errors if value is a valid long and lat string', () => {
          expect(
            parseWithClassValidator(
              createFormData([['name', '41.2415412442,22.124525124']]),

              {
                schema: TestModel,
              }
            )
          ).toEqual({
            status: 'success',
            payload: {
              name: '41.2415412442,22.124525124',
            },
            value: {
              name: '41.2415412442,22.124525124',
            },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value is not a valid long and lat string', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'test']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: 'test' },
            error: {
              name: ['name must be a latitude,longitude string'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsLatitude', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsLatitude()
          name: string;
        }

        test('it does not show errors if value is a valid lat string', () => {
          expect(
            parseWithClassValidator(
              createFormData([['name', '41.2415412442']]),

              {
                schema: TestModel,
              }
            )
          ).toEqual({
            status: 'success',
            payload: {
              name: '41.2415412442',
            },
            value: {
              name: '41.2415412442',
            },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value is not a valid lat string', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'test']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: 'test' },
            error: {
              name: ['name must be a latitude string or number'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsLongitude', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsLongitude()
          name: string;
        }

        test('it does not show errors if value is a valid long string', () => {
          expect(
            parseWithClassValidator(
              createFormData([['name', '22.2415412442']]),

              {
                schema: TestModel,
              }
            )
          ).toEqual({
            status: 'success',
            payload: {
              name: '22.2415412442',
            },
            value: {
              name: '22.2415412442',
            },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value is not a valid long string', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'test']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: 'test' },
            error: {
              name: ['name must be a longitude string or number'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsMobilePhone', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsMobilePhone('pl-PL')
          name: string;
        }

        test('it does not show errors if value is a valid phone number', () => {
          expect(
            parseWithClassValidator(
              createFormData([['name', '+48666666666']]),

              {
                schema: TestModel,
              }
            )
          ).toEqual({
            status: 'success',
            payload: {
              name: '+48666666666',
            },
            value: {
              name: '+48666666666',
            },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value is not a valid phone number', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'test']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: 'test' },
            error: {
              name: ['name must be a phone number'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsPhoneNumber', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsPhoneNumber('PL')
          name: string;
        }

        test('it does not show errors if value is a valid phone number', () => {
          expect(
            parseWithClassValidator(
              createFormData([['name', '+48666666666']]),

              {
                schema: TestModel,
              }
            )
          ).toEqual({
            status: 'success',
            payload: {
              name: '+48666666666',
            },
            value: {
              name: '+48666666666',
            },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value is not a valid phone number', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'test']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: 'test' },
            error: {
              name: ['name must be a valid phone number'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsISO31661Alpha2', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsISO31661Alpha2()
          name: string;
        }

        test('it does not show errors if value is a valid country code', () => {
          expect(
            parseWithClassValidator(
              createFormData([['name', 'PL']]),

              {
                schema: TestModel,
              }
            )
          ).toEqual({
            status: 'success',
            payload: {
              name: 'PL',
            },
            value: {
              name: 'PL',
            },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value is not a valid country code', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'test']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: 'test' },
            error: {
              name: ['name must be a valid ISO31661 Alpha2 code'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsISO31661Alpha3', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsISO31661Alpha3()
          name: string;
        }

        test('it does not show errors if value is a valid country code', () => {
          expect(
            parseWithClassValidator(
              createFormData([['name', 'POL']]),

              {
                schema: TestModel,
              }
            )
          ).toEqual({
            status: 'success',
            payload: {
              name: 'POL',
            },
            value: {
              name: 'POL',
            },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value is not a valid country code', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'test']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: 'test' },
            error: {
              name: ['name must be a valid ISO31661 Alpha3 code'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsLocale', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsISO31661Alpha3()
          name: string;
        }

        test('it does not show errors if value is a valid locale', () => {
          expect(
            parseWithClassValidator(
              createFormData([['name', 'POL']]),

              {
                schema: TestModel,
              }
            )
          ).toEqual({
            status: 'success',
            payload: {
              name: 'POL',
            },
            value: {
              name: 'POL',
            },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value is not a valid locale', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'test']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: 'test' },
            error: {
              name: ['name must be a valid ISO31661 Alpha3 code'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsMongoId', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsMongoId()
          name: string;
        }

        test('it does not show errors if value is a valid mongoDB ID', () => {
          expect(
            parseWithClassValidator(
              createFormData([['name', '507f1f77bcf86cd799439011']]),

              {
                schema: TestModel,
              }
            )
          ).toEqual({
            status: 'success',
            payload: {
              name: '507f1f77bcf86cd799439011',
            },
            value: {
              name: '507f1f77bcf86cd799439011',
            },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value is not a valid mongoDB ID', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'test']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: 'test' },
            error: {
              name: ['name must be a mongodb id'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsMultibyte', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsMultibyte()
          name: string;
        }

        test('it does not show errors if value contains a multibyte', () => {
          expect(
            parseWithClassValidator(
              createFormData([['name', 'test 􏿿']]),

              {
                schema: TestModel,
              }
            )
          ).toEqual({
            status: 'success',
            payload: {
              name: 'test 􏿿',
            },
            value: {
              name: 'test 􏿿',
            },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value does not contain a multibyte', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'test']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: 'test' },
            error: {
              name: ['name must contain one or more multibyte chars'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsSurrogatePair', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsSurrogatePair()
          name: string;
        }

        test('it does not show errors if value is a surrogate pair', () => {
          expect(
            parseWithClassValidator(
              createFormData([['name', '\uD83D\uDE00']]),

              {
                schema: TestModel,
              }
            )
          ).toEqual({
            status: 'success',
            payload: {
              name: '😀',
            },
            value: {
              name: '😀',
            },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value is not a surrogate pair', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'test']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: 'test' },
            error: {
              name: ['name must contain any surrogate pairs chars'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsTaxId', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsTaxId()
          name: string;
        }

        test('it does not show errors if value is a tax ID', () => {
          expect(
            parseWithClassValidator(
              createFormData([['name', '911923333']]),

              {
                schema: TestModel,
              }
            )
          ).toEqual({
            status: 'success',
            payload: {
              name: '911923333',
            },
            value: {
              name: '911923333',
            },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value is not a tax ID', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'test']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: 'test' },
            error: {
              name: ['name must be a Tax Identification Number'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsUrl', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsUrl()
          name: string;
        }

        test('it does not show errors if value is a valid URL', () => {
          expect(
            parseWithClassValidator(
              createFormData([['name', 'https://trackbook.it']]),

              {
                schema: TestModel,
              }
            )
          ).toEqual({
            status: 'success',
            payload: {
              name: 'https://trackbook.it',
            },
            value: {
              name: 'https://trackbook.it',
            },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value is not a valid URL', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'test']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: 'test' },
            error: {
              name: ['name must be a URL address'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsMagnetURI', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsMagnetURI()
          name: string;
        }

        test('it does not show errors if value is a valid magnet link', () => {
          expect(
            parseWithClassValidator(
              createFormData([
                ['name', 'magnet:?xt=urn:btih:5dee65101db281ac9c46344cd6b175cdcad53426&dn'],
              ]),

              {
                schema: TestModel,
              }
            )
          ).toEqual({
            status: 'success',
            payload: {
              name: 'magnet:?xt=urn:btih:5dee65101db281ac9c46344cd6b175cdcad53426&dn',
            },
            value: {
              name: 'magnet:?xt=urn:btih:5dee65101db281ac9c46344cd6b175cdcad53426&dn',
            },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value is not a valid magnet link', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'test']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: 'test' },
            error: {
              name: ['name must be magnet uri format'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsUUID', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsUUID()
          name: string;
        }

        test('it does not show errors if value is a valid UUID', () => {
          expect(
            parseWithClassValidator(
              createFormData([['name', '73cc27af-bd0d-4c16-a2f0-c246425faebe']]),

              {
                schema: TestModel,
              }
            )
          ).toEqual({
            status: 'success',
            payload: {
              name: '73cc27af-bd0d-4c16-a2f0-c246425faebe',
            },
            value: {
              name: '73cc27af-bd0d-4c16-a2f0-c246425faebe',
            },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value is not a valid UUID', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'test']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: 'test' },
            error: {
              name: ['name must be a UUID'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsFirebasePushId', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsFirebasePushId()
          name: string;
        }

        test('it does not show errors if value is a valid Firebase pushId', () => {
          expect(
            parseWithClassValidator(
              createFormData([['name', '-KD3rcGMuucRDjKOTK3O']]),

              {
                schema: TestModel,
              }
            )
          ).toEqual({
            status: 'success',
            payload: {
              name: '-KD3rcGMuucRDjKOTK3O',
            },
            value: {
              name: '-KD3rcGMuucRDjKOTK3O',
            },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value is not a valid Firebase push Id', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'test']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: 'test' },
            error: {
              name: ['name must be a Firebase Push Id'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsUppercase', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsUppercase()
          name: string;
        }

        test('it does not show errors if value is uppercase', () => {
          expect(
            parseWithClassValidator(
              createFormData([['name', 'TEST']]),

              {
                schema: TestModel,
              }
            )
          ).toEqual({
            status: 'success',
            payload: {
              name: 'TEST',
            },
            value: {
              name: 'TEST',
            },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value is not uppercase', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'test']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: 'test' },
            error: {
              name: ['name must be uppercase'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@Length', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @Length(0, 5)
          name: string;
        }

        test('it does not show errors if value between given length parameters', () => {
          expect(
            parseWithClassValidator(
              createFormData([['name', 'test']]),

              {
                schema: TestModel,
              }
            )
          ).toEqual({
            status: 'success',
            payload: {
              name: 'test',
            },
            value: {
              name: 'test',
            },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value is not between given length parameters', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'aaaaaa']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: 'aaaaaa' },
            error: {
              name: ['name must be shorter than or equal to 5 characters'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@MinLength', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @MinLength(3)
          name: string;
        }

        test('it does not show errors if value length is greater than min length', () => {
          expect(
            parseWithClassValidator(
              createFormData([['name', 'test']]),

              {
                schema: TestModel,
              }
            )
          ).toEqual({
            status: 'success',
            payload: {
              name: 'test',
            },
            value: {
              name: 'test',
            },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value length is not greater than min length', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'a']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: 'a' },
            error: {
              name: ['name must be longer than or equal to 3 characters'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@MaxLength', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @MaxLength(5)
          name: string;
        }

        test('it does not show errors if value length is smaller than max length', () => {
          expect(
            parseWithClassValidator(
              createFormData([['name', 'test']]),

              {
                schema: TestModel,
              }
            )
          ).toEqual({
            status: 'success',
            payload: {
              name: 'test',
            },
            value: {
              name: 'test',
            },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value length is not smaller than max length', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'aaaaaa']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: 'aaaaaa' },
            error: {
              name: ['name must be shorter than or equal to 5 characters'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@Matches', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @Matches(/\d+/g)
          name: string;
        }

        test('it does not show errors if value matches the regex', () => {
          expect(
            parseWithClassValidator(
              createFormData([['name', '1111']]),

              {
                schema: TestModel,
              }
            )
          ).toEqual({
            status: 'success',
            payload: {
              name: '1111',
            },
            value: {
              name: '1111',
            },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value does not match the regex', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'aaaaaa']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: 'aaaaaa' },
            error: {
              name: ['name must match /\\d+/g regular expression'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsMilitaryTime', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsMilitaryTime()
          name: string;
        }

        test('it does not show errors if value is military time', () => {
          expect(
            parseWithClassValidator(
              createFormData([['name', '21:37']]),

              {
                schema: TestModel,
              }
            )
          ).toEqual({
            status: 'success',
            payload: {
              name: '21:37',
            },
            value: {
              name: '21:37',
            },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value is not military time', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'aaaaaa']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: 'aaaaaa' },
            error: {
              name: ['name must be a valid representation of military time in the format HH:MM'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsTimeZone', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsTimeZone()
          name: string;
        }

        test('it does not show errors if value is a valid time zone', () => {
          expect(
            parseWithClassValidator(
              createFormData([['name', 'Poland']]),

              {
                schema: TestModel,
              }
            )
          ).toEqual({
            status: 'success',
            payload: {
              name: 'Poland',
            },
            value: {
              name: 'Poland',
            },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value is not a valid time zone', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'aaaaaa']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: 'aaaaaa' },
            error: {
              name: ['name must be a valid IANA time-zone'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsHash', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsHash('sha256')
          name: string;
        }

        test('it does not show errors if value is a valid hash', () => {
          expect(
            parseWithClassValidator(
              createFormData([
                ['name', 'b8d7090218b8e0a3d6377119a37aacb20f942c1e0f7f7c87c4fd3928fb00435f'],
              ]),

              {
                schema: TestModel,
              }
            )
          ).toEqual({
            status: 'success',
            payload: {
              name: 'b8d7090218b8e0a3d6377119a37aacb20f942c1e0f7f7c87c4fd3928fb00435f',
            },
            value: {
              name: 'b8d7090218b8e0a3d6377119a37aacb20f942c1e0f7f7c87c4fd3928fb00435f',
            },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value is not a valid hash', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'aaaaaa']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: 'aaaaaa' },
            error: {
              name: ['name must be a hash of type sha256'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsMimeType', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsMimeType()
          name: string;
        }

        test('it does not show errors if value is a MIME TYPE', () => {
          expect(
            parseWithClassValidator(
              createFormData([['name', 'application/json']]),

              {
                schema: TestModel,
              }
            )
          ).toEqual({
            status: 'success',
            payload: {
              name: 'application/json',
            },
            value: {
              name: 'application/json',
            },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value is not a valid MIME TYPE', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'aaaaaa']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: 'aaaaaa' },
            error: {
              name: ['name must be MIME type format'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsSemVer', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsSemVer()
          name: string;
        }

        test('it does not show errors if value is a Sem Ver', () => {
          expect(
            parseWithClassValidator(
              createFormData([['name', '1.10.1']]),

              {
                schema: TestModel,
              }
            )
          ).toEqual({
            status: 'success',
            payload: {
              name: '1.10.1',
            },
            value: {
              name: '1.10.1',
            },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value is not a valid Sem Ver', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'aaaaaa']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: 'aaaaaa' },
            error: {
              name: ['name must be a Semantic Versioning Specification'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsISSN', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsISSN()
          name: string;
        }

        test('it does not show errors if value is a valid ISSN', () => {
          expect(
            parseWithClassValidator(
              createFormData([['name', '20493630']]),

              {
                schema: TestModel,
              }
            )
          ).toEqual({
            status: 'success',
            payload: {
              name: '20493630',
            },
            value: {
              name: '20493630',
            },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value is not a valid ISSN', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'aaaaaa']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: 'aaaaaa' },
            error: {
              name: ['name must be a ISSN'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsISRC', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsISRC()
          name: string;
        }

        test('it does not show errors if value is a valid ISRC', () => {
          expect(
            parseWithClassValidator(
              createFormData([['name', 'AA6Q72000047']]),

              {
                schema: TestModel,
              }
            )
          ).toEqual({
            status: 'success',
            payload: {
              name: 'AA6Q72000047',
            },
            value: {
              name: 'AA6Q72000047',
            },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value is not a valid ISRC', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'aaaaaa']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: 'aaaaaa' },
            error: {
              name: ['name must be an ISRC'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsRFC3339', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsRFC3339()
          name: string;
        }

        test('it does not show errors if value is a valid RFC3339', () => {
          expect(
            parseWithClassValidator(
              createFormData([['name', '1985-04-12T23:20:50.52Z']]),

              {
                schema: TestModel,
              }
            )
          ).toEqual({
            status: 'success',
            payload: {
              name: '1985-04-12T23:20:50.52Z',
            },
            value: {
              name: '1985-04-12T23:20:50.52Z',
            },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value is not a valid RFC3339', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'aaaaaa']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: 'aaaaaa' },
            error: {
              name: ['name must be RFC 3339 date'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@IsStrongPassword', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name;
          }

          @IsStrongPassword()
          name: string;
        }

        test('it does not show errors if value is a strong password', () => {
          expect(
            parseWithClassValidator(
              createFormData([['name', 'm8$R3@tSPyArV$nu']]),

              {
                schema: TestModel,
              }
            )
          ).toEqual({
            status: 'success',
            payload: {
              name: 'm8$R3@tSPyArV$nu',
            },
            value: {
              name: 'm8$R3@tSPyArV$nu',
            },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value is not a strong password', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'aaaaaa']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: 'aaaaaa' },
            error: {
              name: ['name is not strong enough'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@ArrayContains', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.tags = data.name.split(',');
          }

          @ArrayContains(['found'])
          tags: string[];
        }

        test('it does not show errors if value array contains the given value', () => {
          expect(
            parseWithClassValidator(
              createFormData([['name', 'test,test2,found']]),

              {
                schema: TestModel,
              }
            )
          ).toEqual({
            status: 'success',
            payload: {
              name: 'test,test2,found',
            },
            value: {
              tags: ['test', 'test2', 'found'],
            },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value array does not contain the given value', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'aaaaaa']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: 'aaaaaa' },
            error: {
              tags: ['tags must contain found values'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@ArrayNotContains', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.tags = data.name.split(',');
          }

          @ArrayNotContains(['found'])
          tags: string[];
        }

        test('it does not show errors if value array does not contain the given value', () => {
          expect(
            parseWithClassValidator(
              createFormData([['name', 'test,test2']]),

              {
                schema: TestModel,
              }
            )
          ).toEqual({
            status: 'success',
            payload: {
              name: 'test,test2',
            },
            value: {
              tags: ['test', 'test2'],
            },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value array contains the given value', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'aaaaaa,found']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: 'aaaaaa,found' },
            error: {
              tags: ['tags should not contain found values'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@ArrayNotEmpty', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.tags = data.name ? data.name.split(',') : [];
          }

          @ArrayNotEmpty()
          tags: string[];
        }

        test('it does not show errors if value array is not empty', () => {
          expect(
            parseWithClassValidator(
              createFormData([['name', 'test,test2']]),

              {
                schema: TestModel,
              }
            )
          ).toEqual({
            status: 'success',
            payload: {
              name: 'test,test2',
            },
            value: {
              tags: ['test', 'test2'],
            },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value array is empty', () => {
          expect(
            parseWithClassValidator(createFormData([]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: {},
            error: {
              tags: ['tags should not be empty'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@ArrayMinSize', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.tags = data.name ? data.name.split(',') : [];
          }

          @ArrayMinSize(2)
          tags: string[];
        }

        test('it does not show errors if value array is the given size or larger', () => {
          expect(
            parseWithClassValidator(
              createFormData([['name', 'test,test2']]),

              {
                schema: TestModel,
              }
            )
          ).toEqual({
            status: 'success',
            payload: {
              name: 'test,test2',
            },
            value: {
              tags: ['test', 'test2'],
            },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value array is not the given size or larger', () => {
          expect(
            parseWithClassValidator(createFormData([]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: {},
            error: {
              tags: ['tags must contain at least 2 elements'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@ArrayMaxnSize', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.tags = data.name ? data.name.split(',') : [];
          }

          @ArrayMaxSize(2)
          tags: string[];
        }

        test('it does not show errors if value array is the given size or smaller', () => {
          expect(
            parseWithClassValidator(
              createFormData([['name', 'test,test2']]),

              {
                schema: TestModel,
              }
            )
          ).toEqual({
            status: 'success',
            payload: {
              name: 'test,test2',
            },
            value: {
              tags: ['test', 'test2'],
            },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value array is not the given size or smaller', () => {
          expect(
            parseWithClassValidator(createFormData([['name', 'test,test2,test3,test4,test6']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: 'test,test2,test3,test4,test6' },
            error: {
              tags: ['tags must contain no more than 2 elements'],
            },
            reply: expect.any(Function),
          });
        });
      });
      describe('@ArrayUnique', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.tags = data.name ? data.name.split(',') : [];
          }

          @ArrayUnique()
          tags: string[];
        }

        test('it does not show errors if value array has unique values', () => {
          expect(
            parseWithClassValidator(
              createFormData([['name', 'test,test2,test3']]),

              {
                schema: TestModel,
              }
            )
          ).toEqual({
            status: 'success',
            payload: {
              name: 'test,test2,test3',
            },
            value: {
              tags: ['test', 'test2', 'test3'],
            },
            reply: expect.any(Function),
          });
        });

        test('it shows errors if value array has a duplicate element', () => {
          expect(
            parseWithClassValidator(
              createFormData([['name', 'test,test,test3,test4,test5']]),

              {
                schema: TestModel,
              }
            )
          ).toEqual({
            status: 'error',
            payload: { name: 'test,test,test3,test4,test5' },
            error: {
              tags: ["All tags's elements must be unique"],
            },
            reply: expect.any(Function),
          });
        });
      });
    });
  });
});
