'use server';

import {LoginModel, TodoModel} from "@/app/Models";
import {parseWithClassValidator} from "@saashub/conform-class-validator";
import { redirect } from 'next/navigation';


export async function login(prevState: unknown, formData: FormData) {
	const submission = parseWithClassValidator(formData, {
		schema: LoginModel,
	});

	if (submission.status !== 'success') {
		return submission.reply();
	}

	redirect(`/?value=${JSON.stringify(submission.value)}`);
}

export async function createTodos(prevState: unknown, formData: FormData) {
	const submission = parseWithClassValidator(formData, {
		schema: TodoModel,
	});

	if (submission.status !== 'success') {
		return submission.reply();
	}

	redirect(`/?value=${JSON.stringify(submission.value)}`);
}
