# Quick Integration Guide - Adding AI Features to Dashboard

## 🎯 Goal
Add AI-powered features to your existing Todo dashboard without breaking current functionality.

---

## Step 1: Update TaskForm Component

Add AI Suggestions button to the task creation form.

**File**: `frontend/src/components/tasks/TaskForm.tsx`

Add these imports at the top:
```typescript
import AITaskSuggestions from './AITaskSuggestions';
import AITaskEnhancement from './AITaskEnhancement';
```

Add state for AI features (after existing useState declarations):
```typescript
const [showAISuggestions, setShowAISuggestions] = useState(false);
const [showAIEnhancement, setShowAIEnhancement] = useState(false);
```

Add handlers for AI features:
```typescript
const handleAISuggestion = (suggestion: string) => {
  setTitle(suggestion);
  setShowAISuggestions(false);
};

const handleAIEnhancement = (enhanced: any) => {
  if (enhanced.description) setDescription(enhanced.description);
  if (enhanced.category) setCategory(enhanced.category);
  if (enhanced.priority) setPriority(enhanced.priority);
  setShowAIEnhancement(false);
};
```

Add AI buttons in the form (after the title input field):
```tsx
{/* AI Features Row */}
<div className="flex gap-2 mb-4">
  <button
    type="button"
    onClick={() => setShowAISuggestions(true)}
    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
  >
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
    AI Suggestions
  </button>

  {title && (
    <button
      type="button"
      onClick={() => setShowAIEnhancement(true)}
      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
      AI Enhance
    </button>
  )}
</div>

{/* AI Modals */}
{showAISuggestions && (
  <AITaskSuggestions onSelectSuggestion={handleAISuggestion} />
)}

{showAIEnhancement && (
  <div className="mb-4">
    <AITaskEnhancement
      title={title}
      description={description}
      onEnhance={handleAIEnhancement}
    />
  </div>
)}
```

---

## Step 2: Simple Integration (Minimal Changes)

If you want to add AI features with minimal code changes, just add the components to your dashboard:

**File**: `frontend/src/app/dashboard/page.tsx`

Add import at the top:
```typescript
import AITaskSuggestions from '@/components/tasks/AITaskSuggestions';
```

Add state:
```typescript
const [showAISuggestions, setShowAISuggestions] = useState(false);
```

Add a floating AI button (before the closing `</DashboardLayout>` tag):
```tsx
{/* Floating AI Assistant Button */}
<button
  onClick={() => setShowAISuggestions(true)}
  className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center z-50"
  aria-label="AI Task Assistant"
>
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
</button>

{/* AI Suggestions Modal */}
{showAISuggestions && (
  <AITaskSuggestions
    onSelectSuggestion={(suggestion) => {
      // Auto-fill the task form with the suggestion
      const titleInput = document.getElementById('task-title') as HTMLInputElement;
      if (titleInput) {
        titleInput.value = suggestion;
        titleInput.dispatchEvent(new Event('input', { bubbles: true }));
        titleInput.focus();
      }
      setShowAISuggestions(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }}
  />
)}
```

---

## Step 3: Test the Integration

### Backend Test:
```bash
# Terminal 1 - Start backend
cd backend
pip install -r requirements.txt
uvicorn src.main:app --reload --port 8000
```

### Frontend Test:
```bash
# Terminal 2 - Start frontend
cd frontend
npm run dev
```

### Verify AI Service:
```bash
# Check if AI service is healthy
curl http://localhost:8000/api/ai/health
```

Expected response:
```json
{
  "status": "healthy",
  "message": "AI service is configured and ready",
  "provider": "Cohere"
}
```

---

## Step 4: Usage Flow

1. **Open Dashboard** → http://localhost:3000/dashboard
2. **Click AI Suggestions Button** (floating button or in form)
3. **Enter Context** → e.g., "Planning a product launch"
4. **Click Generate** → AI generates 5 task suggestions
5. **Click a Suggestion** → Auto-fills the task form
6. **Click AI Enhance** → AI improves description, adds category, priority, tags
7. **Submit Task** → Task is created with AI enhancements

