import { readFileSync } from 'fs';
import { join } from 'path';

interface PortConfig {
  nextjs: number;
  mcp: {
    sqlite: number;
    filesystem: number;
  };
  grpc: {
    server: number;
    http: number;
  };
}

interface ConfigFile {
  development: PortConfig;
  production: PortConfig;
  fallback: PortConfig;
}

let portConfig: PortConfig | null = null;

export function loadPortConfig(): PortConfig {
  if (portConfig) {
    return portConfig;
  }

  try {
    const configPath = join(process.cwd(), 'config', 'ports.json');
    const configData = readFileSync(configPath, 'utf-8');
    const config: ConfigFile = JSON.parse(configData);
    
    const environment = process.env.NODE_ENV || 'development';
    portConfig = config[environment as keyof ConfigFile] || config.fallback;
    
    return portConfig;
  } catch (error) {
    console.warn('Failed to load port config, using fallback values:', error);
    return {
      nextjs: 3000,
      mcp: {
        sqlite: 3001,
        filesystem: 3002
      },
      grpc: {
        server: 50051,
        http: 50052
      }
    };
  }
}

export function getNextJSPort(): number {
  return loadPortConfig().nextjs;
}

export function getMCPPort(service: keyof PortConfig['mcp']): number {
  return loadPortConfig().mcp[service];
}

export function getGRPCPort(type: keyof PortConfig['grpc']): number {
  return loadPortConfig().grpc[type];
}

export function getBaseURL(): string {
  const port = getNextJSPort();
  return process.env.NEXT_PUBLIC_BASE_URL || `http://localhost:${port}`;
}

export function getAllPorts(): PortConfig {
  return loadPortConfig();
}
