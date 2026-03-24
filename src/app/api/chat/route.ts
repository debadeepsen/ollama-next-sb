import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const {
      messages,
      model = 'llama3.1:8b',
      stream = true
    } = await request.json()

    console.log('Received chat request:', { messages, model, stream })

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    const ollamaResponse = await fetch('http://127.0.0.1:11434/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages,
        stream
      })
    })

    if (!ollamaResponse.ok) {
      console.log('Ollama API error:', ollamaResponse.statusText)
      throw new Error(`Ollama API error: ${ollamaResponse.statusText}`)
    }

    if (stream) {
      const reader = ollamaResponse.body?.getReader()
      const decoder = new TextDecoder()

      return new Response(
        new ReadableStream({
          async start(controller) {
            try {
              while (true) {
                const { done, value } = await reader!.read()
                if (done) break

                const chunk = decoder.decode(value, { stream: true })
                const lines = chunk.split('\n').filter(line => line.trim())

                for (const line of lines) {
                  try {
                    const parsed = JSON.parse(line)
                    controller.enqueue(`data: ${JSON.stringify(parsed)}\n\n`)
                  } catch (e) {
                    // Skip invalid JSON lines
                  }
                }
              }
              controller.enqueue('data: [DONE]\n\n')
              controller.close()
            } catch (error) {
              controller.error(error)
            }
          }
        }),
        {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive'
          }
        }
      )
    } else {
      const data = await ollamaResponse.json()
      return NextResponse.json({
        message: data.message,
        done: data.done
      })
    }
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Ollama Chat API is running',
    endpoints: {
      chat: 'POST /api/chat - Send messages to Ollama'
    },
    usage: {
      method: 'POST',
      body: {
        messages: 'Array of message objects with role and content',
        model: 'Optional model name (defaults to llama3.1:8b)'
      }
    }
  })
}
