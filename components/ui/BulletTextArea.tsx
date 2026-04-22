import { Colors, FontFamilies, FontSizes, responsiveSize } from "@/constants";
import { useCallback, useRef, useState } from "react";
import {
    StyleProp,
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    TextStyle,
    View,
    ViewStyle,
} from "react-native";

interface BulletTextAreaProps extends Omit<
  TextInputProps,
  "multiline" | "onChangeText" | "value" | "style"
> {
  value: string;
  onChangeText: (text: string) => void;
  label?: string;
  error?: string;
  minHeight?: number;
  containerStyle?: StyleProp<ViewStyle>;
  inputContainerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}

// ─── Utilities ────────────────────────────────────────────────────────────────

type LineInfo = {
  content: string;
  prefix: string;
  indent: string;
};

/**
 * Parse a line to extract prefix (indent + bullet/number) and content
 */
function parseLine(line: string): LineInfo {
  const indentMatch = line.match(/^(\s*)/);
  const indent = indentMatch?.[1] ?? "";
  const rest = line.slice(indent.length);

  // Check for ordered list: "1. ", "2. ", etc.
  const orderedMatch = rest.match(/^(\d+)\.\s/);
  if (orderedMatch) {
    const prefix = indent + orderedMatch[0];
    const content = rest.slice(orderedMatch[0].length);
    return { content, prefix, indent };
  }

  // Check for bullet: "• "
  if (rest.startsWith("• ")) {
    return { content: rest.slice(2), prefix: indent + "• ", indent };
  }

  // Check for dash: "- "
  if (rest.startsWith("- ")) {
    return { content: rest.slice(2), prefix: indent + "- ", indent };
  }

  // Plain line
  return { content: line, prefix: "", indent };
}

/**
 * Get the next number in a sequence at a given indent level
 */
function getNextNumber(
  text: string,
  upToIndex: number,
  indent: string,
): number {
  const beforeText = text.slice(0, upToIndex);
  const lines = beforeText.split("\n");

  // Search backwards for the last numbered item at this indent level
  for (let i = lines.length - 1; i >= 0; i -= 1) {
    const line = lines[i];
    if (!line.startsWith(indent)) continue;

    const rest = line.slice(indent.length);
    const match = rest.match(/^(\d+)\./);
    if (match) {
      return parseInt(match[1], 10) + 1;
    }
  }

  return 1;
}

/**
 * Transform text based on user input
 * Returns { text, cursor } if a transformation was made, null otherwise
 */
