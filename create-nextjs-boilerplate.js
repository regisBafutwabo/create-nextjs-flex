// create-nextjs-boilerplate.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.toLowerCase().trim());
    });
  });
}

async function setup() {
  console.log('Welcome to the Next.js Boilerplate Setup!');

  const projectName = await askQuestion('Enter your project name: ');
  const setupType = await askQuestion('Do you want a basic setup or an example project? (basic/example): ');
  
  let useReactQuery = 'n', useApollo = 'n', useZustand = 'n', aiChoice = 'none';
  
  if (setupType === 'example') {
    useReactQuery = await askQuestion('Do you want to use React Query? (y/n): ');
    useApollo = useReactQuery === 'n' ? await askQuestion('Do you want to use Apollo Client? (y/n): ') : 'n';
    useZustand = useApollo === 'n' ? await askQuestion('Do you want to use Zustand for state management? (y/n): ') : 'n';
    aiChoice = await askQuestion('Which AI API do you want to use? (openai/claude/v0/none): ');
  }

  console.log('\nSetting up your project...');

  // Create project directory
  fs.mkdirSync(projectName);
  process.chdir(projectName);

  // Create Next.js project
  execSync('npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm', { stdio: 'inherit' });

  // Ensure necessary directories exist
  ['src/lib', 'src/utils', 'src/store', 'src/components'].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  if (setupType === 'example') {
    // Install additional dependencies
    const dependencies = [];
    if (useReactQuery === 'y') {
      dependencies.push('@tanstack/react-query', '@tanstack/react-query-devtools');
    }
    if (useApollo === 'y') {
      dependencies.push('@apollo/client', 'graphql');
    }
    if (useZustand === 'y') {
      dependencies.push('zustand');
    }
    switch(aiChoice) {
      case 'openai':
        dependencies.push('openai');
        break;
      case 'claude':
        dependencies.push('@anthropic-ai/sdk');
        break;
      case 'v0':
        dependencies.push('ai');
        break;
    }

    if (dependencies.length > 0) {
      execSync(`npm install ${dependencies.join(' ')}`, { stdio: 'inherit' });
    }

    // Create necessary files based on selections
    if (useReactQuery === 'y') {
      createReactQueryProvider();
      createReactQueryExample();
    }
    if (useApollo === 'y') {
      createApolloClientFile();
      createApolloExample();
    }
    if (useZustand === 'y') {
      createZustandStore();
      createZustandExample();
    }
    if (aiChoice !== 'none') {
      createAIService(aiChoice);
      createAIExample(aiChoice);
    }
  }

  console.log('\nSetup complete! You can now start your development server with:');
  console.log(`cd ${projectName} && npm run dev`);

  rl.close();
}

function createReactQueryProvider() {
  const content = `
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
  `.trim();

  fs.writeFileSync(path.join('src', 'app', 'providers.tsx'), content);
}

function createReactQueryExample() {
  const content = `
import { useQuery } from '@tanstack/react-query';

async function fetchTodos() {
  const res = await fetch('https://jsonplaceholder.typicode.com/todos');
  return res.json();
}

export default function Todos() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>An error occurred: {error.message}</div>;

  return (
    <ul>
      {data.slice(0, 5).map((todo: { id: number; title: string }) => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  );
}
  `.trim();

  fs.writeFileSync(path.join('src', 'components', 'Todos.tsx'), content);
}

function createApolloClientFile() {
  const content = `
import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  uri: 'https://api.spacex.land/graphql/',
  cache: new InMemoryCache(),
});

export default client;
  `.trim();

  fs.writeFileSync(path.join('src', 'lib', 'apollo-client.ts'), content);
}

