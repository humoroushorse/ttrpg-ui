# Code Generation Rules

## General

- Always follow the latest best practices for the language and framework.
- Prefer explicit, readable code over clever or overly concise code.
- Use consistent naming conventions and formatting.
- Add comments only when necessary for clarity, not for obvious code.
- Prefer functional programming where it makes sense (e.g., pure functions, avoiding mutating state). Pure functions are especially valuable for testing and maintainability, but recognize that not all code can or should be purely functional.

---

## Angular

- **Current Version:** 20

### HTML QA

- make sure every interactable component has a data-qa
  - naming convention should always be something like attr.data-qa="{{dataQa}}BtnFoobar" where the ts component should have a dataQa string, Btn is the type of input, and foobar is what it does (e.g. cancel, submit). All user interactable elements should have this.
- if it is part of a loop, please also add a data-qa-idx for the index

### Syntax & Style

- Use the latest Angular syntax and features.
- Prefer declarative programming styles over imperative programming. Favor expressions, data flow, and configuration over step-by-step instructions.
- Prefer type-safe code and strict typing.
- Use Angular Material components for UI unless otherwise specified.
- Use Tailwind for most styling purposes.
- Avoid legacy APIs and patterns.

### Access Modifiers & Typing

- All functions must be explicitly marked as `public` or `private` and must specify a return type, even if `void`.
- Use `public`, `private`, and `readonly` access modifiers appropriately:
  - Mark all class properties and methods as `private` unless they are intended to be accessed from outside the class.
  - Use `public` explicitly for properties and methods that are part of the component or service's public API.
  - Use `readonly` for properties that should not be reassigned after initialization.
  - Do not rely on TypeScript's default `public`; always specify the intended access modifier for clarity.

### File & Member Organization

- Order TypeScript class members as follows:
  1. Dependencies (injected services, etc.)
  2. Outputs
  3. Inputs
  4. Other variables
  5. Constructor
  6. Lifecycle hooks (in the order they trigger, e.g., `ngOnInit`, `ngAfterViewInit`, etc.)
  7. Functions (methods)
- Group similar items together where possible (e.g., all outputs, all inputs).
- For inputs, group related getters, setters, and private variables together with the input.

# Component Design

- Keep components focused: one component = one responsibility.
- Prefer “dumb”/presentational components for UI and “smart”/container components for data and logic.
- Avoid putting business logic in templates; keep it in the component class or services.

## Change Detection

- Prefer ChangeDetectionStrategy.OnPush for all components unless you have a specific reason not to.
- Avoid mutating objects/arrays directly; always create new references to trigger change detection.

### Templates

- Always use `@if`, `@for`, `@switch` in HTML templates instead of `*ngIf`, `*ngFor`, etc.
- Use `input`, `output`, and `model` decorators instead of `@Input` and `@Output`.
- Use `viewChild` instead of `@ViewChild`

### State Management & Data Flow

- Prefer using signals for state management and data flow.
  - Use RxJS only when necessary (e.g., for debouncing, throttling, or complex streams).
  - For user input filtering, use an observable with a 300ms debounce.
- For subscriptions, prefer the `async` pipe.
- Keep any effects for signals together in the constructor if they are needed, but recommend patterns that avoid effects when possible.
- Side effects are allowed only for limited situations (e.g., syncing data with `localStorage`, logging output). Use `tap`, `effect`, etc., only for these side effects.

### Error Handeling

- Always handle errors in HTTP requests and asynchronous operations.
- Use Angular’s HttpErrorResponse and provide user-friendly error messages.
- Avoid using any for error types; prefer explicit error interfaces.

### Dependency Injection & Services

- Prefer using Angular’s dependency injection for all services and shared logic.
- Avoid using new to instantiate services or classes that could be injected.
- Use providedIn: 'root' for singleton services unless a different scope is required.

### Architecture & Testing

- Use standalone components and feature modules when possible.
- Write unit tests for all new components and services.

---

## Python

- **Current Version:** 3.13

### Syntax & Style

- Use the latest Python syntax and typing features.
- Prefer `str | None` over `Optional[str]`.
- Use type hints for all function signatures and variables.
- Follow PEP 8 for code style and formatting.
- Use dataclasses for simple data structures.
- Prefer pathlib over os.path for file operations.
- Use f-strings for string formatting.

### Documentation & Testing

- Write docstrings for all public functions and classes.
- Write unit tests for all new modules and functions.

---
