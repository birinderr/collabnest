package com.collabnest.backend.controller;

import com.collabnest.backend.dto.CreateCampaignRequest;
import com.collabnest.backend.entity.Campaign;
import com.collabnest.backend.service.CampaignService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/campaigns")
@RequiredArgsConstructor
public class CampaignController {

    private final CampaignService campaignService;

    @PostMapping
    public Campaign createCampaign(
            @Valid @RequestBody CreateCampaignRequest request,
            Authentication authentication
    ) {
        return campaignService.createCampaign(
                request,
                authentication.getName()
        );
    }

    @GetMapping
    public List<Campaign> getAllCampaigns(Authentication authentication) {
        return campaignService.getAllCampaigns(
                authentication.getName()
        );
    }
}