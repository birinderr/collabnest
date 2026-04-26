package com.collabnest.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ParsedCampaignDto {

    private String brandName;
    private String campaignName;
    private String platform;
    private String contentType;
    private String deadline;
    private Double amount;
    private String notes;
}