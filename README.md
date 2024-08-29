# create-nextjs-flex

A flexible Next.js boilerplate creator with optional React Query, Apollo, Zustand, and AI integration.

## Installation

Install the package globally using npm:

```bash
npm install -g create-nextjs-flex
```

## Usage

To create a new project, run:

```bash
create-nextjs-flex <project-name> [options]
```

### Options:

- `-e, --example`: Create an example project with additional features

If you use the `-e` or `--example` flag, you'll be prompted to choose from the following options:

- React Query integration
- Apollo Client integration
- Zustand for state management
- AI integration (OpenAI, Claude, or Vercel's v0)

### Examples:

1. Create a basic Next.js project:
   ```bash
   create-nextjs-flex my-app
   ```

2. Create an example project with additional features:
   ```bash
   create-nextjs-flex my-advanced-app --example
   ```
   You'll then be prompted to choose which additional features you want to include.

## Features

- Next.js 13+ with App Router
- TypeScript
- Tailwind CSS
- ESLint
- Optional integrations (when using the `--example` flag):
  - React Query
  - Apollo Client
  - Zustand
  - AI services (OpenAI, Claude, or Vercel AI)
- Flexible service architecture (functional or class-based)

## Project Structure

The generated project will have the following structure:

```
my-project/
├── src/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── services/
│   └── utils/
├── public/
├── .gitignore
├── next.config.js
├── package.json
├── README.md
├── tailwind.config.js
└── tsconfig.json
```

Additional files and directories will be created based on the options you choose when using the `--example` flag.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.