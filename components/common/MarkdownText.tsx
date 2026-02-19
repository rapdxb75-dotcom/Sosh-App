import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface MarkdownTextProps {
  content: string;
  className?: string;
}

export const MarkdownText: React.FC<MarkdownTextProps> = ({
  content,
  className,
}) => {
  const parseMarkdown = (text: string) => {
    const lines = text.split("\n");
    const elements: React.ReactElement[] = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let codeBlockLang = "";
    let listLevel = 0;
    let inBlockquote = false;
    let blockquoteContent: string[] = [];

    lines.forEach((line, lineIndex) => {
      // Handle code blocks
      if (line.trim().startsWith("```")) {
        if (inCodeBlock) {
          // End code block
          elements.push(
            <View key={`code-${lineIndex}`} style={styles.codeBlock}>
              <Text style={styles.codeBlockText}>
                {codeBlockContent.join("\n")}
              </Text>
            </View>,
          );
          codeBlockContent = [];
          codeBlockLang = "";
          inCodeBlock = false;
        } else {
          // Start code block
          const match = line.match(/```(\w+)?/);
          codeBlockLang = match?.[1] || "";
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        return;
      }

      // Handle blockquotes
      if (line.trim().startsWith(">")) {
        if (!inBlockquote) {
          inBlockquote = true;
          blockquoteContent = [];
        }
        blockquoteContent.push(line.replace(/^>\s?/, ""));
        return;
      } else if (inBlockquote) {
        // End blockquote
        elements.push(
          <View key={`quote-${lineIndex}`} style={styles.blockquote}>
            <Text style={styles.blockquoteText}>
              {parseInlineMarkdown(blockquoteContent.join("\n"))}
            </Text>
          </View>,
        );
        blockquoteContent = [];
        inBlockquote = false;
      }

      // Handle horizontal rules
      if (
        line.trim() === "---" ||
        line.trim() === "***" ||
        line.trim() === "___"
      ) {
        elements.push(
          <View key={`hr-${lineIndex}`} style={styles.horizontalRule} />,
        );
        return;
      }

      // Handle headings
      const headingMatch = line.match(/^(#{1,6})\s+(.+)/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const headingText = headingMatch[2];
        elements.push(
          <Text
            key={lineIndex}
            style={[styles.heading, styles[`h${level}` as keyof typeof styles]]}
          >
            {parseInlineMarkdown(headingText)}
          </Text>,
        );
        return;
      }

      // Handle unordered lists
      const unorderedListMatch = line.match(/^(\s*)([-*+])\s+(.+)/);
      if (unorderedListMatch) {
        const indent = unorderedListMatch[1].length / 2;
        const content = unorderedListMatch[3];
        elements.push(
          <View
            key={lineIndex}
            style={[styles.listItem, { marginLeft: indent * 20 }]}
          >
            <Text style={styles.listBullet}>•</Text>
            <Text style={styles.listText}>{parseInlineMarkdown(content)}</Text>
          </View>,
        );
        return;
      }

      // Handle ordered lists
      const orderedListMatch = line.match(/^(\s*)(\d+)\.\s+(.+)/);
      if (orderedListMatch) {
        const indent = orderedListMatch[1].length / 2;
        const number = orderedListMatch[2];
        const content = orderedListMatch[3];
        elements.push(
          <View
            key={lineIndex}
            style={[styles.listItem, { marginLeft: indent * 20 }]}
          >
            <Text style={styles.listNumber}>{number}.</Text>
            <Text style={styles.listText}>{parseInlineMarkdown(content)}</Text>
          </View>,
        );
        return;
      }

      // Handle task lists
      const taskMatch = line.match(/^(\s*)-\s+\[([ xX])\]\s+(.+)/);
      if (taskMatch) {
        const checked = taskMatch[2].toLowerCase() === "x";
        const content = taskMatch[3];
        elements.push(
          <View key={lineIndex} style={styles.listItem}>
            <Text style={styles.taskCheckbox}>{checked ? "☑" : "☐"}</Text>
            <Text style={[styles.listText, checked && styles.taskCompleted]}>
              {parseInlineMarkdown(content)}
            </Text>
          </View>,
        );
        return;
      }

      // Handle empty lines
      if (line.trim() === "") {
        elements.push(<View key={lineIndex} style={styles.emptyLine} />);
        return;
      }

      // Handle regular paragraphs
      elements.push(
        <Text key={lineIndex} style={styles.paragraph}>
          {parseInlineMarkdown(line)}
        </Text>,
      );
    });

    // Handle unclosed blockquote
    if (inBlockquote && blockquoteContent.length > 0) {
      elements.push(
        <View key="quote-final" style={styles.blockquote}>
          <Text style={styles.blockquoteText}>
            {parseInlineMarkdown(blockquoteContent.join("\n"))}
          </Text>
        </View>,
      );
    }

    return elements;
  };

  const parseInlineMarkdown = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    let currentIndex = 0;
    let key = 0;

    // Regex patterns for inline markdown
    const patterns = [
      { regex: /\*\*\*(.+?)\*\*\*/g, style: styles.boldItalic },
      { regex: /___(.+?)___/g, style: styles.boldItalic },
      { regex: /\*\*(.+?)\*\*/g, style: styles.bold },
      { regex: /__(.+?)__/g, style: styles.bold },
      { regex: /\*(.+?)\*/g, style: styles.italic },
      { regex: /_(.+?)_/g, style: styles.italic },
      { regex: /~~(.+?)~~/g, style: styles.strikethrough },
      { regex: /`(.+?)`/g, style: styles.inlineCode },
    ];

    const segments: Array<{
      start: number;
      end: number;
      style: any;
      text: string;
    }> = [];

    // Find all matches
    patterns.forEach(({ regex, style }) => {
      let match;
      while ((match = regex.exec(text)) !== null) {
        segments.push({
          start: match.index,
          end: match.index + match[0].length,
          style,
          text: match[1],
        });
      }
    });

    // Sort segments by start position
    segments.sort((a, b) => a.start - b.start);

    // Build the result, avoiding overlaps
    let lastEnd = 0;
    segments.forEach((segment) => {
      // Don't overlap with previous segment
      if (segment.start >= lastEnd) {
        // Add plain text before this segment
        if (segment.start > lastEnd) {
          parts.push(
            <Text key={key++} style={styles.normalText}>
              {text.substring(lastEnd, segment.start)}
            </Text>,
          );
        }
        // Add styled segment
        parts.push(
          <Text key={key++} style={segment.style}>
            {segment.text}
          </Text>,
        );
        lastEnd = segment.end;
      }
    });

    // Add remaining text
    if (lastEnd < text.length) {
      parts.push(
        <Text key={key++} style={styles.normalText}>
          {text.substring(lastEnd)}
        </Text>,
      );
    }

    return parts.length > 0 ? parts : [text];
  };

  return <View>{parseMarkdown(content)}</View>;
};

const styles = StyleSheet.create({
  heading: {
    color: "#FFFFFF",
    fontWeight: "bold",
    marginVertical: 8,
  },
  h1: {
    fontSize: 28,
    lineHeight: 36,
  },
  h2: {
    fontSize: 24,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    lineHeight: 28,
  },
  h4: {
    fontSize: 18,
    lineHeight: 26,
  },
  h5: {
    fontSize: 16,
    lineHeight: 24,
  },
  h6: {
    fontSize: 14,
    lineHeight: 22,
  },
  paragraph: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 24,
    marginVertical: 4,
  },
  normalText: {
    color: "#FFFFFF",
  },
  bold: {
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  italic: {
    fontStyle: "italic",
    color: "#FFFFFF",
  },
  boldItalic: {
    fontWeight: "bold",
    fontStyle: "italic",
    color: "#FFFFFF",
  },
  strikethrough: {
    textDecorationLine: "line-through",
    color: "#FFFFFF",
  },
  inlineCode: {
    fontFamily: "Courier",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    color: "#00DC82",
    fontSize: 14,
  },
  codeBlock: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#00DC82",
  },
  codeBlockText: {
    fontFamily: "Courier",
    color: "#00DC82",
    fontSize: 14,
    lineHeight: 20,
  },
  blockquote: {
    borderLeftWidth: 4,
    borderLeftColor: "rgba(255, 255, 255, 0.3)",
    paddingLeft: 12,
    marginVertical: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingVertical: 8,
  },
  blockquoteText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontStyle: "italic",
    fontSize: 16,
    lineHeight: 24,
  },
  horizontalRule: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginVertical: 16,
  },
  listItem: {
    flexDirection: "row",
    marginVertical: 2,
    alignItems: "flex-start",
  },
  listBullet: {
    color: "#FFFFFF",
    fontSize: 16,
    marginRight: 8,
    lineHeight: 24,
  },
  listNumber: {
    color: "#FFFFFF",
    fontSize: 16,
    marginRight: 8,
    lineHeight: 24,
    minWidth: 24,
  },
  listText: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 24,
    flex: 1,
  },
  taskCheckbox: {
    fontSize: 16,
    marginRight: 8,
    lineHeight: 24,
  },
  taskCompleted: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
  emptyLine: {
    height: 8,
  },
});
