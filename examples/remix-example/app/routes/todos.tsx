import { useForm, getFormProps, getInputProps, getFieldsetProps } from '@conform-to/react';

import type { ActionFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useActionData } from '@remix-run/react';
import { parseWithClassValidator } from '../../../../src/index';
import { IsDefined, IsOptional, IsBoolean, ValidateNested, IsIn } from 'class-validator';

class TaskModel {
  constructor(task: TaskModel) {
    this.content = task.content;
    this.completed = task.completed || 'off';
  }

  @IsDefined()
  @IsOptional()
  content: string;

  @IsOptional()
  @IsIn(['on', 'off'])
  completed: string;
}

class TodoModel {
  constructor(todo: TodoModel) {
    const filteredTasks = todo?.tasks?.filter(Boolean);
    console.log('filteredTasks', filteredTasks);
    this.title = todo.title;
    this.tasks = filteredTasks?.length > 0 ? filteredTasks.map((task) => new TaskModel(task)) : [];
  }

  @IsDefined()
  title: string;

  @ValidateNested({ each: true })
  tasks: TaskModel[];
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const submission = parseWithClassValidator(formData, {
    schema: TodoModel,
  });
  if (submission.status !== 'success') {
    return json(submission.reply());
  }
  return redirect(`/?value=${JSON.stringify(submission.value)}`);
}

export default function Example() {
  const lastResult = useActionData<typeof action>();
  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithClassValidator(formData, { schema: TodoModel });
    },
    shouldValidate: 'onBlur',
  });
  const tasks = fields.tasks.getFieldList();
  console.log(tasks);
  return (
    <Form method="post" {...getFormProps(form)}>
      <div>
        <label htmlFor={getInputProps(fields.tasks, { type: 'text' }).name}>Title</label>
        <input
          className={!fields.title.valid ? 'error' : ''}
          {...getInputProps(fields.title, { type: 'text' })}
        />
        <div>{fields.title.errors}</div>
      </div>
      <hr />
      <div className="form-error">{fields.tasks.errors}</div>
      {tasks.map((task, index) => {
        const taskFields = task.getFieldset();
        console.log(getInputProps(taskFields.content, { type: 'text' }));

        return (
          <fieldset key={getFieldsetProps(task).id} name={getFieldsetProps(task).name}>
            <div>
              <label>Task #{index + 1}</label>
              <input
                className={!taskFields.content.valid ? 'error' : ''}
                name={getInputProps(taskFields.content, { type: 'text' }).name}
              />
              <div>{taskFields.content.errors}</div>
            </div>
            <div>
              <label>
                <span>Completed</span>
                <input
                  className={!taskFields.completed.valid ? 'error' : ''}
                  {...getInputProps(taskFields.completed, {
                    type: 'checkbox',
                  })}
                />
              </label>
            </div>
            <button
              {...form.remove.getButtonProps({
                name: fields.tasks.name,
                index,
              })}
            >
              Delete
            </button>
            <button
              {...form.reorder.getButtonProps({
                name: fields.tasks.name,
                from: index,
                to: 0,
              })}
            >
              Move to top
            </button>
            <button
              {...form.update.getButtonProps({
                name: task.name,
                value: { content: '' },
              })}
            >
              Clear
            </button>
          </fieldset>
        );
      })}
      <button {...form.insert.getButtonProps({ name: fields.tasks.name })}>Add task</button>
      <hr />
      <button>Save</button>
    </Form>
  );
}
