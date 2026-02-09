"""
Cohere AI Service for intelligent task management features.

This module provides AI-powered capabilities using Cohere's API:
- Task suggestions and auto-completion
- Smart categorization and tagging
- Priority recommendations
- Task description enhancement
"""

import os
from typing import List, Dict, Optional
import cohere
from dotenv import load_dotenv

load_dotenv()

# Initialize Cohere client with v2 API
COHERE_API_KEY = os.getenv("COHERE_API_KEY")
if not COHERE_API_KEY:
    raise ValueError("COHERE_API_KEY not found in environment variables")

co = cohere.ClientV2(COHERE_API_KEY)


class CohereAIService:
    """Service class for Cohere AI operations."""

    @staticmethod
    def generate_task_suggestions(context: str, count: int = 5) -> List[str]:
        """
        Generate task suggestions based on context.

        Args:
            context: Context or description to base suggestions on
            count: Number of suggestions to generate

        Returns:
            List of suggested task titles
        """
        try:
            user_message = f"""Based on the following context, suggest {count} specific, actionable tasks:

Context: {context}

Generate {count} clear, concise task titles (one per line, no numbering):"""

            response = co.chat(
                model='command-a-reasoning-08-2025',
                messages=[{"role": "user", "content": user_message}],
                temperature=0.7,
                max_tokens=1000  # Increased to allow for thinking + response
            )

            # Extract text from v2 API response - find the text content item
            result_text = ""

            for item in response.message.content:
                if hasattr(item, 'text'):
                    result_text = item.text
                    break

            if not result_text:
                return []

            suggestions = result_text.strip().split('\n')

            # Clean up suggestions
            suggestions = [s.strip().lstrip('- ').lstrip('• ').lstrip('* ').lstrip('1234567890. ')
                          for s in suggestions if s.strip()]

            return suggestions[:count]

        except Exception as e:
            print(f"Error generating task suggestions: {e}")
            return []

    @staticmethod
    def enhance_task_description(title: str, description: str = "") -> str:
        """
        Enhance a task description with more details and clarity.

        Args:
            title: Task title
            description: Current description (optional)

        Returns:
            Enhanced description
        """
        try:
            user_message = f"""Enhance this task description to be more clear and actionable:

Task: {title}
Current Description: {description if description else "None"}

Provide a clear, concise enhanced description (2-3 sentences):"""

            response = co.chat(
                model='command-a-reasoning-08-2025',
                messages=[{"role": "user", "content": user_message}],
                temperature=0.6,
                max_tokens=1000
            )

            # Extract text from v2 API response
            enhanced = ""
            for item in response.message.content:
                if hasattr(item, 'text'):
                    enhanced = item.text
                    break

            return enhanced.strip() if enhanced else description

        except Exception as e:
            print(f"Error enhancing description: {e}")
            return description

    @staticmethod
    def categorize_task(title: str, description: str = "") -> Dict[str, any]:
        """
        Categorize a task and suggest priority level.

        Args:
            title: Task title
            description: Task description

        Returns:
            Dictionary with category, priority, and tags
        """
        try:
            user_message = f"""Analyze this task and provide categorization:

Task: {title}
Description: {description}

Respond in this exact format:
Category: [Work/Personal/Health/Finance/Learning/Other]
Priority: [High/Medium/Low]
Tags: [tag1, tag2, tag3]"""

            response = co.chat(
                model='command-a-reasoning-08-2025',
                messages=[{"role": "user", "content": user_message}],
                temperature=0.5,
                max_tokens=1000
            )

            # Extract text from v2 API response
            result = ""
            for item in response.message.content:
                if hasattr(item, 'text'):
                    result = item.text
                    break

            # Parse response
            category = "Other"
            priority = "Medium"
            tags = []

            for line in result.split('\n'):
                if line.startswith('Category:'):
                    category = line.split(':', 1)[1].strip()
                elif line.startswith('Priority:'):
                    priority = line.split(':', 1)[1].strip()
                elif line.startswith('Tags:'):
                    tags_str = line.split(':', 1)[1].strip()
                    tags = [t.strip() for t in tags_str.strip('[]').split(',')]

            return {
                "category": category,
                "priority": priority,
                "tags": tags
            }

        except Exception as e:
            print(f"Error categorizing task: {e}")
            return {
                "category": "Other",
                "priority": "Medium",
                "tags": []
            }

    @staticmethod
    def smart_complete_task(partial_title: str) -> List[str]:
        """
        Provide smart auto-completion suggestions for task titles.

        Args:
            partial_title: Partial task title typed by user

        Returns:
            List of completion suggestions
        """
        try:
            user_message = f"""Complete this task title with 3 different variations:

Partial task: {partial_title}

Provide 3 complete task titles (one per line):"""

            response = co.chat(
                model='command-a-reasoning-08-2025',
                messages=[{"role": "user", "content": user_message}],
                temperature=0.8,
                max_tokens=1000
            )

            # Extract text from v2 API response
            result_text = ""
            for item in response.message.content:
                if hasattr(item, 'text'):
                    result_text = item.text
                    break

            completions = result_text.strip().split('\n')
            completions = [c.strip().lstrip('- ').lstrip('• ').lstrip('* ').lstrip('1234567890. ')
                          for c in completions if c.strip()]

            return completions[:3]

        except Exception as e:
            print(f"Error completing task: {e}")
            return []

    @staticmethod
    def analyze_task_complexity(title: str, description: str = "") -> Dict[str, any]:
        """
        Analyze task complexity and provide time estimate.

        Args:
            title: Task title
            description: Task description

        Returns:
            Dictionary with complexity level and estimated time
        """
        try:
            user_message = f"""Analyze the complexity of this task:

Task: {title}
Description: {description}

Respond in this format:
Complexity: [Simple/Moderate/Complex]
Estimated Time: [time estimate]
Subtasks Needed: [Yes/No]"""

            response = co.chat(
                model='command-a-reasoning-08-2025',
                messages=[{"role": "user", "content": user_message}],
                temperature=0.5,
                max_tokens=1000
            )

            # Extract text from v2 API response
            result = ""
            for item in response.message.content:
                if hasattr(item, 'text'):
                    result = item.text
                    break

            complexity = "Moderate"
            estimated_time = "Unknown"
            needs_subtasks = False

            for line in result.split('\n'):
                if line.startswith('Complexity:'):
                    complexity = line.split(':', 1)[1].strip()
                elif line.startswith('Estimated Time:'):
                    estimated_time = line.split(':', 1)[1].strip()
                elif line.startswith('Subtasks Needed:'):
                    needs_subtasks = 'yes' in line.lower()

            return {
                "complexity": complexity,
                "estimated_time": estimated_time,
                "needs_subtasks": needs_subtasks
            }

        except Exception as e:
            print(f"Error analyzing complexity: {e}")
            return {
                "complexity": "Moderate",
                "estimated_time": "Unknown",
                "needs_subtasks": False
            }


# Singleton instance
cohere_service = CohereAIService()
