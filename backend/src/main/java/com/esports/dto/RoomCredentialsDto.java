package com.esports.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomCredentialsDto {
    private String roomId;
    private String roomPassword;
    
    @JsonProperty("isUpdated")
    private boolean isUpdated;
    
    private String message;
}
