#!/usr/bin/env node
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

async function setup(name, options = {}) {
  console.log('Welcome to the Nextjs-flex Boilerplate Setup!');

  const projectName = name || await askQuestion('Enter your project name: ');
  
  const config = await getConfiguration(options);
  
  console.log('\nSetting up your project...');

  createProjectStructure(projectName, config);
  installDependencies(config);
  createNecessaryFiles(config);

  console.log('\nSetup complete! You can now start your development server with:');
  console.log(`cd ${projectName} && yarn dev`);

  rl.close();
}

async function getConfiguration(options) {
  if (options.yes) {
    return {
      useReactQuery: true,
      useApollo: true,
      useZustand: true,
      aiChoice: 'openai',
      useClass: false
    };
  }

  const useReactQuery = await askQuestion('Do you want to use React Query? (y/n): ') === 'y';
  const useApollo = !useReactQuery && (await askQuestion('Do you want to use Apollo Client? (y/n): ') === 'y');
  const useZustand = !useApollo && (await askQuestion('Do you want to use Zustand for state management? (y/n): ') === 'y');
  const aiChoice = await askQuestion('Which AI API do you want to use? (openai/claude/v0/none): ');
  const useClass = await askQuestion('Do you want to use a class-based service? (y/n): ') === 'y';

  return { useReactQuery, useApollo, useZustand, aiChoice, useClass };
}

function createProjectStructure(projectName, config) {
  fs.mkdirSync(projectName);
  process.chdir(projectName);

  execSync('npx create-next-app . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-yarn', { stdio: 'inherit' });

  const directories = [
    config.useApollo ? 'src/lib' : '',
    config.useClass ? 'src/services/Ai' : 'src/utils',
    config.useZustand ? 'src/store' : '',
    'src/components'
  ].filter(Boolean);

  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

function installDependencies(config) {
  const dependencies = [];
  if (config.useReactQuery) {
    dependencies.push('@tanstack/react-query', '@tanstack/react-query-devtools');
  }
  if (config.useApollo) {
    dependencies.push('@apollo/client', 'graphql');
  }
  if (config.useZustand) {
    dependencies.push('zustand');
  }
  if (config.aiChoice === 'openai') {
    dependencies.push('openai');
  } else if (config.aiChoice === 'claude') {
    dependencies.push('@anthropic-ai/sdk');
  } else if (config.aiChoice === 'v0') {
    dependencies.push('ai');
    dependencies.push('@ai-sdk/openai');
  }

  if (dependencies.length > 0) {
    execSync(`yarn add ${dependencies.join(' ')}`, { stdio: 'inherit' });
  }
}

function createNecessaryFiles(config) {
  if (config.useReactQuery) {
    createReactQueryProvider();
    updateLayoutFile();
  }
  if (config.useApollo) {
    createApolloClientFile();
  }
  if (config.useZustand) {
    createZustandStore();
  }
  if (config.aiChoice !== 'none') {
    createAIService(config.aiChoice, config.useClass);
  }
}

function updateLayoutFile() {
  const layoutPath = path.join('src', 'app', 'layout.tsx');
  let content = fs.readFileSync(layoutPath, 'utf8');
  content = content.replace(
    "export default function RootLayout({",
    "import Providers from './providers'\n\nexport default function RootLayout({"
  );
  content = content.replace(
    "{children}",
    "<Providers>{children}</Providers>"
  );
  fs.writeFileSync(layoutPath, content);
}

function createReactQueryProvider() {
  const content = `
import React, { useState } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

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

function createApolloClientFile() {
  const content = `
import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_API_URL,
  cache: new InMemoryCache(),
});

export default client;
  `.trim();

  fs.writeFileSync(path.join('src', 'lib', 'apollo-client.ts'), content);

  // Create .env.local file
  const envContent = `
NEXT_PUBLIC_GRAPHQL_API_URL=https://api.spacex.land/graphql/
  `.trim();

  fs.writeFileSync('.env.local', envContent);
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

function createAIService(aiChoice, useClass) {
  const content = getAIServiceContent(aiChoice, useClass);
  const filePath = useClass ? path.join('src', 'services', 'Ai', 'ai.ts') : path.join('src', 'utils', 'ai.ts');
  fs.writeFileSync(filePath, content);
}

function getAIServiceContent(aiChoice, useClass) {
  if (useClass) {
    return getClassBasedAIService(aiChoice);
  } else {
    return getFunctionBasedAIService(aiChoice);
  }
}

function getClassBasedAIService(aiChoice) {
  switch(aiChoice) {
    case 'openai':
      return `
import OpenAI from 'openai';

export class AIService {
  private readonly openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateText(prompt: string): Promise<string> {
    try {
      const chatCompletion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      });

      return chatCompletion.choices[0].message.content || '';
    } catch (error) {
      console.error('Error generating text:', error);
      throw new Error('Failed to generate text');
    }
  }

  async generateImage(prompt: string): Promise<string> {
    try {
      const response = await this.openai.images.generate({
        prompt: prompt,
        n: 1,
        size: "1024x1024",
      });

      return response.data[0].url || '';
    } catch (error) {
      console.error('Error generating image:', error);
      throw new Error('Failed to generate image');
    }
  }
}
      `.trim();
    case 'claude':
      return `
import Anthropic from '@anthropic-ai/sdk';

export class AIService {
  private anthropic: Anthropic;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async generateText(prompt: string): Promise<string> {
    try {
      const completion = await this.anthropic.completions.create({
        model: 'claude-2',
        prompt: prompt,
        max_tokens_to_sample: 300,
      });

      return completion.completion;
    } catch (error) {
      console.error('Error generating text:', error);
      throw new Error('Failed to generate text');
    }
  }
}
      `.trim();
    case 'v0':
      return `
import { generateText } from 'ai';

import {
  createOpenAI,
  OpenAIProvider,
} from '@ai-sdk/openai';

export class AIService {
  private openai: OpenAIProvider;

  constructor() {
    this.openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      compatibility: 'strict',
    });
  }

  async generateCompletion(prompt: string): Promise<string> {

    const { text } = await generateText({
      model: this.openai('gpt-3.5-turbo'),
      messages:[
        { role: 'user', content: prompt }
      ],
    });

    return text;
  }
}
      `.trim();
    default:
      return '';
  }
}

function getFunctionBasedAIService(aiChoice) {
  switch(aiChoice) {
    case 'openai':
      return `
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
    case 'claude':
      return `
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
    case 'v0':
      return `
import {
  createOpenAI,
  OpenAIProvider,
} from '@ai-sdk/openai';
 
import { generateText } from 'ai';

const openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      compatibility: 'strict',
});

export async function generateCompletion(prompt: string): Promise<string> {
  const {text} = await generateText({
      model: openai('gpt-3.5-turbo'),
      messages:[
        { role: 'user', content: prompt }
      ],
  });

  return text;
}
      `.trim();
    default:
      return '';
  }
}

module.exports = { setup };