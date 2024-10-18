'use client';

import {LoginModel, TodoModel} from "@/app/Models";
import {parseWithClassValidator} from "@saashub/conform-class-validator";
import { useFormState } from 'react-dom';
import { login, createTodos } from '@/app/actions';
import {
	useForm,
	getFormProps,
	getInputProps,
	getFieldsetProps,
} from '@conform-to/react';


export function TodoForm() {
	const [lastResult, action] = useFormState(createTodos, undefined);
	const [form, fields] = useForm({
		lastResult,
		onValidate({ formData }) {
			return parseWithClassValidator(formData, { schema: TodoModel });
		},
		shouldValidate: 'onBlur',
	});
	const tasks = fields.tasks.getFieldList();;
	return (
		<form action={action} {...getFormProps(form)}>
			<div>
				<label>Title</label>
				<input
					className={!fields.title.valid ? 'error' : ''}
					{...getInputProps(fields.title, { type: 'text' })}
					key={fields.title.key}
				/>
				<div>{fields.title.errors}</div>
			</div>
			<hr />
			<div className="form-error">{fields.tasks.errors}</div>
			{tasks.map((task, index) => {
				const taskFields = task.getFieldset();

				return (
					<fieldset key={task.key} {...getFieldsetProps(task)}>
						<div>
							<label>Task #{index + 1}</label>
							<input
								className={!taskFields.content.valid ? 'error' : ''}
								{...getInputProps(taskFields.content, { type: 'text' })}
								key={taskFields.content.key}
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
									key={taskFields.completed.key}
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
			<button {...form.insert.getButtonProps({ name: fields.tasks.name })}>
				Add task
			</button>
			<hr />
			<button>Save</button>
		</form>
	);
}

export function LoginForm() {
	const [lastResult, action] = useFormState(login, undefined);
	const [form, fields] = useForm({
		// Sync the result of last submission
		lastResult,

		// Reuse the validation logic on the client
		onValidate({ formData }) {
			return parseWithClassValidator(formData, { schema: LoginModel });
		},

		// Validate the form on blur event triggered
		shouldValidate: 'onBlur',
	});

	return (
		<form  {...getFormProps(form)} action={action}>
			<div>
				<label>Email</label>
				<input
					className={!fields.email.valid ? 'error' : ''}
					{...getInputProps(fields.email, { type: 'text' })}
					key={fields.email.key}
				/>
				<div>{fields.email.errors}</div>
			</div>
			<div>
				<label>Password</label>
				<input
					className={!fields.password.valid ? 'error' : ''}
					{...getInputProps(fields.password, { type: 'password' })}
					key={fields.password.key}
				/>
				<div>{fields.password.errors}</div>
			</div>
			<label>
				<div>
					<span>Remember me</span>
					<input {...getInputProps(fields.rememberMe, { type: 'checkbox' })} />
				</div>
			</label>
			<hr />
			<button type="submit">Login</button>
		</form>
	);
}