---

## Step 5: Advanced Features

### Auto-Complete While Typing

Add to TaskForm component:

```typescript
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useDebounce } from '@/hooks/useDebounce';

// In your component:
const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<string[]>([]);
const debouncedTitle = useDebounce(title, 500);

useEffect(() => {
  if (debouncedTitle.length >= 3) {
    api.ai.autocomplete(debouncedTitle)
      .then(setAutocompleteSuggestions)
      .catch(() => setAutocompleteSuggestions([]));
  } else {
    setAutocompleteSuggestions([]);
  }
}, [debouncedTitle]);

// In your JSX (after title input):
{autocompleteSuggestions.length > 0 && (
  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
    {autocompleteSuggestions.map((suggestion, index) => (
      <button
        key={index}
        type="button"
        onClick={() => setTitle(suggestion)}
        className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors"
      >
        {suggestion}
      </button>
    ))}
  </div>
)}
```

### Batch AI Enhancement

Add a button to enhance all tasks:

```typescript
const handleBatchEnhance = async () => {
  const unenhancedTasks = tasks.filter(t => !t.category || !t.priority);

  for (const task of unenhancedTasks) {
    try {
      const categorization = await api.ai.categorizeTask(task.title, task.description || '');
      await api.tasks.update(task.id, {
        category: categorization.category,
        priority: categorization.priority,
      });
    } catch (err) {
      console.error(`Failed to enhance task ${task.id}`, err);
    }
  }

  fetchTasks(); // Refresh the list
  showToast('Tasks enhanced with AI!', 'success');
};
```

---

## 🎨 UI Customization

### Change AI Button Colors

```css
/* Blue theme */
.ai-button-blue {
  @apply bg-blue-600 hover:bg-blue-700 text-white;
}

/* Purple theme */
.ai-button-purple {
  @apply bg-purple-600 hover:bg-purple-700 text-white;
}

/* Gradient theme */
.ai-button-gradient {
  @apply bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white;
}
```

### Add Loading Animations

```tsx
{loading && (
  <div className="flex items-center gap-2">
    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
    <span>AI is thinking...</span>
  </div>
)}
```

---

## 🔧 Troubleshooting

### Issue: AI buttons not showing
**Solution**: Make sure you imported the components correctly and added the state variables.

### Issue: "Failed to generate suggestions"
**Solution**:
1. Check backend is running: `curl http://localhost:8000/api/ai/health`
2. Verify COHERE_API_KEY in `backend/.env`
3. Check browser console for errors

### Issue: 401 Unauthorized
**Solution**: Make sure you're logged in. AI endpoints require authentication.

### Issue: Slow AI responses
**Solution**: This is normal for AI operations. Consider adding:
- Loading indicators
- Timeout handling
- Retry logic

---

## 📊 Monitoring AI Usage

Add analytics to track AI feature usage:

```typescript
const trackAIUsage = (feature: string) => {
  console.log(`AI Feature Used: ${feature}`);
  // Add your analytics here (Google Analytics, Mixpanel, etc.)
};

// Usage:
trackAIUsage('task-suggestions');
trackAIUsage('task-enhancement');
trackAIUsage('auto-complete');
```

---

## ✅ Integration Checklist

- [ ] Backend dependencies installed (`pip install -r requirements.txt`)
- [ ] Backend server running on port 8000
- [ ] Frontend server running on port 3000
- [ ] AI health check passes
- [ ] Can generate task suggestions
- [ ] Can enhance task descriptions
- [ ] Can categorize tasks
- [ ] UI components render correctly
- [ ] Error handling works
- [ ] Loading states display properly

---

## 🚀 Next Steps

1. **Add AI to Edit Modal**: Include AI enhancement in the edit task modal
2. **Smart Notifications**: Use AI to suggest when to work on tasks
3. **Task Insights**: Add AI-powered productivity insights
4. **Voice Input**: Integrate speech-to-text with AI enhancement
5. **Smart Scheduling**: AI suggests optimal times for tasks

---

**Ready to use!** Your Todo app now has AI superpowers! 🎉
