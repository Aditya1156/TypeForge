#!/usr/bin/env node

// Simple test script to verify Gemini API integration
import { fetchAiAnalysis } from './services/geminiService.js';

const testErrors = [
    { expected: 'h', actual: 'g' },
    { expected: 'e', actual: 'w' },
    { expected: 'l', actual: 'k' },
    { expected: 'l', actual: 'k' },
    { expected: 'o', actual: 'i' }
];

console.log('🧪 Testing Gemini AI API integration...');
console.log('📋 Test errors:', testErrors);

try {
    const result = await fetchAiAnalysis(testErrors);
    if (result) {
        console.log('✅ Gemini AI API test successful!');
        console.log('📊 Analysis:', result.analysis);
        console.log('🎯 Drill words:', result.drill);
    } else {
        console.log('❌ Gemini AI API test failed - null result');
    }
} catch (error) {
    console.error('❌ Gemini AI API test failed:', error.message);
}
