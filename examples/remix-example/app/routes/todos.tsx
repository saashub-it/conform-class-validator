import {
    useForm,
    getFormProps,
    getInputProps,
    getFieldsetProps,
} from '@conform-to/react';

import type {ActionFunctionArgs} from '@remix-run/node';
import {json, redirect} from '@remix-run/node';
import {Form, useActionData} from '@remix-run/react';
import {parseWithClassValidator} from "@saashub/conform-class-validator";
import {IsDefined, IsOptional, IsBoolean, IsNotEmpty, IsArray} from "class-validator";

class TaskModel {
    constructor(task: TaskModel) {
        this.content = task.content;
        this.completed = task.completed;
    }

    @IsDefined()
    content: string;

    @IsOptional()
    @IsBoolean()
    completed: string;
}

class TodoModel {
    constructor(todo: TodoModel) {
        this.title = todo.title;
        this.tasks = todo.tasks;
    }

    @IsDefined()
    title: string

    @IsArray()
    @IsNotEmpty()
    tasks: Array<TaskModel>;
}


export async function action({request}: ActionFunctionArgs) {
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
        onValidate({formData}) {
            return parseWithClassValidator(formData, {schema: TodoModel});
        },
        shouldValidate: 'onBlur',
    });
    const tasks = fields.tasks.getFieldList();

    return (
        <Form method="post" {...getFormProps(form)}>
            <div>
                <label htmlFor={getInputProps(fields.tasks, {type: 'text'}).name}>Title</label>
                <input
                    className={!fields.title.valid ? 'error' : ''}
                    {...getInputProps(fields.title, {type: 'text'})}
                />
                <div>{fields.title.errors}</div>
            </div>
            <hr/>
            <div className="form-error">{fields.tasks.errors}</div>
            {tasks.map((task, index) => {
                const taskFields = task.getFieldset();

                return (
                    <fieldset key={getFieldsetProps(task).id} {...getFieldsetProps(task)}>
                        <div>
                            <label>Task #{index + 1}</label>
                            <input
                                className={!taskFields.content.valid ? 'error' : ''}
                                name={getInputProps(taskFields.content, {type: 'text'}).name}
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
                                value: {content: ''},
                            })}
                        >
                            Clear
                        </button>
                    </fieldset>
                );
            })}
            <button {...form.insert.getButtonProps({name: fields.tasks.name})}>
                Add task
            </button>
            <hr/>
            <button>Save</button>
        </Form>
    );
}
