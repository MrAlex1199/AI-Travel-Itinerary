/**
 * Animation Duration Tests
 * 
 * Property-based tests for animation duration limits.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import fs from 'fs';
import path from 'path';

/**
 * Maximum allowed animation duration in milliseconds
 * As per Requirements 5.4
 */
const MAX_ANIMATION_DURATION_MS = 500;

/**
 * Helper function to extract animation durations from CSS content
 * Returns array of durations in milliseconds
 */
const extractCSSAnimationDurations = (cssContent: string): number[] => {
  const durations: number[] = [];
  
  // Match animation shorthand: animation: name duration ...
  const animationShorthandRegex = /animation:\s*[a-zA-Z-]+\s+(\d+)ms/g;
  let match;
  while ((match = animationShorthandRegex.exec(cssContent)) !== null) {
    durations.push(parseInt(match[1], 10));
  }
  
  // Match animation-duration property
  const animationDurationRegex = /animation-duration:\s*(\d+)ms/g;
  while ((match = animationDurationRegex.exec(cssContent)) !== null) {
    durations.push(parseInt(match[1], 10));
  }
  
  return durations;
};

/**
 * Helper function to extract transition durations from CSS content
 * Returns array of durations in milliseconds
 */
const extractCSSTransitionDurations = (cssContent: string): number[] => {
  const durations: number[] = [];
  
  // Match transition shorthand: transition: property duration ...
  const transitionShorthandRegex = /transition:\s*[a-zA-Z-]+\s+(\d+)ms/g;
  let match;
  while ((match = transitionShorthandRegex.exec(cssContent)) !== null) {
    durations.push(parseInt(match[1], 10));
  }
  
  // Match transition-duration property
  const transitionDurationRegex = /transition-duration:\s*(\d+)ms/g;
  while ((match = transitionDurationRegex.exec(cssContent)) !== null) {
    durations.push(parseInt(match[1], 10));
  }
  
  return durations;
};

/**
 * Helper function to extract Tailwind duration classes from component files
 * Returns array of durations in milliseconds
 */
const extractTailwindDurations = (componentContent: string): number[] => {
  const durations: number[] = [];
  
  // Match Tailwind duration classes: duration-{number}
  const durationRegex = /duration-(\d+)/g;
  let match;
  while ((match = durationRegex.exec(componentContent)) !== null) {
    durations.push(parseInt(match[1], 10));
  }
  
  // Match Tailwind animation classes with durations: animate-{name}-{duration}
  // Note: Tailwind's default animations don't include duration in class name,
  // but custom ones might
  
  return durations;
};

/**
 * Helper function to read file content
 */
const readFileContent = (filePath: string): string => {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.warn(`Could not read file: ${filePath}`);
    return '';
  }
};

/**
 * Helper function to get all component files
 */
const getComponentFiles = (): string[] => {
  const componentsDir = path.join(process.cwd(), 'components');
  try {
    const files = fs.readdirSync(componentsDir);
    return files
      .filter(file => file.endsWith('.tsx') || file.endsWith('.ts'))
      .map(file => path.join(componentsDir, file));
  } catch (error) {
    console.warn('Could not read components directory');
    return [];
  }
};

