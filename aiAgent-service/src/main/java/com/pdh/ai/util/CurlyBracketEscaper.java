package com.pdh.ai.util;

public final class CurlyBracketEscaper {

    private CurlyBracketEscaper() {
        // prevents instantiation.
    }

    /**
     * Escapes all curly brackets in the input string by adding a backslash before them
     * @param input The string containing curly brackets to escape
     * @return The string with escaped curly brackets
     */
    public static String escapeCurlyBrackets(String input) {
        if (input == null) {
            return null;
        }
        return input.replace("{", "\\{").replace("}", "\\}");
    }

    /**
     * Unescapes previously escaped curly brackets by removing the backslashes
     * @param input The string containing escaped curly brackets
     * @return The string with unescaped curly brackets
     */
    public static String unescapeCurlyBrackets(String input) {
        if (input == null) {
            return null;
        }
        return input.replace("\\{", "{").replace("\\}", "}");
    }

}
