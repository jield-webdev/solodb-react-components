// Vitest setup file
// Extends expect with jest-dom matchers and configures test environment helpers
import '@testing-library/jest-dom';

// If needed in the future for libs depending on TextEncoder/TextDecoder
// (kept optional here to avoid global pollution unless required)
// import { TextEncoder, TextDecoder } from 'util';
// // @ts-ignore
// global.TextEncoder = TextEncoder;
// // @ts-ignore
// global.TextDecoder = TextDecoder as any;
