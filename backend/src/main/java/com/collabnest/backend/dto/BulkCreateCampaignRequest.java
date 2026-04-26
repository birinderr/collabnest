package com.collabnest.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class BulkCreateCampaignRequest {
    private List<CreateCampaignRequest> campaigns;
}