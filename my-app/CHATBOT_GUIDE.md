# AI Chatbot Setup & Troubleshooting Guide

## 🤖 Chatbot Features

The AI chatbot provides:

- **Personalized rehabilitation advice** based on patient progress
- **Exercise motivation and tips**
- **Progress tracking insights**
- **24/7 support** for rehabilitation questions
- **Speech synthesis** for audio responses
- **Smart fallback responses** when AI services are unavailable

## 🔧 Setup Instructions

### 1. OpenAI API Key (Optional but Recommended)

The chatbot works with or without OpenAI, but provides better responses with it:

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create an account and get an API key
3. Add it to your `.env.local` file:
   ```bash
   OPENAI_API_KEY=sk-your-actual-openai-key-here
   ```

### 2. Alternative: Use Without OpenAI

The chatbot includes intelligent fallback responses that work without any API keys:

- **Progress tracking** responses
- **Exercise motivation**
- **Pain management** guidance
- **Goal setting** advice
- **General rehabilitation** support

## 🐛 Common Issues & Fixes

### Issue 1: "Chatbot temporarily unavailable"

**Solution:** This is normal! The chatbot falls back to built-in responses.

- Check if `OPENAI_API_KEY` is set correctly in `.env.local`
- Restart the development server: `npm run dev`
- The chatbot will still work with fallback responses

### Issue 2: Toast notifications not appearing

**Solution:** Fixed! Toast provider is now properly configured in the root layout.

### Issue 3: TypeScript errors

**Solution:** All type errors have been resolved:

- Database schema mismatches fixed
- Missing patient fields handled gracefully
- OpenAI type issues resolved with fallback system

### Issue 4: Speech synthesis not working

**Solution:**

- Click the audio button (🔊) in the chatbot header
- Ensure browser permissions allow audio
- Speech synthesis works in modern browsers

## 🎯 How to Use the Chatbot

### For Patients:

1. **Click the chat bubble** in the bottom-right corner
2. **Try quick actions** or type your own questions:
   - "Show me my progress"
   - "I need motivation"
   - "Help with exercise form"
   - "What are today's goals?"

### Sample Questions:

- _"How am I doing with my rehabilitation?"_
- _"I'm feeling discouraged, can you help?"_
- _"What should I focus on today?"_
- _"My shoulder hurts during exercises, what should I do?"_
- _"Give me tips for better exercise form"_

## 🔄 Fallback Response System

When OpenAI is unavailable, the chatbot uses intelligent pattern matching:

- **Progress questions** → Encouraging progress insights
- **Motivation requests** → Motivational messages
- **Exercise help** → Form and technique tips
- **Pain concerns** → Safety guidance
- **Goal setting** → Goal-oriented advice
- **General help** → Comprehensive support info

## 🛠️ Technical Details

### File Structure:

```
src/
├── components/AIChatbot.tsx       # Main chatbot UI component
├── hooks/useChatbot.ts           # Chatbot logic and state management
├── app/api/chatbot/route.ts      # Backend API with OpenAI integration
└── app/layout.tsx                # Toast provider configuration
```

### Key Features:

- **Responsive design** with minimize/maximize options
- **Real-time typing indicators**
- **Message history** with scrolling
- **Error handling** with graceful fallbacks
- **Accessibility** with keyboard navigation
- **Animation** for smooth user experience

## 🚀 Testing the Chatbot

1. **Start the development server:**

   ```bash
   npm run dev
   ```

2. **Navigate to the patient dashboard:**

   ```
   http://localhost:3000/patient/daily-progress
   ```

3. **Click the chatbot button** (floating chat bubble)

4. **Try these test messages:**
   - "Help me with my exercises"
   - "Show my progress"
   - "I need motivation"
   - "What should I do today?"

## 🎨 Customization Options

### Theming:

```tsx
<AIChatbot
  patientId={currentPatient?.id}
  position="fixed"
  theme="light" // or "dark"
  className="custom-chat"
/>
```

### Quick Actions:

Customize quick action buttons in `hooks/useChatbot.ts`:

```tsx
export const QUICK_ACTIONS = [
  {
    id: "custom",
    label: "🎯 Custom Action",
    message: "Your custom message here",
  },
  // ... more actions
];
```

## 📞 Support

If you encounter any issues:

1. **Check the browser console** for error messages
2. **Verify environment variables** in `.env.local`
3. **Test with fallback responses** (should always work)
4. **Restart the development server** if needed

The chatbot is designed to be resilient and provide helpful responses even when external services are unavailable!

## 🌟 Pro Tips

- **Use the audio feature** for hands-free interaction during exercises
- **Try the quick actions** for common questions
- **Ask specific questions** about your rehabilitation journey
- **The chatbot remembers context** within the conversation
- **Clear messages** anytime with the reset button (🔄)

---

**Note:** The chatbot provides general wellness guidance but always reminds users to consult healthcare providers for medical concerns. It's designed to complement, not replace, professional medical advice.
