import { beforeEach, describe, expect, test, vi } from 'vitest'
import { parseWithClassValidator } from './index'
import {
  Equals,
  IsDefined,
  isEmpty,
  IsEmpty,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNotIn,
  Max,
  Min,
  MinLength,
  NotEquals,
} from 'class-validator'

const createFormData = (
  entries: Array<[string, FormDataEntryValue]>
): FormData => {
  const formData = new FormData()

  for (const [name, value] of entries) {
    formData.append(name, value)
  }

  return formData
}

beforeEach(() => {
  vi.unstubAllGlobals()
})

const enum TestEnum {
  VALUE = 'VALUE',
  NO_VALUE = 'NO_VALUE',
}

interface IBasicPayload {
  name: string
  qty: string
}

interface ITypePayload {
  name: string
  qty: number
  date: Date
  fraction: number
  tags: Array<string>
  bool: Boolean
  enum: TestEnum
}

describe('conform-class-validator', () => {
  describe('parseWithClassValidator', () => {
    describe('Basic functionality', () => {
      class TestModel {
        constructor(data: IBasicPayload) {
          this.name = data.name
          this.qty = Number(data.qty)
        }

        @IsNotEmpty({ message: 'IsNotEmpty' })
        @MinLength(3, { message: 'MinLength' })
        name: string

        @Min(1, { message: 'Min' })
        qty: number
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
        })
      })

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
        })
      })

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
        })
      })

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
        })
      })
    })
    describe('Data type checks', () => {
      describe('@IsDefined', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name
          }

          @IsDefined()
          name: string
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
          })
        })

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
          })
        })

        test('it shows errors if value is undefined', () => {
          expect(
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
          })
        })
      })
      describe('@Equals', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name
          }

          @Equals('test')
          name: string
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
          })
        })
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
          })
        })
        test('it shows an error on a undefined field', () => {
          expect(
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
          })
        })
      })
      describe('@NotEquals', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name
          }

          @NotEquals('test')
          name: string
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
          })
        })
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
          })
        })
        test('it does not show an error on a undefined field', () => {
          expect(
            parseWithClassValidator(createFormData([[]]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'success',
            payload: { undefined: 'undefined' },
            value: { name: undefined },
            reply: expect.any(Function),
          })
        })
      })
      describe('@IsEmpty', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name
          }

          @IsEmpty()
          name: string
        }

        test('it does not show errors if value is empty', () => {
          expect(
            parseWithClassValidator(createFormData([[]]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'success',
            payload: { undefined: 'undefined' },
            value: { name: undefined },
            reply: expect.any(Function),
          })
        })

        test('it shows errors on any value', () => {
          expect(isEmpty(null)).toEqual(true)

          expect(
            parseWithClassValidator(createFormData([['name', 'value']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: 'value' },
            error: { name: ['name must be empty'] },
            reply: expect.any(Function),
          })
        })
      })
      describe('@IsNotEmpty', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name
          }

          @IsNotEmpty()
          name: string
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
          })
        })

        test('it shows errors on empty value', () => {
          expect(isEmpty(null)).toEqual(true)

          expect(
            parseWithClassValidator(createFormData([['name', '']]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { name: '' },
            error: { name: ['name should not be empty'] },
            reply: expect.any(Function),
          })
        })

        test('it shows errors on no value', () => {
          expect(isEmpty(null)).toEqual(true)

          expect(
            parseWithClassValidator(createFormData([[]]), {
              schema: TestModel,
            })
          ).toEqual({
            status: 'error',
            payload: { undefined: 'undefined' },
            error: { name: ['name should not be empty'] },
            reply: expect.any(Function),
          })
        })
      })
      describe('@IsIn', () => {
        const valueArray = ['test', 'value']

        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name
          }

          @IsIn(valueArray)
          name: string
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
          })
        })

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
          })
        })
      })
      describe('@IsNotIn', () => {
        const valueArray = ['test', 'value']

        class TestModel {
          constructor(data: ITypePayload) {
            this.name = data.name
          }

          @IsNotIn(valueArray)
          name: string
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
              name: [
                'name should not be one of the following values: test, value',
              ],
            },
            reply: expect.any(Function),
          })
        })

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
          })
        })
      })
      describe('@IsEnum', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.enum = data.enum
          }

          @IsEnum(TestEnum)
          enum: TestEnum
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
              enum: [
                'enum must be one of the following values: VALUE, NO_VALUE',
              ],
            },
            reply: expect.any(Function),
          })
        })

        test('it does not show an error if the value fulfills the enum', () => {
          expect(
            parseWithClassValidator(
              createFormData([['enum', TestEnum.VALUE]]),
              { schema: TestModel }
            )
          ).toEqual({
            status: 'success',
            payload: { enum: TestEnum.VALUE },
            value: { enum: TestEnum.VALUE },
            reply: expect.any(Function),
          })
        })
      })
      describe('@Min', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.qty = Number(data.qty)
          }

          @Min(4)
          qty: number
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
          })
        })

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
          })
        })
      })
      describe('@Max', () => {
        class TestModel {
          constructor(data: ITypePayload) {
            this.qty = Number(data.qty)
          }

          @Max(4)
          qty: number
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
          })
        })

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
          })
        })
      })
    })
  })
})