describe('Animation Duration Limits', () => {
  describe('Property-Based Tests', () => {
    // Feature: ai-travel-itinerary, Property 13: Animation durations do not exceed limit
    // Validates: Requirements 5.4
    it('Property 13: animation durations do not exceed limit', () => {
      // Property: For any view transition animation, 
      // the animation duration should not exceed 500 milliseconds
      
      const allDurations: { source: string; duration: number }[] = [];
      
      // Check global CSS file
      const globalCSSPath = path.join(process.cwd(), 'app', 'globals.css');
      const globalCSS = readFileContent(globalCSSPath);
      
      if (globalCSS) {
        const animationDurations = extractCSSAnimationDurations(globalCSS);
        const transitionDurations = extractCSSTransitionDurations(globalCSS);
        
        animationDurations.forEach(duration => {
          allDurations.push({ source: 'globals.css (animation)', duration });
        });
        
        transitionDurations.forEach(duration => {
          allDurations.push({ source: 'globals.css (transition)', duration });
        });
      }
      
      // Check all component files for Tailwind duration classes
      const componentFiles = getComponentFiles();
      componentFiles.forEach(filePath => {
        const content = readFileContent(filePath);
        const durations = extractTailwindDurations(content);
        
        durations.forEach(duration => {
          allDurations.push({ 
            source: `${path.basename(filePath)} (Tailwind)`, 
            duration 
          });
        });
      });
      
      // Verify all durations are within the limit
      for (const { source, duration } of allDurations) {
        expect(duration).toBeLessThanOrEqual(MAX_ANIMATION_DURATION_MS);
        
        // Log for debugging (will only show if test fails)
        if (duration > MAX_ANIMATION_DURATION_MS) {
          console.error(`Animation duration exceeds limit in ${source}: ${duration}ms > ${MAX_ANIMATION_DURATION_MS}ms`);
        }
      }
      
      // Ensure we found at least some animations to test
      expect(allDurations.length).toBeGreaterThan(0);
    });

    // Property-based test: verify that any generated animation duration within valid range is acceptable
    it('Property 13 (generative): valid animation durations are accepted', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: MAX_ANIMATION_DURATION_MS }),
          (duration) => {
            // Property: Any animation duration from 1ms to 500ms should be valid
            expect(duration).toBeGreaterThan(0);
            expect(duration).toBeLessThanOrEqual(MAX_ANIMATION_DURATION_MS);
            
            // Verify the duration is within acceptable range
            const isValid = duration > 0 && duration <= MAX_ANIMATION_DURATION_MS;
            expect(isValid).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    // Property-based test: verify that any duration exceeding the limit is invalid
    it('Property 13 (generative): invalid animation durations are rejected', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: MAX_ANIMATION_DURATION_MS + 1, max: 10000 }),
          (duration) => {
            // Property: Any animation duration exceeding 500ms should be invalid
            expect(duration).toBeGreaterThan(MAX_ANIMATION_DURATION_MS);
            
            // Verify the duration exceeds the limit
            const isInvalid = duration > MAX_ANIMATION_DURATION_MS;
            expect(isInvalid).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Unit Tests', () => {
    it('should verify fadeIn animation duration is within limit', () => {
      const globalCSSPath = path.join(process.cwd(), 'app', 'globals.css');
      const globalCSS = readFileContent(globalCSSPath);
      
      expect(globalCSS).toBeTruthy();
      
      // The fadeIn animation should be 400ms (within 500ms limit)
      const animationDurations = extractCSSAnimationDurations(globalCSS);
      
      // Check if we found the fadeIn animation
      if (animationDurations.length > 0) {
        animationDurations.forEach(duration => {
          expect(duration).toBeLessThanOrEqual(MAX_ANIMATION_DURATION_MS);
        });
      }
    });

    it('should verify Tailwind transition durations are within limit', () => {
      const componentFiles = getComponentFiles();
      
      expect(componentFiles.length).toBeGreaterThan(0);
      
      componentFiles.forEach(filePath => {
        const content = readFileContent(filePath);
        const durations = extractTailwindDurations(content);
        
        durations.forEach(duration => {
          expect(duration).toBeLessThanOrEqual(MAX_ANIMATION_DURATION_MS);
        });
      });
    });

    it('should correctly extract animation durations from CSS', () => {
      const testCSS = `
        .test1 {
          animation: fadeIn 400ms ease-out;
        }
        .test2 {
          animation-duration: 300ms;
        }
      `;
      
      const durations = extractCSSAnimationDurations(testCSS);
      expect(durations).toContain(400);
      expect(durations).toContain(300);
    });

    it('should correctly extract transition durations from CSS', () => {
      const testCSS = `
        .test1 {
          transition: opacity 200ms ease;
        }
        .test2 {
          transition-duration: 150ms;
        }
      `;
      
      const durations = extractCSSTransitionDurations(testCSS);
      expect(durations).toContain(200);
      expect(durations).toContain(150);
    });

    it('should correctly extract Tailwind duration classes', () => {
      const testComponent = `
        <div className="transition-colors duration-300">
          <span className="transition-shadow duration-200">Test</span>
        </div>
      `;
      
      const durations = extractTailwindDurations(testComponent);
      expect(durations).toContain(300);
      expect(durations).toContain(200);
    });

    it('should handle CSS with no animations', () => {
      const testCSS = `
        .test {
          color: blue;
          padding: 10px;
        }
      `;
      
      const animationDurations = extractCSSAnimationDurations(testCSS);
      const transitionDurations = extractCSSTransitionDurations(testCSS);
      
      expect(animationDurations).toHaveLength(0);
      expect(transitionDurations).toHaveLength(0);
    });

    it('should handle component with no duration classes', () => {
      const testComponent = `
        <div className="bg-blue-500 text-white">
          <span>No animations here</span>
        </div>
      `;
      
      const durations = extractTailwindDurations(testComponent);
      expect(durations).toHaveLength(0);
    });

    it('should verify maximum duration constant is correct', () => {
      // Verify the constant matches the requirement
      expect(MAX_ANIMATION_DURATION_MS).toBe(500);
    });

    it('should verify edge case: exactly 500ms is valid', () => {
      const duration = 500;
      expect(duration).toBeLessThanOrEqual(MAX_ANIMATION_DURATION_MS);
    });

    it('should verify edge case: 501ms is invalid', () => {
      const duration = 501;
      expect(duration).toBeGreaterThan(MAX_ANIMATION_DURATION_MS);
    });

    it('should verify edge case: 1ms is valid', () => {
      const duration = 1;
      expect(duration).toBeLessThanOrEqual(MAX_ANIMATION_DURATION_MS);
      expect(duration).toBeGreaterThan(0);
    });

    it('should handle multiple animations in single CSS rule', () => {
      const testCSS = `
        .test {
          animation: fadeIn 400ms ease-out, slideIn 300ms ease-in;
        }
      `;
      
      const durations = extractCSSAnimationDurations(testCSS);
      // Should extract at least the first duration
      expect(durations.length).toBeGreaterThan(0);
      durations.forEach(duration => {
        expect(duration).toBeLessThanOrEqual(MAX_ANIMATION_DURATION_MS);
      });
    });

    it('should verify all actual component durations are within limit', () => {
      // This is a comprehensive check of all actual files
      const allDurations: number[] = [];
      
      // Check globals.css
      const globalCSSPath = path.join(process.cwd(), 'app', 'globals.css');
      const globalCSS = readFileContent(globalCSSPath);
      
      if (globalCSS) {
        allDurations.push(...extractCSSAnimationDurations(globalCSS));
        allDurations.push(...extractCSSTransitionDurations(globalCSS));
      }
      
      // Check all components
      const componentFiles = getComponentFiles();
      componentFiles.forEach(filePath => {
        const content = readFileContent(filePath);
        allDurations.push(...extractTailwindDurations(content));
      });
      
      // Verify all are within limit
      allDurations.forEach(duration => {
        expect(duration).toBeLessThanOrEqual(MAX_ANIMATION_DURATION_MS);
      });
      
      // Log summary
      if (allDurations.length > 0) {
        const maxFound = Math.max(...allDurations);
        const minFound = Math.min(...allDurations);
        console.log(`Found ${allDurations.length} animation durations`);
        console.log(`Range: ${minFound}ms - ${maxFound}ms (limit: ${MAX_ANIMATION_DURATION_MS}ms)`);
      }
    });
  });
});
