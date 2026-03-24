# Ollama Chat - Accessible AI Chat Interface

A professional, WCAG 2.1 AA compliant chat interface built with Next.js and Tailwind CSS, powered by Ollama AI. Features full keyboard navigation, screen reader support, and modern accessibility standards.

## Features

- 🎯 **WCAG 2.1 AA Compliant** - Full accessibility support
- ⌨️ **Keyboard Navigation** - Complete keyboard control with shortcuts
- 🎙️ **Screen Reader Support** - Optimized for assistive technologies
- 📱 **Responsive Design** - Works on all devices
- 🚀 **Real-time Streaming** - Live message streaming from Ollama
- 🎨 **Modern UI** - Professional, polished interface
- 🔧 **TypeScript** - Full type safety

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- [Ollama AI](https://ollama.ai/) installed locally
- At least one Ollama model downloaded

## Quick Start

### 1. Install and Setup Ollama

**macOS/Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

**Windows:**
Download and run the installer from [ollama.ai](https://ollama.ai/download/windows)

### 2. Start Ollama Server

```bash
# Start Ollama service
ollama serve
```

The server will run on `http://127.0.0.1:11434`

### 3. Download a Model

```bash
# Download Llama 3.1 8B (recommended)
ollama pull llama3.1:8b

# Or try other models
ollama pull llama3.2:3b
ollama pull mistral
ollama pull codellama
```

### 4. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 5. Run the Application

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to start chatting!

## Configuration

### Default Model

The app uses `llama3.1:8b` by default. You can change this in `src/app/api/chat/route.ts`:

```typescript
const {
  messages,
  model = 'your-preferred-model', // Change this
  stream = true
} = await request.json()
```

### Available Models

Check available models:
```bash
ollama list
```

Download new models:
```bash
ollama pull <model-name>
```

## Development

### Project Structure

```
src/
├── app/
│   ├── api/chat/          # API route for Ollama integration
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/
│   └── Chat.tsx           # Main chat component
```

### Running in Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

### Testing Ollama Connection

You can test the Ollama API directly:

```bash
curl http://127.0.0.1:11434/api/generate \
  -d '{
    "model": "llama3.1:8b",
    "prompt": "Why is the sky blue?",
    "stream": false
  }'
```

## Accessibility Features

### Keyboard Shortcuts

- **Enter** - Send message
- **Shift+Enter** - New line in input
- **Escape** - Clear input field
- **Ctrl+Z** - Undo last message
- **Tab** - Navigate between elements

### Screen Reader Support

- Live announcements for message status
- Semantic HTML structure
- Proper ARIA labels and roles
- Focus management

### WCAG 2.1 AA Compliance

✅ Perceivable - Text alternatives, adaptable content, distinguishable elements  
✅ Operable - Keyboard accessible, no timing constraints, navigable  
✅ Understandable - Readable content, predictable functionality  
✅ Robust - Compatible with assistive technologies

See [WCAG_COMPLIANCE.md](./WCAG_COMPLIANCE.md) for detailed compliance information.

## Troubleshooting

### Common Issues

**"Failed to send message" Error:**
1. Ensure Ollama is running: `ollama serve`
2. Check if model is downloaded: `ollama list`
3. Verify Ollama is accessible: `curl http://127.0.0.1:11434/api/tags`

**Slow Response Times:**
- Try smaller models (e.g., `llama3.2:3b`)
- Ensure sufficient RAM (8GB+ recommended for 8B models)
- Check system resources with `ollama ps`

**Model Not Found:**
```bash
# Download the model
ollama pull llama3.1:8b

# Or update the default model in the API route
```

### Port Conflicts

If port 3000 is in use:
```bash
# Use a different port
npm run dev -- -p 3001
```

If Ollama port 11434 is in use:
```bash
# Stop other Ollama instances
# Then restart with
ollama serve
```

## API Reference

### Chat Endpoint

**POST /api/chat**

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Hello, how are you?"
    }
  ],
  "model": "llama3.1:8b",
  "stream": true
}
```

**GET /api/chat**

Returns API status and usage information.

## Deployment

### Environment Variables

Create a `.env.local` file:

```env
# Optional: Custom Ollama server URL
OLLAMA_URL=http://127.0.0.1:11434

# Optional: Default model
DEFAULT_MODEL=llama3.1:8b
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Vercel Deployment

1. Push to GitHub
2. Connect to Vercel
3. Set environment variables for Ollama URL
4. Deploy

**Note:** For production deployment, ensure Ollama is accessible from your deployment environment.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test accessibility compliance
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) for details.

## Support

- 📖 [Ollama Documentation](https://github.com/ollama/ollama/blob/main/README.md)
- 🐛 [Report Issues](https://github.com/your-username/ollama-next-sb/issues)
- 💬 [Discussions](https://github.com/your-username/ollama-next-sb/discussions)

---

**Built with ❤️ and accessibility in mind**