function createApolloExample() {
  const content = `
import { gql, useQuery } from '@apollo/client';

const GET_LAUNCHES = gql\`
  query GetLaunches {
    launchesPast(limit: 5) {
      mission_name
      launch_date_local
      launch_site {
        site_name_long
      }
    }
  }
\`;

export default function Launches() {
  const { loading, error, data } = useQuery(GET_LAUNCHES);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return data.launchesPast.map(({ mission_name, launch_date_local, launch_site }: any) => (
    <div key={mission_name}>
      <p>{mission_name}</p>
      <p>{launch_date_local}</p>
      <p>{launch_site.site_name_long}</p>
    </div>
  ));
}
  `.trim();

  fs.writeFileSync(path.join('src', 'components', 'Launches.tsx'), content);
}

function createZustandStore() {
  const content = `
import { create } from 'zustand';

interface AppState {
  count: number;
  increment: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));
  `.trim();

  fs.writeFileSync(path.join('src', 'store', 'appStore.ts'), content);
}

function createZustandExample() {
  const content = `
import { useAppStore } from '../store/appStore';

export default function Counter() {
  const { count, increment } = useAppStore();

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>Increment</button>
    </div>
  );
}
  `.trim();

  fs.writeFileSync(path.join('src', 'components', 'Counter.tsx'), content);
}

async function createAIService(aiChoice) {
    const useClass = await askQuestion('Do you want to use a class-based service? (y/n): ') === 'y';

  let content = '';
  if (useClass) {
    switch(aiChoice) {
      case 'openai':
        content = `
import OpenAI from 'openai';

export class AIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateText(prompt: string): Promise<string> {
    const chatCompletion = await this.openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    return chatCompletion.choices[0].message.content || '';
  }
}
        `.trim();
        break;
      case 'claude':
        content = `
import Anthropic from '@anthropic-ai/sdk';

export class AIService {
  private anthropic: Anthropic;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async generateText(prompt: string): Promise<string> {
    const completion = await this.anthropic.completions.create({
      model: 'claude-2',
      prompt: prompt,
      max_tokens_to_sample: 300,
    });

    return completion.completion;
  }
}
        `.trim();
        break;
      case 'v0':
        content = `
import { Configuration, OpenAIApi } from 'openai-edge';
import { OpenAIStream, StreamingTextResponse } from 'ai';

export class AIService {
  private openai: OpenAIApi;

  constructor() {
    const config = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.openai = new OpenAIApi(config);
  }

  async generateText(prompt: string): Promise<StreamingTextResponse> {
    const response = await this.openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      stream: true,
      messages: [{ role: 'user', content: prompt }],
    });

    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  }
}
        `.trim();
        break;
    }
  } else {
  switch(aiChoice) {
    case 'openai':
      content = `
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateText(prompt: string): Promise<string> {
  const chatCompletion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
  });

  return chatCompletion.choices[0].message.content || '';
}
      `.trim();
      break;
    case 'claude':
      content = `
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generateText(prompt: string): Promise<string> {
  const completion = await anthropic.completions.create({
    model: 'claude-2',
    prompt: prompt,
    max_tokens_to_sample: 300,
  });

  return completion.completion;
}
      `.trim();
      break;
    case 'v0':
      content = `
import { Configuration, OpenAIApi } from 'openai-edge';
import { OpenAIStream, StreamingTextResponse } from 'ai';

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

export async function generateText(prompt: string): Promise<StreamingTextResponse> {
  const response = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    stream: true,
    messages: [{ role: 'user', content: prompt }],
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}
      `.trim();
      break;
  }
}

  fs.writeFileSync(path.join('src', 'utils', 'ai.ts'), content);
}

function createAIExample(aiChoice) {
  const content = `
import { useState } from 'react';
import { generateText } from '../utils/ai';

export default function AIExample() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await generateText(prompt);
    setResponse(result);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your prompt"
        />
        <button type="submit">Generate</button>
      </form>
      <div>{response}</div>
    </div>
  );
}
  `.trim();

  fs.writeFileSync(path.join('src', 'components', 'AIExample.tsx'), content);
}

setup().catch(console.error);