const translationService = {
  async translate(text: string, fromLang: string, toLang: string): Promise<string> {
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, from: fromLang, to: toLang }),
      });
      const data = await res.json();
      if (data.translated) return data.translated;
      throw new Error(data.error || 'Translation failed');
    } catch (e: any) {
      return `${text} (translation error)`;
    }
  }
};

export default translationService; 