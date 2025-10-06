# Dialog Components

This directory contains all dialog components for the application.

## StandardDialog Component

The `StandardDialog` is a reusable dialog wrapper that provides a consistent structure across all dialogs in the application.

### Features

- **Consistent Header**: Title with optional close button
- **Standardized Footer**: Cancel and action buttons with consistent styling
- **Flexible Content**: Pass any content as children
- **Loading States**: Built-in support for action loading states
- **Accessibility**: Proper ARIA labels and descriptions
- **Violet Theme**: Uses violet-600 for primary actions and focus states

### Usage

```tsx
import { StandardDialog } from '@/components/dialogs';

<StandardDialog
  open={isOpen}
  onOpenChange={setIsOpen}
  title='Dialog Title'
  description='Optional accessibility description'
  onCancel={handleCancel}
  onAction={handleSave}
  actionDisabled={!isValid}
  actionLabel='Save'
  cancelLabel='Cancel'
>
  {/* Your dialog content here */}
</StandardDialog>;
```

### Props

| Prop              | Type                      | Default           | Description                             |
| ----------------- | ------------------------- | ----------------- | --------------------------------------- |
| `open`            | `boolean`                 | -                 | Controls dialog visibility              |
| `onOpenChange`    | `(open: boolean) => void` | -                 | Callback when dialog visibility changes |
| `trigger`         | `ReactNode`               | -                 | Optional trigger element                |
| `title`           | `string`                  | -                 | Dialog title (required)                 |
| `description`     | `string`                  | -                 | Accessibility description               |
| `children`        | `ReactNode`               | -                 | Dialog content                          |
| `cancelLabel`     | `string`                  | `'Cancel'`        | Cancel button text                      |
| `actionLabel`     | `string`                  | `'Save'`          | Action button text                      |
| `onCancel`        | `() => void`              | -                 | Cancel button handler                   |
| `onAction`        | `() => void`              | -                 | Action button handler                   |
| `actionDisabled`  | `boolean`                 | `false`           | Disables action button                  |
| `actionLoading`   | `boolean`                 | `false`           | Shows loading state                     |
| `hideFooter`      | `boolean`                 | `false`           | Hides the footer                        |
| `maxWidth`        | `string`                  | `'max-w-[532px]'` | Dialog max width class                  |
| `showCloseButton` | `boolean`                 | `true`            | Shows close button in header            |

## Dialog Styling Guidelines

### Footer

The standard footer uses these specifications:

- Container: `flex items-center justify-end gap-3 border-t border-gray-200 px-5 py-4`
- Cancel Button: `Button` with `variant='outline'` and `h-9 rounded-md border-gray-300 px-4 text-sm text-gray-700`
- Action Button: `Button` with `h-9 rounded-md px-4 text-sm font-medium`
  - Enabled: `bg-violet-600 text-white hover:bg-violet-700 border-violet-600`
  - Disabled: `bg-gray-200 text-gray-700 hover:bg-gray-200 border-gray-300`

### Input Fields

All input fields in dialogs should use these classes for consistency:

```tsx
className =
  'w-full border-gray-200 shadow-xs text-sm focus-visible:border-violet-600 focus-visible:ring-1 focus-visible:ring-violet-600 transition-all duration-200';
```

### Labels

Labels should use:

```tsx
className = 'text-xs font-medium text-gray-700 leading-4 block';
```

### Spacing

- Content wrapper: `space-y-6` for vertical spacing between form fields
- Form fields: `space-y-1` for label-to-input spacing

## Existing Dialogs

- **AddAnswerDialog**: Add new question/answer pairs
- **ExcelUploadDialog**: Upload Excel questionnaires
- **UploadResourceDialog**: Upload resource documents

All these dialogs now use the `StandardDialog` component for consistency.
