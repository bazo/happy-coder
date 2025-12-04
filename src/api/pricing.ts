/**
 * Claude API Pricing Module
 *
 * Provides cost calculation for Claude API usage based on model and token counts.
 * Prices are in USD per 1 million tokens.
 *
 * Pricing as of December 2024:
 * - Claude 3.5 Opus: $15 input, $75 output
 * - Claude 3.5 Sonnet: $3 input, $15 output
 * - Claude 3.5 Haiku: $0.80 input, $4 output
 * - Claude 3 Opus: $15 input, $75 output
 * - Claude 3 Sonnet: $3 input, $15 output
 * - Claude 3 Haiku: $0.25 input, $1.25 output
 *
 * Cache pricing (where applicable):
 * - Cache write: 25% more than base input price
 * - Cache read: 90% less than base input price
 */

export interface ModelPricing {
    inputPer1M: number;
    outputPer1M: number;
    cacheWritePer1M: number;  // 25% more than input
    cacheReadPer1M: number;   // 90% less than input
}

/**
 * Pricing for Claude models (USD per 1M tokens)
 */
export const MODEL_PRICING: Record<string, ModelPricing> = {
    // Claude 4 (Opus 4.5)
    'claude-opus-4-5-20250514': {
        inputPer1M: 15,
        outputPer1M: 75,
        cacheWritePer1M: 18.75,  // 15 * 1.25
        cacheReadPer1M: 1.5      // 15 * 0.10
    },

    // Claude 4 Sonnet
    'claude-sonnet-4-20250514': {
        inputPer1M: 3,
        outputPer1M: 15,
        cacheWritePer1M: 3.75,   // 3 * 1.25
        cacheReadPer1M: 0.30     // 3 * 0.10
    },

    // Claude 3.5 Sonnet (latest and previous versions)
    'claude-3-5-sonnet-20241022': {
        inputPer1M: 3,
        outputPer1M: 15,
        cacheWritePer1M: 3.75,
        cacheReadPer1M: 0.30
    },
    'claude-3-5-sonnet-latest': {
        inputPer1M: 3,
        outputPer1M: 15,
        cacheWritePer1M: 3.75,
        cacheReadPer1M: 0.30
    },
    'claude-3-5-sonnet-20240620': {
        inputPer1M: 3,
        outputPer1M: 15,
        cacheWritePer1M: 3.75,
        cacheReadPer1M: 0.30
    },

    // Claude 3.5 Haiku
    'claude-3-5-haiku-20241022': {
        inputPer1M: 0.80,
        outputPer1M: 4,
        cacheWritePer1M: 1.00,   // 0.80 * 1.25
        cacheReadPer1M: 0.08     // 0.80 * 0.10
    },
    'claude-3-5-haiku-latest': {
        inputPer1M: 0.80,
        outputPer1M: 4,
        cacheWritePer1M: 1.00,
        cacheReadPer1M: 0.08
    },

    // Claude 3 Opus
    'claude-3-opus-20240229': {
        inputPer1M: 15,
        outputPer1M: 75,
        cacheWritePer1M: 18.75,
        cacheReadPer1M: 1.5
    },
    'claude-3-opus-latest': {
        inputPer1M: 15,
        outputPer1M: 75,
        cacheWritePer1M: 18.75,
        cacheReadPer1M: 1.5
    },

    // Claude 3 Sonnet
    'claude-3-sonnet-20240229': {
        inputPer1M: 3,
        outputPer1M: 15,
        cacheWritePer1M: 3.75,
        cacheReadPer1M: 0.30
    },

    // Claude 3 Haiku
    'claude-3-haiku-20240307': {
        inputPer1M: 0.25,
        outputPer1M: 1.25,
        cacheWritePer1M: 0.3125,  // 0.25 * 1.25
        cacheReadPer1M: 0.025     // 0.25 * 0.10
    }
};

// Default pricing if model is unknown (use Sonnet pricing as middle ground)
const DEFAULT_PRICING: ModelPricing = {
    inputPer1M: 3,
    outputPer1M: 15,
    cacheWritePer1M: 3.75,
    cacheReadPer1M: 0.30
};

/**
 * Get pricing for a model, with fallback to default
 */
export function getModelPricing(model?: string): ModelPricing {
    if (!model) {
        return DEFAULT_PRICING;
    }

    // Direct match
    if (MODEL_PRICING[model]) {
        return MODEL_PRICING[model];
    }

    // Try to match by model family
    const modelLower = model.toLowerCase();

    if (modelLower.includes('opus-4') || modelLower.includes('opus-4.5')) {
        return MODEL_PRICING['claude-opus-4-5-20250514'];
    }
    if (modelLower.includes('sonnet-4')) {
        return MODEL_PRICING['claude-sonnet-4-20250514'];
    }
    if (modelLower.includes('3-5-sonnet') || modelLower.includes('3.5-sonnet')) {
        return MODEL_PRICING['claude-3-5-sonnet-20241022'];
    }
    if (modelLower.includes('3-5-haiku') || modelLower.includes('3.5-haiku')) {
        return MODEL_PRICING['claude-3-5-haiku-20241022'];
    }
    if (modelLower.includes('opus')) {
        return MODEL_PRICING['claude-3-opus-20240229'];
    }
    if (modelLower.includes('haiku')) {
        return MODEL_PRICING['claude-3-haiku-20240307'];
    }
    if (modelLower.includes('sonnet')) {
        return MODEL_PRICING['claude-3-5-sonnet-20241022'];
    }

    return DEFAULT_PRICING;
}

export interface UsageTokens {
    input_tokens: number;
    output_tokens: number;
    cache_creation_input_tokens?: number;
    cache_read_input_tokens?: number;
}

export interface CostBreakdown {
    total: number;
    input: number;
    output: number;
    cacheWrite: number;
    cacheRead: number;
}

/**
 * Calculate cost for token usage
 *
 * @param usage - Token usage counts
 * @param model - Model name (optional, uses default pricing if not provided)
 * @returns Cost breakdown in USD
 */
export function calculateCost(usage: UsageTokens, model?: string): CostBreakdown {
    const pricing = getModelPricing(model);

    const inputCost = (usage.input_tokens / 1_000_000) * pricing.inputPer1M;
    const outputCost = (usage.output_tokens / 1_000_000) * pricing.outputPer1M;
    const cacheWriteCost = ((usage.cache_creation_input_tokens || 0) / 1_000_000) * pricing.cacheWritePer1M;
    const cacheReadCost = ((usage.cache_read_input_tokens || 0) / 1_000_000) * pricing.cacheReadPer1M;

    return {
        total: inputCost + outputCost + cacheWriteCost + cacheReadCost,
        input: inputCost,
        output: outputCost,
        cacheWrite: cacheWriteCost,
        cacheRead: cacheReadCost
    };
}
