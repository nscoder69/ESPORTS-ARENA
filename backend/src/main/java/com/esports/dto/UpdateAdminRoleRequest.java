package com.esports.dto;

import lombok.Data;

@Data
public class UpdateAdminRoleRequest {
    private String role;
    private String permissions;
}
