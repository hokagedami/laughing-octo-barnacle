import type { Configuration } from 'webpack';
import { EnvironmentPlugin } from 'webpack';
import Dotenv from 'dotenv-webpack';

const config: Configuration = {
  plugins: [
    new Dotenv(),
    new EnvironmentPlugin(['CLAUDE_API_KEY'])
  ]
};

export default config;
