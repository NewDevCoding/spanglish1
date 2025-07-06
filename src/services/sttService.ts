const sttService = {
  async startListening(): Promise<string> {
    // Mock: use browser prompt
    const result = window.prompt('Simulate speaking: Type what you would say');
    return result || '';
  }
};

export default sttService; 