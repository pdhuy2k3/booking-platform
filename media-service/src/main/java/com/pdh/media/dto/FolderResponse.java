package com.pdh.media.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Response containing folder information")
public class FolderResponse {
    
    @Schema(description = "List of available folders")
    private List<Map<String, Object>> folders;
    
    @Schema(description = "Total number of folders", example = "5")
    private Integer totalFolders;
    
    @Schema(description = "Maximum folders limit applied")
    private Integer maxResults;
}
