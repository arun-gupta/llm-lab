# Port Configuration System

The LLM Prompt Lab now uses a centralized port configuration system that allows you to easily manage and customize all service ports.

## 📁 Configuration File

All port configurations are stored in `config/ports.json`:

```json
{
  "development": {
    "nextjs": 3000,
    "mcp": {
      "sqlite": 3001,
      "filesystem": 3002
    },
    "grpc": {
      "server": 50051,
      "http": 50052
    }
  },
  "production": {
    "nextjs": 3000,
    "mcp": {
      "sqlite": 3001,
      "filesystem": 3002
    },
    "grpc": {
      "server": 50051,
      "http": 50052
    }
  },
  "fallback": {
    "nextjs": 3000,
    "mcp": {
      "sqlite": 3001,
      "filesystem": 3002
    },
    "grpc": {
      "server": 50051,
      "http": 50052
    }
  }
}
```

## 🔧 Port Management Utility

Use the port management utility to check, clean, and configure ports:

### Check Port Status
```bash
bash scripts/manage-ports.sh check
```

### Clean Ports (Kill Processes)
```bash
bash scripts/manage-ports.sh clean
```

### Show Current Configuration
```bash
bash scripts/manage-ports.sh config
```

### Update a Specific Port
```bash
# Update Next.js port
bash scripts/manage-ports.sh update nextjs 3001

# Update gRPC server port
bash scripts/manage-ports.sh update grpc-server 50053

# Update gRPC HTTP port
bash scripts/manage-ports.sh update grpc-http 50054

# Update MCP SQLite port
bash scripts/manage-ports.sh update mcp-sqlite 3003
```

### Regenerate Startup Scripts
```bash
bash scripts/manage-ports.sh generate
```

## 🚀 Quick Start with Configurable Ports

The main `quickstart.sh` script now supports configurable ports by default:

```bash
./quickstart.sh
```

This script will:
- Load ports from `config/ports.json`
- Start Next.js server on the configured port
- Start gRPC server on the configured ports
- Test all endpoints
- Display status information

## 📋 Available Services

| Service | Default Port | Description |
|---------|-------------|-------------|
| Next.js | 3000 | Main application server |
| gRPC Server | 50051 | gRPC protocol server |
| gRPC HTTP | 50052 | HTTP proxy for gRPC |
| MCP SQLite | 3001 | SQLite database MCP server |
| MCP Filesystem | 3002 | Filesystem MCP server |


## 🔄 Environment-Specific Configuration

The system supports different configurations for different environments:

- **Development**: Used when `NODE_ENV=development` (default)
- **Production**: Used when `NODE_ENV=production`
- **Fallback**: Used when config file is missing or invalid

## 🛠️ Integration Points

### Next.js API Routes
```typescript
import { getBaseURL, getGRPCPort } from '@/lib/port-config';

// Use configurable base URL
const baseURL = getBaseURL(); // http://localhost:3000

// Use configurable gRPC port
const grpcPort = getGRPCPort('http'); // 50052
```

### gRPC Server
The gRPC server automatically loads port configuration from `config/ports.json` and falls back to environment variables or defaults.

### Startup Scripts
All startup scripts are generated with the current port configuration and include proper environment variable setup.

## 🔍 Troubleshooting

### Port Conflicts
If you encounter port conflicts:

1. **Check what's using the ports:**
   ```bash
   bash scripts/manage-ports.sh check
   ```

2. **Clean conflicting processes:**
   ```bash
   bash scripts/manage-ports.sh clean
   ```

3. **Change ports if needed:**
   ```bash
   bash scripts/manage-ports.sh update nextjs 3001
   bash scripts/manage-ports.sh update mcp-sqlite 3003
   ```

### Configuration Issues
If the configuration file is corrupted or missing:

1. **Restore from backup:**
   ```bash
   cp config/ports.json.backup config/ports.json
   ```

2. **Regenerate startup scripts:**
   ```bash
   bash scripts/manage-ports.sh generate
   ```

## 📝 Best Practices

1. **Always use the port management utility** instead of manually editing port configurations
2. **Check port availability** before starting services
3. **Use environment-specific configurations** for different deployment scenarios
4. **Keep backups** of your port configuration
5. **Test port changes** before deploying to production

## 🔗 Related Files

- `config/ports.json` - Main configuration file
- `src/lib/port-config.ts` - TypeScript utility functions
- `scripts/manage-ports.sh` - Port management utility
- `scripts/generate-startup-scripts.sh` - Startup script generator
- `grpc-server/server.js` - gRPC server with configurable ports
- `quickstart-with-ports.sh` - Quickstart script with configurable ports
