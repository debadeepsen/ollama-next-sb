const testOllamaAPI = async () => {
  try {
    console.log('Testing Ollama API directly...');
    
    const response = await fetch('http://127.0.0.1:11434/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3.1:8b',
        messages: [{ role: 'user', content: 'Hello test' }],
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Ollama API response:', data);
    
    console.log('\nTesting Next.js API route...');
    
    const apiResponse = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello test' }],
        stream: false,
      }),
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('Next.js API error:', apiResponse.status, errorText);
      throw new Error(`Next.js API error: ${apiResponse.statusText}`);
    }

    const apiData = await apiResponse.json();
    console.log('Next.js API response:', apiData);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
};

testOllamaAPI();
