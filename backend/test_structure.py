import os
import sys

# Test structure validation
required_files = [
    'src/models/conversation.py',
    'src/models/message.py',
    'src/mcp/server.py',
    'src/mcp/tools/base.py',
    'src/mcp/tools/add_task.py',
    'src/mcp/tools/list_tasks.py',
    'src/mcp/tools/complete_task.py',
    'src/mcp/tools/delete_task.py',
    'src/mcp/tools/update_task.py',
    'src/agents/cohere_client.py',
    'src/agents/orchestrator.py',
    'src/validation/tool_validator.py',
    'src/validation/security_guard.py',
    'src/services/conversation_service.py',
    'src/services/error_formatter.py',
    'src/api/chat.py',
    'src/config/logging.py',
    'alembic/versions/003_ai_chatbot_tables.py'
]

missing = []
present = []

for file in required_files:
    if os.path.exists(file):
        present.append(file)
    else:
        missing.append(file)

print(f"Files present: {len(present)}/{len(required_files)}")
print(f"Files missing: {len(missing)}")

if missing:
    print("\nMissing files:")
    for f in missing:
        print(f"  - {f}")
    sys.exit(1)
else:
    print("\n✓ All required files present")
    sys.exit(0)
