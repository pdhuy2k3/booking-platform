package com.pdh.ai.service;

import com.pdh.ai.model.dto.StructuredResultItem;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Component
public class ToolResultCollector {

    private final ThreadLocal<List<StructuredResultItem>> holder = ThreadLocal.withInitial(ArrayList::new);

    public void addResults(List<StructuredResultItem> results) {
        if (results == null || results.isEmpty()) {
            return;
        }
        holder.get().addAll(results);
    }

    public List<StructuredResultItem> consume() {
        List<StructuredResultItem> current = holder.get();
        if (current.isEmpty()) {
            holder.remove();
            return Collections.emptyList();
        }
        List<StructuredResultItem> copy = List.copyOf(current);
        holder.remove();
        return copy;
    }

    public void clear() {
        holder.remove();
    }
}