function transformText(
  previousText: string,
  newText: string,
): { text: string; cursor: number } | null {
  // Ignore deletions
  if (newText.length <= previousText.length) {
    return null;
  }

  // Find where the change occurred
  let changeStart = 0;
  while (
    changeStart < previousText.length &&
    changeStart < newText.length &&
    previousText[changeStart] === newText[changeStart]
  ) {
    changeStart += 1;
  }

  const inserted = newText.slice(
    changeStart,
    changeStart + (newText.length - previousText.length),
  );

  // ── Case 1: Enter pressed ──────────────────────────────────────────────────
  if (inserted.includes("\n")) {
    // Find the line that was just completed (the line before the newline)
    const newlinePos = changeStart + inserted.indexOf("\n");
    const lineStart = previousText.lastIndexOf("\n", changeStart - 1) + 1;
    const lineBeforeNewline = newText.slice(lineStart, newlinePos);
    const parsed = parseLine(lineBeforeNewline);

    // If it's not a list item, don't do anything special
    if (parsed.prefix === "") {
      return null;
    }

    // If it's an empty list item (just marker), remove the marker
    if (parsed.content.trim() === "") {
      // Remove the entire prefix from the previous line
      const cleaned =
        newText.slice(0, lineStart) + newText.slice(newlinePos + 1);
      return { text: cleaned, cursor: lineStart };
    }

    // Build the continuation prefix
    let continuationPrefix: string;
    if (parsed.prefix.endsWith("• ")) {
      continuationPrefix = parsed.indent + "• ";
    } else if (parsed.prefix.endsWith("- ")) {
      continuationPrefix = parsed.indent + "- ";
    } else {
      // Ordered list: get the next number
      const nextNum = getNextNumber(newText, newlinePos, parsed.indent);
      continuationPrefix = `${parsed.indent}${nextNum}. `;
    }

    // Insert the continuation prefix after the newline
    const result =
      newText.slice(0, newlinePos + 1) +
      continuationPrefix +
      newText.slice(newlinePos + 1);
    return { text: result, cursor: newlinePos + 1 + continuationPrefix.length };
  }

  // ── Case 2: Dash-space trigger ("- " or "* " → "• ")──────────────────────
  if (inserted === " ") {
    const lineStart = previousText.lastIndexOf("\n", changeStart - 1) + 1;
    const currentLine = newText.slice(lineStart, changeStart + 1);
    const parsed = parseLine(currentLine);

    // Convert "- " or "* " to "• "
    const dashMatch = currentLine.match(/^(\s*)[\-*]\s$/);
    if (dashMatch) {
      const indent = dashMatch[1];
      const replacement = indent + "• ";
      const result =
        newText.slice(0, lineStart) +
        replacement +
        newText.slice(lineStart + currentLine.length);
      return { text: result, cursor: lineStart + replacement.length };
    }

    // Normalize "N. " or "N) " to "N. "
    const numMatch = currentLine.match(/^(\s*)(\d+)[.)]\s$/);
    if (numMatch) {
      const indent = numMatch[1];
      const num = numMatch[2];
      const replacement = `${indent}${num}. `;
      const result =
        newText.slice(0, lineStart) +
        replacement +
        newText.slice(lineStart + currentLine.length);
      return { text: result, cursor: lineStart + replacement.length };
    }
  }

  return null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BulletTextArea({
  value,
  onChangeText,
  label,
  error,
  minHeight = responsiveSize(120),
  containerStyle,
  inputContainerStyle,
  inputStyle,
  placeholder = "Add notes...",
  placeholderTextColor = Colors.text.tertiary,
  onFocus,
  onBlur,
  ...props
}: BulletTextAreaProps) {
  const inputRef = useRef<TextInput>(null);
  const prevValueRef = useRef(value);
  const isProcessingRef = useRef(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleChangeText = useCallback(
    (newText: string) => {
      // Prevent re-processing our own programmatic updates
      if (isProcessingRef.current) {
        isProcessingRef.current = false;
        prevValueRef.current = newText;
        return;
      }

      const result = transformText(prevValueRef.current, newText);

      if (result) {
        // Apply transformation
        isProcessingRef.current = true;
        prevValueRef.current = result.text;
        onChangeText(result.text);

        // Restore cursor position in next frame
        requestAnimationFrame(() => {
          inputRef.current?.setNativeProps({
            selection: { start: result.cursor, end: result.cursor },
          });
        });
      } else {
        // No transformation needed, just track the new value
        prevValueRef.current = newText;
        onChangeText(newText);
      }
    },
    [onChangeText],
  );

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.inputWrapper,
          { minHeight },
          isFocused && styles.inputWrapperFocused,
          error && styles.inputWrapperError,
          inputContainerStyle,
        ]}
      >
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={handleChangeText}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor}
          multiline
          textAlignVertical="top"
          scrollEnabled={true}
          style={[
            styles.input,
            { minHeight, maxHeight: minHeight },
            inputStyle,
          ]}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          {...props}
        />
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  label: {
    color: Colors.text.primary,
    marginBottom: 8,
    fontSize: FontSizes.labelMD,
    fontFamily: FontFamilies.spartanMedium,
  },
  inputWrapper: {
    backgroundColor: Colors.background.primary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.neutral[700],
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  inputWrapperFocused: {
    borderColor: Colors.primary[300],
    borderWidth: 1.5,
  },
  inputWrapperError: {
    borderColor: Colors.error[500],
    borderWidth: 1,
  },
  input: {
    color: Colors.text.primary,
    fontSize: FontSizes.bodySM,
    lineHeight: responsiveSize(23),
    fontFamily: FontFamilies.poppinsRegular,
    includeFontPadding: false,
  },
  errorText: {
    marginTop: 4,
    color: Colors.error[500],
    fontSize: FontSizes.bodyXS,
    fontFamily: FontFamilies.poppinsRegular,
  },
});
