/**
 * CC_GodMode - Hook Validation Test File
 *
 * This file tests the check-api-impact.js PostToolUse hook functionality.
 *
 * Purpose:
 * - Validate that API file changes trigger the hook correctly
 * - Document actual hook behavior vs documented behavior
 * - Ensure API Guardian workflow is properly triggered
 *
 * Test Protocol:
 * 1. This file is created/modified with Write tool
 * 2. Hook should detect it's in src/api/ directory
 * 3. Hook should analyze for breaking changes
 * 4. Hook should discover consumers
 * 5. Hook should recommend @api-guardian workflow
 *
 * Expected Hook Output:
 * - Warning message about API file change
 * - Breaking change analysis
 * - Consumer discovery
 * - Workflow recommendation
 *
 * Created: 2026-01-07
 * Version: v5.5.0 (Critical Fixes Release)
 */

// Test API type definition
export interface UserApiResponse {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
  status: 'active' | 'inactive';
}

// Test API endpoint function signature
export async function getUserById(userId: string): Promise<UserApiResponse> {
  // Mock implementation for testing
  return {
    id: userId,
    username: 'testuser',
    email: 'test@example.com',
    createdAt: new Date(),
    status: 'active'
  };
}

// Test API error type
export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
}

/**
 * Hook Test Notes:
 *
 * When this file is written/edited, the check-api-impact.js hook should:
 *
 * 1. DETECT: File is in src/api/ directory
 * 2. ANALYZE: Check for breaking changes in git diff
 * 3. DISCOVER: Find consumer files that import from this file
 * 4. REPORT: Show findings in formatted output
 * 5. RECOMMEND: Suggest @api-guardian workflow
 *
 * Validation Checklist:
 * [ ] Hook triggers on Write/Edit operations
 * [ ] Hook receives correct file path via $CLAUDE_FILE_PATH
 * [ ] Hook analyzes git diff correctly
 * [ ] Hook discovers consumers accurately
 * [ ] Hook output is properly formatted
 * [ ] Hook provides actionable recommendations
 *
 * If hook does NOT trigger or behaves differently:
 * - Document actual behavior in reports/v5.5.0/01-builder-implementation.md
 * - Investigate .claude/settings.json configuration
 * - Check hook execution permissions (chmod +x)
 * - Verify PostToolUse hook registration
 */
