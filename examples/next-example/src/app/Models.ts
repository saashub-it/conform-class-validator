import {
    IsDefined,
    IsEmail,
    IsBoolean,
    IsString,
    IsArray,
    IsNotEmpty,
    MinLength,
    IsOptional
} from "class-validator";

export class LoginModel {
    constructor(login: LoginModel) {

        this.email = login.email;
        this.password = login.password;
        this.rememberMe = login.rememberMe;
    }

    @IsEmail()
    email: string;

    @IsDefined()
    @MinLength(5)
    password: string;

    @IsOptional()
    rememberMe: string;
}


export class TaskModel {
    constructor(task: TaskModel) {
        this.content = task.content;
        this.completed = task.completed;
    }

    @IsDefined()
    @IsString()
    content:string;

    @IsOptional()
    completed: string;
}

export class TodoModel {
    constructor(todo: TodoModel) {
        this.title = todo.title;
        this.tasks = todo.tasks;
    }

    @IsDefined()
    @IsString()
    title:string;

    @IsDefined()
    @IsArray()
    tasks: TaskModel[];
}
