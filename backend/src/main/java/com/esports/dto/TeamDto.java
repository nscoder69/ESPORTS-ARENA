package com.esports.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class TeamDto {
    private UUID id;
    private String name;
    private String logoUrl;
    private UUID captainId;
    private String inviteCode;
    private String captainFreeFireUid;
}
