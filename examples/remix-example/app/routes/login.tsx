import { getFormProps, getInputProps, useForm } from '@conform-to/react';
import {ActionFunctionArgs, json, redirect } from '@remix-run/node';
import { Form, useActionData } from '@remix-run/react';
import {parseWithClassValidator} from "@saashub/conform-class-validator";
import {IsDefined, IsEmail, IsOptional} from "class-validator";


class LoginModel {
	constructor(login: LoginModel) {
		this.email = login.email;
		this.password = login.password;
		this.rememberMe = login.rememberMe;
	}

	@IsEmail()
	email: string;

	@IsDefined()
	password: string;

	@IsOptional()
	rememberMe: boolean;
}

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData();
	const submission = parseWithClassValidator(formData, { schema: LoginModel });

	if (submission.status !== 'success') {
		return json(submission.reply());
	}

	return redirect(`/?value=${JSON.stringify(submission.value)}`);
}

export default function Login() {
	// Last submission returned by the server
	const lastResult = useActionData<typeof action>();
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
		<Form method="post" {...getFormProps(form)}>
			<div>
				<label htmlFor={getInputProps(fields.email, { type: 'email' }).name}>Email</label>
				<input

					className={!fields.email.valid ? 'error' : ''}
					{...getInputProps(fields.email, { type: 'email' })}
				/>
				<div>{fields.email.errors}</div>
			</div>
			<div>
				<label htmlFor={getInputProps(fields.password, {type: 'password'}).name}>Password</label>
				<input
					className={!fields.password.valid ? 'error' : ''}
					{...getInputProps(fields.password, { type: 'password' })}
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
			<button>Login</button>
		</Form>
	);
}
