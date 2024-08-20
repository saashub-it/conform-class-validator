# @saashub/conform-class-validator

## Rationale

Add on to [Conform](https://github.com/edmundhung/conform) that adds
supports [class-validator](https://github.com/typestack/class-validator) models. Created on top
of [discussion](https://github.com/edmundhung/conform/pull/736).

Enjoy.

## Install

    npm install @saashub/conform-class-validator

## Usage

### Defining validation classes

Define your validation class like in the classical [class-validator](https://github.com/typestack/class-validator)
model.

```ts
export class ExampleModel {
  constructor(init: ExampleModel) {
    this.foo = init.foo;
    this.bar = init.bar;
  }

  @Length(1, 5)
  foo: string;

  @IsNotEmpty()
  bar: string;
}
```

The only thing you need to make sure of is that the `constructor` accepts your model object and not a list of
properties:

#### ✅ Do:

```ts
constructor(init:ExampleModel)
{
  this.foo = init.foo;
  this.bar = init.bar;
}
```

#### ❌ Don't:

```ts
constructor(foo:string, bar:string) {
  this.foo = foo;
  this.bar = bar;
}
```

### Implementing Form validation

You can use it just like the [Zod](https://conform.guide/api/zod/parseWithZod)
and [Yup](https://conform.guide/api/yup/parseWithYup) Conform validators:

```ts
import { parseWithClassValidator } from "@saashub/conform-class-validator";

import { useForm } from "@conform-to/react";

function Example() {
  const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithClassValidator(formData, { schema: ExampleModel });
    },
  });

  // ...
}
```

#### Parameters

| Property  | Required | Definition                                                                                                                        |
| --------- | -------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `payload` | true     | It could be either the FormData or URLSearchParams object depending on how the form is submitted.                                 |
| `schema`  | true     | `class-validator` model                                                                                                           |
| `async`   | false    | Set it to true if you want to parse the form data with validate method from the `class-validator` schema instead of validateSync. |
