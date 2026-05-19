interface QualityScore {
  score: number;            // 0-100
  fieldsComplete: boolean;
  reasoningPresent: boolean;
  entitiesCount: number;
  flags: string[];
}

export function scoreOutput(output: string, _agentRole: string): QualityScore {
  const flags: string[] = [];
  let score = 100;

  // Check JSON validity if output contains JSON
  if (output.includes('{') || output.includes('[')) {
    try {
      const jsonMatch = output.match(/```json\n?([\s\S]*?)\n?```|(\[[\s\S]*\]|\{[\s\S]*\})/);
      if (jsonMatch) JSON.parse(jsonMatch[1] || jsonMatch[2]);
    } catch {
      flags.push('json_parse_error');
      score -= 30;
    }
  }

  // Check reasoning is present (not just conclusions)
  if (!output.includes('reason') && !output.includes('because') &&
      !output.includes('due to') && !output.includes('based on')) {
    flags.push('reasoning_absent');
    score -= 20;
  }

  // Check output is not suspiciously short
  if (output.length < 100) {
    flags.push('output_too_short');
    score -= 25;
  }

  // Check for generic filler phrases
  const genericPhrases = ['as mentioned', 'generally speaking', 'it depends',
                          'various factors', 'multiple considerations'];
  const genericCount = genericPhrases.filter(p =>
    output.toLowerCase().includes(p)).length;
  if (genericCount >= 2) {
    flags.push('generic_reasoning');
    score -= 15;
  }

  const entitiesCount = (output.match(/uuid|id":|"id":/gi) || []).length;

  return {
    score: Math.max(0, score),
    fieldsComplete: !flags.includes('json_parse_error'),
    reasoningPresent: !flags.includes('reasoning_absent'),
    entitiesCount,
    flags,
  };
}
