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

- `-y, --yes`: Skip prompts and use default options
- `-v, --version`: Output the current version

### Examples:

Create a basic Next.js project:
   ```bash
   create-nextjs-flex my-app
   ```

## Features

- Next.js 13+ with App Router
- TypeScript
- Tailwind CSS
- ESLint
- Optional integrations:
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

Additional files and directories will be created based on the options you choose.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.