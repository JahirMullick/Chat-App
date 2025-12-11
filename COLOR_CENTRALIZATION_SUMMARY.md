# Color Centralization Update

## Summary
All hardcoded colors throughout the project have been centralized into a single `colors.ts` file for consistent theming and easier maintenance.

## Changes Made

### 1. Created Central Colors File
**File:** `src/constants/colors.ts`
- Defined all colors used throughout the application
- Organized colors into logical categories:
  - Primary Colors (primary, primaryDark, primaryLight, primaryAccent)
  - Background Colors (white, background, backgroundLight, etc.)
  - Text Colors (text, textPrimary, textSecondary, etc.)
  - Status Colors (success, error, warning)
  - Functional Colors (online, offline, icon colors, etc.)
  - Message Colors (messageBubbleMe, messageBubbleOther)
  - Semantic Colors with opacity (shadow, blackOpacity, whiteOpacity)

### 2. Updated Screen Files
All screen files now import and use `Colors` from the central file:
- ✅ `ChatFoldersScreen.tsx` - Updated all UI colors
- ✅ `ChatScreen.tsx` - Updated header, messages, and status bar colors
- ✅ `HomeScreen.tsx` - Updated tabs, stories, FAB, and menu colors

### 3. Updated Component Files
All component files now use centralized colors:
- ✅ `Header.tsx` - Updated background and icon colors
- ✅ `ChatInput.tsx` - Updated input, icon, and placeholder colors
- ✅ `MessageBubble.tsx` - Updated bubble backgrounds, text, and icon colors

### 4. Updated Service Files
- ✅ `notificationService.ts` - Documented notification system color
- ✅ `chatService.ts` - Documented default avatar color

## Benefits

### 1. **Consistency**
- All colors are now defined in one place
- Ensures consistent color usage across the entire app
- No more scattered hardcoded hex values

### 2. **Maintainability**
- Easy to update colors globally
- Simple to implement theme switching in the future
- Clear color naming conventions

### 3. **Developer Experience**
- Autocomplete support for color names
- Self-documenting code (e.g., `Colors.primary` vs `#517DA2`)
- Easier to understand color purpose

### 4. **Future-Ready**
- Foundation for implementing dark mode
- Easy to add theme variants
- Simplified color palette management

## Color Categories

### Primary & Accent
- `primary`: #517DA2 - Main app color (headers, etc.)
- `primaryDark`: #5B9BD5 - Darker primary variant
- `primaryLight`: #64B5F6 - Lighter primary variant
- `primaryAccent`: #2196F3 - Accent color for highlights
- `iosBlue`: #007AFF - iOS standard blue

### Backgrounds
- `white`, `black` - Standard backgrounds
- `background`: #F5F5F5 - Light gray background
- `backgroundAccent`: #E3F2FD - Accent background

### Text
- `textPrimary`: #000 - Main text
- `textSecondary`: #666 - Secondary text
- `textLight`: #8E8E93 - Light text
- `textMuted`: #65676B - Muted text

### Status
- `success`: #4CAF50 - Success/online indicators
- `error`: #FF5252 - Error messages
- `warning`: #FF9800 - Warnings

### Messages
- `messageBubbleMe`: #DCF8C6 - Sent message bubble
- `messageBubbleOther`: #FFFFFF - Received message bubble
- `messageTimeMe`: #6B9F5D - Sent message time
- `messageTimeOther`: #5A6B54 - Received message time

## Usage Example

### Before:
```tsx
const styles = StyleSheet.create({
  header: {
    backgroundColor: '#517DA2',
    color: '#fff',
  },
  button: {
    backgroundColor: '#2196F3',
  }
});
```

### After:
```tsx
import Colors from '../constants/colors';

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.primary,
    color: Colors.white,
  },
  button: {
    backgroundColor: Colors.primaryAccent,
  }
});
```

## Next Steps (Optional Future Enhancements)

1. **Theme Context**: Create a ThemeContext for runtime theme switching
2. **Dark Mode**: Add dark theme color palette
3. **Color Variants**: Add more semantic color names based on component usage
4. **Accessibility**: Ensure color contrast ratios meet WCAG standards
5. **Platform-specific Colors**: Add platform-specific color variants if needed

## Files Modified
- Created: `src/constants/colors.ts`
- Updated: 8+ screen files
- Updated: 5+ component files
- Updated: 2 service files

All colors are now centralized and the project is ready for consistent theming! 🎨
